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
  requireRole(['owner','admin','seller']),
  async (req, res) => {
    try {
      const {
        items,
        paymentMethod = 'Cash',
        paidAmount = 0,
        customerName,
        saleDate
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items required' });
      }

      let total = 0;

      // validate stock
      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          tenantId: req.tenantId
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        // calculate available stock
        const ledger = await StockLedger.aggregate([
          { $match: { tenantId: req.tenantId, productId: product._id } },
          {
            $group: {
              _id: null,
              in: { $sum: '$quantityIn' },
              out: { $sum: '$quantityOut' }
            }
          }
        ]);

        const available =
          (ledger[0]?.in || 0) - (ledger[0]?.out || 0);

        if (available < item.qty) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name}`
          });
        }

        total += item.qty * item.unitPrice;
      }

      const sale = await Transaction.create({
        tenantId: req.tenantId,
        type: 'sale',
        items,
        total,
        paymentMethod,
        reference: customerName || 'POS',
        createdBy: req.userId,
        date: saleDate || new Date()
      });

      // reduce stock
      for (const item of items) {
        await StockLedger.create({
          tenantId: req.tenantId,
          productId: item.productId,
          type: 'SALE',
          quantityIn: 0,
          quantityOut: item.qty,
          unitCost: item.unitPrice,
          reference: `SALE-${sale._id}`,
          createdBy: req.userId,
          date: sale.date
        });
      }

      res.status(201).json({
        message: 'Sale completed',
        sale
      });
    } catch (err) {
      console.error('sale error', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * List sales
 * GET /api/sales
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner','admin']),
  async (req, res) => {
    const list = await Transaction.find({
      tenantId: req.tenantId,
      type: 'sale'
    }).sort({ createdAt: -1 });

    res.json(list);
  }
);

module.exports = router;
