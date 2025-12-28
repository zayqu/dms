const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Sale = require('../models/Sale');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');

/**
 * Create sale (POS)
 * POST /api/sales
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin', 'seller']),
  async (req, res) => {
    try {
      const { items, paymentMethod = 'Cash', customerName } = req.body;

      if (!items || !items.length) {
        return res.status(400).json({ error: 'Items required' });
      }

      let total = 0;

      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          tenantId: req.tenantId
        });
        if (!product) throw new Error('Product not found');

        total += item.qty * item.unitPrice;
      }

      const sale = await Sale.create({
        tenantId: req.tenantId,
        items,
        total,
        paymentMethod,
        customerName,
        createdBy: req.userId
      });

      for (const item of items) {
        await StockLedger.create({
          tenantId: req.tenantId,
          productId: item.productId,
          type: 'SALE',
          quantityOut: item.qty,
          quantityIn: 0,
          reference: `SALE-${sale._id}`,
          createdBy: req.userId
        });
      }

      res.status(201).json({ message: 'Sale completed', sale });
    } catch (err) {
      console.error('sale error', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * List sales
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const list = await Sale.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 });
    res.json(list);
  }
);

module.exports = router;
