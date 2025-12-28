const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Product = require('../models/Product');

/**
 * CREATE PRODUCT (Admin)
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const { name, sku, categoryId, trackStock = true } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name required' });

    const product = await Product.create({
      tenantId: req.tenantId,
      name,
      sku,
      categoryId,
      trackStock
    });

    res.status(201).json(product);
  }
);

/**
 * LIST PRODUCTS (Admin + Seller)
 */
router.get(
  '/',
  auth,
  tenantGuard,
  async (req, res) => {
    const products = await Product.find({
      tenantId: req.tenantId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(products);
  }
);

/**
 * UPDATE PRODUCT
 */
router.patch(
  '/:id',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  }
);

/**
 * SOFT DELETE PRODUCT
 */
router.delete(
  '/:id',
  auth,
  tenantGuard,
  requireRole(['owner']),
  async (req, res) => {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product disabled' });
  }
);

module.exports = router;
