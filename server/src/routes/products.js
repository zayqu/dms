const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');
const Product = require('../models/Product');

// create product (owner/admin)
router.post('/', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  const p = new Product({ ...req.body, tenantId: req.tenantId });
  await p.save();
  res.status(201).json(p);
});

// list (mobile uses this)
router.get('/', auth, tenantGuard, async (req, res) => {
  const items = await Product.find({ tenantId: req.tenantId }).sort({ name:1 });
  res.json(items);
});

// quick search
router.get('/search', auth, tenantGuard, async (req, res) => {
  const q = req.query.q || '';
  const items = await Product.find({ tenantId: req.tenantId, name: { $regex: q, $options: 'i' } }).limit(30);
  res.json(items);
});

// update stock/price (owner/admin)
router.patch('/:id', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  const p = await Product.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!p) return res.status(404).json({ error: 'Not found' });
  Object.assign(p, req.body);
  await p.save();
  res.json(p);
});

module.exports = router;