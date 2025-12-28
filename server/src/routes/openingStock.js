const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const OpeningStock = require('../models/OpeningStock');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');

/**
 * Create opening stock
 * POST /api/opening-stock
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const { productId, quantity, unitCost, date } = req.body;

      if (!productId || quantity == null || unitCost == null) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const product = await Product.findOne({
        _id: productId,
        tenantId: req.tenantId
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // prevent duplicate opening stock
      const exists = await OpeningStock.findOne({
        tenantId: req.tenantId,
        productId
      });

      if (exists) {
        return res.status(400).json({
          error: 'Opening stock already exists for this product'
        });
      }

      // save opening stock
      const opening = await OpeningStock.create({
        tenantId: req.tenantId,
        productId,
        quantity,
        unitCost,
        createdBy: req.userId,
        date: date || new Date()
      });

      // create stock ledger entry
      await StockLedger.create({
        tenantId: req.tenantId,
        productId,
        type: 'OPENING',
        quantityIn: quantity,
        quantityOut: 0,
        unitCost,
        reference: `OPENING-${opening._id}`,
        createdBy: req.userId,
        date: opening.date
      });

      res.status(201).json({
        message: 'Opening stock added',
        opening
      });
    } catch (err) {
      console.error('opening stock error', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * List opening stock
 * GET /api/opening-stock
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const list = await OpeningStock
      .find({ tenantId: req.tenantId })
      .populate('productId', 'name sku');

    res.json(list);
  }
);

module.exports = router;
