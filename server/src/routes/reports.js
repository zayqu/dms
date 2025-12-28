// dms/server/src/routes/reports.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const calc = require('../utils/calculations');
const mongoose = require('mongoose');

// dashboard KPIs (owner/admin)
router.get('/dashboard', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const tenantId = mongoose.Types.ObjectId(req.tenantId);
    const txs = await Transaction.find({ tenantId }).populate('items.productId').lean();
    const sales = txs.filter(t => t.type === 'sale');
    let revenue = 0, cogs = 0;
    sales.forEach(s => {
      revenue += s.total || 0;
      (s.items || []).forEach(it => {
        const prod = it.productId;
        const buyP = prod ? (prod.buyPrice || 0) : (it.unitPrice || 0);
        cogs += (it.qty || 0) * buyP;
      });
    });
    const expenses = await Expense.find({ tenantId }).lean();
    const totalExpenses = (expenses || []).reduce((s,e)=>s+(e.amount||0),0);
    const netProfitVal = calc.netProfit(revenue, cogs, totalExpenses);
    const products = await Product.find({ tenantId }).lean();
    const inventoryValue = (products || []).reduce((s,p)=>s + ((p.stock||0) * (p.buyPrice||0)), 0);
    res.json({
      revenue, cogs, totalExpenses, netProfit: netProfitVal,
      netProfitMargin: calc.netProfitMargin(netProfitVal, revenue),
      inventoryValue, productCount: products.length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// monthly revenue for last 12 months
router.get('/monthly', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const tenantId = mongoose.Types.ObjectId(req.tenantId);
    const agg = await Transaction.aggregate([
      { $match: { tenantId, type: 'sale' } },
      { $project: { total: 1, yearMonth: { $dateToString: { format: "%Y-%m", date: "$date" } } } },
      { $group: { _id: "$yearMonth", total: { $sum: "$total" } } },
      { $sort: { _id: 1 } }
    ]);
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; --i) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toISOString().slice(0,7);
      months.push(label);
    }
    const totalsMap = {};
    (agg || []).forEach(r => { totalsMap[r._id] = r.total; });
    const totals = months.map(m => Math.round(totalsMap[m] || 0));
    res.json({ months, totals });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// payment method breakdown (sum of sale totals grouped by paymentMethod)
router.get('/payment-breakdown', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const tenantId = mongoose.Types.ObjectId(req.tenantId);
    const agg = await Transaction.aggregate([
      { $match: { tenantId, type: 'sale' } },
      { $group: { _id: "$paymentMethod", total: { $sum: "$total" } } },
      { $sort: { total: -1 } }
    ]);
    const labels = (agg || []).map(r => r._id || 'Unknown');
    const values = (agg || []).map(r => Math.round(r.total || 0));
    res.json({ labels, values });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NEW: counts and revenue for today, this week, this month
router.get('/counts', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const tenantId = mongoose.Types.ObjectId(req.tenantId);
    const now = new Date();
    // start of today (local)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // start of week (ISO week start Monday) - compute Monday of current week
    const day = now.getDay(); // 0 (Sun) .. 6 (Sat)
    const diffToMonday = (day === 0 ? -6 : 1 - day); // if Sunday, go back 6 days
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);
    // start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // helper aggregation
    const buildAgg = async (startDate) => {
      const match = { tenantId, type: 'sale', date: { $gte: startDate, $lte: now } };
      const agg = await Transaction.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
      ]);
      if (!agg || agg.length === 0) return { revenue: 0, count: 0 };
      return { revenue: Math.round(agg[0].total || 0), count: agg[0].count || 0 };
    };
    const [today, thisWeek, thisMonth] = await Promise.all([
      buildAgg(startOfToday),
      buildAgg(startOfWeek),
      buildAgg(startOfMonth)
    ]);
    res.json({ today, thisWeek, thisMonth });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;