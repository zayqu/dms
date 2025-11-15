const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// create transaction (seller & admin)
router.post('/', auth, tenantGuard, requireRole(['seller','admin','owner']), async (req, res) => {
  const { type, items, paymentMethod, reference } = req.body;
  if (!['sale','purchase'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
  let total = 0;
  for (const it of items) total += Number(it.qty) * Number(it.unitPrice);
  // update stock
  for (const it of items) {
    const p = await Product.findOne({ _id: it.productId, tenantId: req.tenantId });
    if (!p) return res.status(400).json({ error: 'Product not found' });
    if (type === 'sale') {
      if (p.stock < it.qty) return res.status(400).json({ error: `Insufficient stock for ${p.name}` });
      p.stock -= it.qty;
    } else {
      p.stock += it.qty;
    }
    await p.save();
  }
  const tx = new Transaction({ tenantId: req.tenantId, type, items: items.map(it => ({ productId: it.productId, qty: it.qty, unitPrice: it.unitPrice })), total, paymentMethod, reference, createdBy: req.userId });
  await tx.save();
  res.status(201).json(tx);
});

// list
router.get('/', auth, tenantGuard, requireRole(['seller','admin','owner']), async (req, res) => {
  const list = await Transaction.find({ tenantId: req.tenantId }).sort({ date: -1 }).limit(200);
  res.json(list);
});

module.exports = router;