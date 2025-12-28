const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Unit = require('../models/Unit');

/**
 * CREATE UNIT
 * Example: Carton, Piece, Kg
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const { name, symbol, isBase = false } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Unit name required' });
      }

      if (isBase) {
        // Ensure only ONE base unit per tenant
        await Unit.updateMany(
          { tenantId: req.tenantId, isBase: true },
          { isBase: false }
        );
      }

      const unit = await Unit.create({
        tenantId: req.tenantId,
        name,
        symbol,
        isBase
      });

      res.status(201).json(unit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * LIST UNITS (Admin + Seller)
 */
router.get(
  '/',
  auth,
  tenantGuard,
  async (req, res) => {
    const units = await Unit.find({ tenantId: req.tenantId }).sort({ isBase: -1 });
    res.json(units);
  }
);

/**
 * UPDATE UNIT
 */
router.patch(
  '/:id',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, symbol, isBase } = req.body;

      const unit = await Unit.findOne({ _id: id, tenantId: req.tenantId });
      if (!unit) return res.status(404).json({ error: 'Unit not found' });

      if (typeof isBase === 'boolean' && isBase === true) {
        await Unit.updateMany(
          { tenantId: req.tenantId, isBase: true },
          { isBase: false }
        );
      }

      if (name) unit.name = name;
      if (symbol) unit.symbol = symbol;
      if (typeof isBase === 'boolean') unit.isBase = isBase;

      await unit.save();
      res.json(unit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * DELETE UNIT (SAFE)
 */
router.delete(
  '/:id',
  auth,
  tenantGuard,
  requireRole(['owner']),
  async (req, res) => {
    const unit = await Unit.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    await unit.deleteOne();
    res.json({ message: 'Unit deleted' });
  }
);

module.exports = router;
