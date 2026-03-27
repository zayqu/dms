const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const tenantGuard = require('../middleware/tenantGuard');

const User = require('../models/User');

/**
 * LIST USERS
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin']),
  async (req, res) => {
    try {
      const users = await User.find({
        location: req.locationId,
        status: 'active'
      });

      res.json(users);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
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
    try {
      const { name, email, password, role, phone } = req.body;

      if (!name || !email || !password || !role || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        location: req.locationId
      });

      res.status(201).json({ user });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
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
    try {
      const { id } = req.params;
      const { role, status, phone, name } = req.body;

      const user = await User.findOne({
        _id: id,
        location: req.locationId
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (role) user.role = role;
      if (status) user.status = status;
      if (phone) user.phone = phone;
      if (name) user.name = name;

      await user.save();

      res.json({ user });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
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
    try {
      const user = await User.findOne({
        _id: req.params.id,
        location: req.locationId
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.status = 'disabled';
      await user.save();

      res.json({ message: 'User disabled' });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;