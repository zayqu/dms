const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

router.get(
  '/finance',
  auth,
  tenantGuard,
  requireRole(['owner','admin']),
  async (req, res) => {
    try {
      const tenantId = req.tenantId;

      // Revenue
      const sales = await Sale.find({ tenantId });
      const revenue = sales.reduce((a, s) => a + s.total, 0);

      // Cash received
      const payments = await Payment.find({ tenantId });
      const cash = payments.reduce((a, p) => a + p.amount, 0);

      // Expenses
      const expenses = await Expense.find({ tenantId });
      const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);

      // Inventory value
      const products = await Product.find({ tenantId });
      let inventoryValue = 0;

      for (const p of products) {
        const ledger = await StockLedger.aggregate([
          { $match: { tenantId, productId: p._id } },
          { $group: { _id: null, in: { $sum: '$quantityIn' }, out: { $sum: '$quantityOut' } } }
        ]);
        const available = (ledger[0]?.in || 0) - (ledger[0]?.out || 0);
        inventoryValue += available * (p.buyPrice || 0);
      }

      const grossProfit = revenue - inventoryValue;
      const netProfit = grossProfit - totalExpenses;

      res.json({
        revenue,
        cash,
        expenses: totalExpenses,
        inventoryValue,
        grossProfit,
        netProfit
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
