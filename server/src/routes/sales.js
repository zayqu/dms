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
<<<<<<< HEAD
      const { items, paymentMethod = 'Cash', customerName } = req.body;

      if (!items || !items.length) {
=======
      const {
        items,
        paymentMethod = 'Cash',
        paidAmount = 0,
        customerName,
        saleDate
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
        return res.status(400).json({ error: 'Items required' });
      }

      let total = 0;

<<<<<<< HEAD
=======
      // validate stock
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          tenantId: req.tenantId
        });
<<<<<<< HEAD
        if (!product) throw new Error('Product not found');
=======

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

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

        const available = (ledger[0]?.in || 0) - (ledger[0]?.out || 0);

        if (available < item.qty) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name}`
          });
        }
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6

        total += item.qty * item.unitPrice;
      }

<<<<<<< HEAD
=======
      // ✅ CREATE SALE (NO Transaction)
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
      const sale = await Sale.create({
        tenantId: req.tenantId,
        items,
        total,
        paymentMethod,
<<<<<<< HEAD
        customerName,
        createdBy: req.userId
      });

=======
        paidAmount,
        customerName,
        createdBy: req.userId,
        date: saleDate || new Date()
      });

      // reduce stock
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
      for (const item of items) {
        await StockLedger.create({
          tenantId: req.tenantId,
          productId: item.productId,
          type: 'SALE',
<<<<<<< HEAD
          quantityOut: item.qty,
          quantityIn: 0,
          reference: `SALE-${sale._id}`,
          createdBy: req.userId
        });
      }

      res.status(201).json({ message: 'Sale completed', sale });
=======
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
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
    } catch (err) {
      console.error('sale error', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * List sales
<<<<<<< HEAD
=======
 * GET /api/sales
>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
<<<<<<< HEAD
    const list = await Sale.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 });
=======
    const list = await Sale.find({
      tenantId: req.tenantId
    }).sort({ createdAt: -1 });

>>>>>>> 162b92904ee869460e31a16ebfb2c5a4a1c203e6
    res.json(list);
  }
);

module.exports = router;
