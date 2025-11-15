const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const calc = require('../utils/calculations');
const { COMPANY_FIXED_COSTS } = require('../config');

// dashboard KPIs (owner/admin)
router.get('/dashboard', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const txs = await Transaction.find({ tenantId: req.tenantId }).populate('items.productId');
    const sales = txs.filter(t => t.type === 'sale');
    let revenue = 0, cogs = 0;
    sales.forEach(s => {
      revenue += s.total;
      s.items.forEach(it => {
        const prod = it.productId;
        const buyP = prod ? prod.buyPrice : it.unitPrice;
        cogs += it.qty * (buyP || 0);
      });
    });
    const expenses = await Expense.find({ tenantId: req.tenantId });
    const totalExpenses = expenses.reduce((s,e)=>s+e.amount,0);
    const netProfitVal = calc.netProfit(revenue, cogs, totalExpenses);
    const products = await Product.find({ tenantId: req.tenantId });
    const inventoryValue = products.reduce((s,p)=>s + (p.stock * (p.buyPrice||0)), 0);
    const workingCapitalVal = calc.workingCapital(inventoryValue, 0);
    res.json({
      revenue, cogs, totalExpenses, netProfit: netProfitVal,
      netProfitMargin: calc.netProfitMargin(netProfitVal, revenue),
      inventoryValue, workingCapital: workingCapitalVal,
      productCount: products.length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;