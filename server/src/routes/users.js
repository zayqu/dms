const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const tenantGuard = require('../middleware/tenantGuard');
const User = require('../models/User');

// list users (owner/admin within tenant)
router.get('/', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  const list = await User.find({ tenantId: req.tenantId }).select('-passwordHash');
  res.json(list);
});

// create user (owner/admin)
router.post('/', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  const { name, email, password, role='seller', language='en' } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email exists' });
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(password || (Math.random().toString(36).slice(-8)+'A1'), 10);
  const u = new User({ name, email, passwordHash: hash, role, language, tenantId: req.tenantId });
  await u.save();
  res.status(201).json({ user: u.toObject() });
});

// patch user (extend trial or change role)
router.patch('/:id', auth, tenantGuard, requireRole(['owner','admin']), async (req, res) => {
  const { id } = req.params;
  const { role, extendDays } = req.body;
  const u = await User.findOne({ _id: id, tenantId: req.tenantId });
  if (!u) return res.status(404).json({ error: 'Not found' });
  if (role) u.role = role;
  if (extendDays) {
    const now = new Date(); const current = u.trialEndsAt && u.trialEndsAt>now?u.trialEndsAt:now;
    u.trialEndsAt = new Date(current.getTime() + Number(extendDays)*24*3600*1000);
  }
  await u.save();
  res.json({ user: u.toObject() });
});

module.exports = router;