// File: dms/server/src/routes/pending.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');
const PendingItem = require('../models/PendingItem');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// CLIENT: save a pending item for tenant (seller or client can call when they cannot finish)
router.post('/', auth, tenantGuard, requireRole(['seller','admin','owner']), async (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type || !payload) return res.status(400).json({ error: 'type and payload required' });
    const p = new PendingItem({ tenantId: req.tenantId, createdBy: req.userId, type, payload });
    await p.save();
    return res.status(201).json({ ok:true, id: p._id });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ADMIN: list pending for tenant
router.get('/', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const items = await PendingItem.find({ tenantId: req.tenantId }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADMIN: process a single pending item (attempts to create Transaction from payload)
router.post('/:id/process', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const id = req.params.id;
    const item = await PendingItem.findOne({ _id: id, tenantId: req.tenantId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.status === 'done') return res.json({ ok:true, message:'Already done' });

    // mark processing
    item.status = 'processing';
    await item.save();

    // only implement transaction processing for now
    if (item.type === 'transaction') {
      const { type, items, paymentMethod, reference } = item.payload;
      if (!['sale','purchase'].includes(type)) {
        item.status = 'failed';
        item.lastError = 'Invalid transaction type';
        await item.save();
        return res.status(400).json({ error: 'Invalid transaction type' });
      }

      // Check and update stock for sale/purchase
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        let total = 0;
        for (const it of items) {
          const p = await Product.findOne({ _id: it.productId, tenantId: req.tenantId }).session(session);
          if (!p) throw new Error('Product not found: ' + String(it.productId));
          // compute total
          total += Number(it.qty) * Number(it.unitPrice || p.sellPrice || 0);
          if (type === 'sale') {
            if (p.stock < it.qty) throw new Error(`Insufficient stock for ${p.name}`);
            p.stock -= it.qty;
          } else {
            p.stock += it.qty;
          }
          await p.save({ session });
        }

        // create transaction
        const tx = new Transaction({
          tenantId: req.tenantId,
          type,
          items: items.map(it => ({ productId: it.productId, qty: it.qty, unitPrice: it.unitPrice })),
          total,
          paymentMethod: paymentMethod || 'Other',
          reference: reference || '',
          createdBy: req.userId
        });
        await tx.save({ session });

        item.status = 'done';
        item.lastError = null;
        await item.save({ session });
        await session.commitTransaction();
        session.endSession();
        return res.json({ ok:true, txId: tx._id });
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        item.status = 'failed';
        item.lastError = err.message;
        await item.save();
        return res.status(400).json({ error: err.message });
      }
    } else {
      // Unknown type: mark failed
      item.status = 'failed';
      item.lastError = 'Unknown type';
      await item.save();
      return res.status(400).json({ error: 'Unknown type' });
    }
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ADMIN: delete pending
router.delete('/:id', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  try {
    const id = req.params.id;
    await PendingItem.deleteOne({ _id: id, tenantId: req.tenantId });
    res.json({ ok:true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
