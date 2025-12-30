const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Sale = require('../models/Sale');
<<<<<<< HEAD
const Purchase = require('../models/Purchase');
=======
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

<<<<<<< HEAD
router.get(
  '/finance',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const tenantId = req.tenantId;

      const sales = await Sale.find({ tenantId });
      const revenue = sales.reduce((s, x) => s + x.total, 0);

      const purchases = await Purchase.find({ tenantId });
      const purchaseCost = purchases.reduce((s, x) => s + x.total, 0);

      const expenses = await Expense.find({ tenantId });
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

      const products = await Product.find({ tenantId });
      let inventoryValue = 0;

      for (const p of products) {
        const ledger = await StockLedger.aggregate([
          { $match: { tenantId, productId: p._id } },
          {
            $group: {
              _id: null,
              in: { $sum: '$quantityIn' },
              out: { $sum: '$quantityOut' }
            }
          }
        ]);

        const available = (ledger[0]?.in || 0) - (ledger[0]?.out || 0);
        inventoryValue += available * (p.buyPrice || 0);
      }

      res.json({
        revenue,
        purchaseCost,
        totalExpenses,
        inventoryValue,
        grossProfit: revenue - purchaseCost,
        netProfit: revenue - purchaseCost - totalExpenses
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

=======
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

>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
module.exports = router;
