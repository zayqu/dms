const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Purchase = require('../models/Purchase');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');

/**
 * Create purchase
 * POST /api/purchases
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const {
        supplierName,
        items,
        paymentMethod = 'Cash',
        paidAmount = 0,
        purchaseDate
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items required' });
      }

      let totalAmount = 0;

      // validate products & compute total
      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          tenantId: req.tenantId
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        totalAmount += item.quantity * item.unitCost;
      }

      const purchase = await Purchase.create({
        tenantId: req.tenantId,
        supplierName,
        items,
        totalAmount,
        paidAmount,
        balance: totalAmount - paidAmount,
        paymentMethod,
        createdBy: req.userId,
        purchaseDate: purchaseDate || new Date()
      });

      // update stock ledger
      for (const item of items) {
        await StockLedger.create({
          tenantId: req.tenantId,
          productId: item.productId,
          type: 'PURCHASE',
          quantityIn: item.quantity,
          quantityOut: 0,
          unitCost: item.unitCost,
          reference: `PURCHASE-${purchase._id}`,
          createdBy: req.userId,
          date: purchase.purchaseDate
        });
      }

      res.status(201).json({
        message: 'Purchase recorded',
        purchase
      });
    } catch (err) {
      console.error('purchase error', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * List purchases
 * GET /api/purchases
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const list = await Purchase.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 });

    res.json(list);
  }
);

module.exports = router;
