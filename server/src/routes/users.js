const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const tenantGuard = require('../middleware/tenantGuard');

const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * LIST USERS
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const users = await User.find({
      tenantId: req.tenantId,
      isActive: { $ne: false }
    }).select('-passwordHash');

    res.json(users);
  }
);

/**
 * CREATE USER
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const { name, email, password, role = 'seller', language = 'en' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email exists' });

    const generatedPassword =
      password || Math.random().toString(36).slice(-8) + 'A1';

    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      language,
      tenantId: req.tenantId
    });

    res.status(201).json({
      user: { ...user.toObject(), password: password ? undefined : generatedPassword }
    });
  }
);

/**
 * UPDATE USER
 */
router.patch(
  '/:id',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findOne({ _id: id, tenantId: req.tenantId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    res.json({ user });
  }
);

/**
 * SOFT DELETE USER
 */
router.delete(
  '/:id',
  auth,
  tenantGuard,
  requireRole(['owner']),
  async (req, res) => {
    const user = await User.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated' });
  }
);

module.exports = router;
