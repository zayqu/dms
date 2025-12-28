const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const ProductUnit = require('../models/ProductUnit');

/**
 * ADD UNIT TO PRODUCT
 * Example: Carton → 24 Pieces
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const {
      productId,
      unitId,
      conversionToBase,
      buyPrice = 0,
      sellPrice = 0,
      isDefaultSaleUnit = false,
      isDefaultPurchaseUnit = false
    } = req.body;

    if (!productId || !unitId || !conversionToBase) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isDefaultSaleUnit) {
      await ProductUnit.updateMany(
        { tenantId: req.tenantId, productId, isDefaultSaleUnit: true },
        { isDefaultSaleUnit: false }
      );
    }

    if (isDefaultPurchaseUnit) {
      await ProductUnit.updateMany(
        { tenantId: req.tenantId, productId, isDefaultPurchaseUnit: true },
        { isDefaultPurchaseUnit: false }
      );
    }

    const pu = await ProductUnit.create({
      tenantId: req.tenantId,
      productId,
      unitId,
      conversionToBase,
      buyPrice,
      sellPrice,
      isDefaultSaleUnit,
      isDefaultPurchaseUnit
    });

    res.status(201).json(pu);
  }
);

/**
 * LIST UNITS FOR A PRODUCT
 */
router.get(
  '/:productId',
  auth,
  tenantGuard,
  async (req, res) => {
    const list = await ProductUnit.find({
      tenantId: req.tenantId,
      productId: req.params.productId
    }).populate('unitId');

    res.json(list);
  }
);

/**
 * UPDATE PRODUCT UNIT
 */
router.patch(
  '/item/:id',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const pu = await ProductUnit.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!pu) return res.status(404).json({ error: 'Not found' });

    Object.assign(pu, req.body);
    await pu.save();

    res.json(pu);
  }
);

/**
 * DELETE PRODUCT UNIT
 */
router.delete(
  '/item/:id',
  auth,
  tenantGuard,
  requireRole(['owner']),
  async (req, res) => {
    const pu = await ProductUnit.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!pu) return res.status(404).json({ error: 'Not found' });

    await pu.deleteOne();
    res.json({ message: 'Product unit removed' });
  }
);

module.exports = router;
