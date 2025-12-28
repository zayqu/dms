const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const Tenant = require('../models/Tenant');
const PasswordResetToken = require('../models/PasswordResetToken');

const auth = require('../middleware/auth');
const { JWT_SECRET } = require('../config');
const mailer = require('../utils/mailer');

function sha256hex(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

/**
 * REGISTER TENANT + OWNER
 */
router.post('/register', async (req, res) => {
  try {
    const { tenantName, name, email, password, language = 'en' } = req.body;

    if (!tenantName || !name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const tenant = await Tenant.create({ name: tenantName });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'owner',
      tenantId: tenant._id,
      language
    });

    const token = jwt.sign(
      { id: user._id, tenantId: tenant._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '07d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * LOGIN
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: { $ne: false } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '07d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * CURRENT USER
 */
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

/**
 * REQUEST PASSWORD RESET
 */
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true });

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256hex(token);

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 3600 * 1000)
  });

  if (mailer?.isConfigured) {
    await mailer.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token
    });
  } else {
    console.log('DEV RESET TOKEN:', token);
  }

  res.json({ ok: true });
});

/**
 * RESET PASSWORD
 */
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const tokenHash = sha256hex(token);
  const record = await PasswordResetToken.findOne({ tokenHash });

  if (!record || record.used || record.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const user = await User.findById(record.userId);
  if (!user) return res.status(400).json({ error: 'User not found' });

  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();

  record.used = true;
  await record.save();

  const jwtToken = jwt.sign(
    { id: user._id, tenantId: user.tenantId, role: user.role },
    JWT_SECRET,
    { expiresIn: '07d' }
  );

  res.json({ ok: true, token: jwtToken });
});

module.exports = router;
