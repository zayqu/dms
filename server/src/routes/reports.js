const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

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

module.exports = router;
