const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

/**
 * GET /api/reports/dashboard
 */
router.get('/dashboard', auth, tenantGuard, requireRole(['owner','admin','seller']), async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Revenue & profit
    const sales = await Sale.find({ tenantId });
    const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);

    const expenses = await Expense.find({ tenantId });
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // Inventory value
    const products = await Product.find({ tenantId });
    let inventoryValue = 0;
    for (const p of products) {
      const ledger = await StockLedger.aggregate([
        { $match: { tenantId, productId: p._id } },
        { $group: { _id: null, in: { $sum: '$quantityIn' }, out: { $sum: '$quantityOut' } } }
      ]);
      const available = (ledger[0]?.in || 0) - (ledger[0]?.out || 0);
      inventoryValue += available * (p.costPrice || 0);
    }

    const grossProfit = totalRevenue - inventoryValue;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    res.json({
      revenue: totalRevenue,
      totalExpenses,
      netProfit,
      grossProfit,
      profitMargin,
      inventoryValue,
      productCount: products.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
