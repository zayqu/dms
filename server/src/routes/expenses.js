const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');
const Expense = require('../models/Expense');

// create expense (seller & admin)
router.post('/', auth, tenantGuard, requireRole(['seller','admin','owner']), async (req, res) => {
  const { description, amount, category } = req.body;
  const e = new Expense({ tenantId: req.tenantId, description, amount, category, createdBy: req.userId });
  await e.save();
  res.status(201).json(e);
});

// list
router.get('/', auth, tenantGuard, requireRole(['seller','admin','owner']), async (req, res) => {
  const list = await Expense.find({ tenantId: req.tenantId }).sort({ date: -1 }).limit(200);
  res.json(list);
});

module.exports = router;