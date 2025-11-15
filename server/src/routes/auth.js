const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const PasswordResetToken = require('../models/PasswordResetToken');
const { JWT_SECRET } = require('../config');
const { sendPasswordResetEmail, isConfigured } = require('../utils/mailer') || {};

function sha256hex(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

// tenant + owner register (creates tenant)
router.post('/register', async (req, res) => {
  try {
    const { tenantName, name, email, password, language='en' } = req.body;
    if (!tenantName || !name || !email || !password) return res.status(400).json({ error: 'Missing' });
    const t = new Tenant({ name: tenantName });
    await t.save();
    const hash = await bcrypt.hash(password, 10);
    const u = new User({ name, email, passwordHash: hash, role: 'owner', tenantId: t._id, language });
    await u.save();
    const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// me
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const u = await User.findById(req.userId).select('-passwordHash');
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ user: u });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// request password reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const u = await User.findOne({ email });
    if (!u) return res.json({ ok: true });
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256hex(token);
    await PasswordResetToken.create({ userId: u._id, tokenHash, expiresAt: new Date(Date.now()+3600*1000) });
    if (isConfigured) {
      try { await sendPasswordResetEmail({ to: u.email, name: u.name, token }); } catch(e){ console.error('mail send error', e); }
    } else {
      console.log('DEV reset token:', token); // dev helper if SMTP not configured
    }
    return res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// reset password (returns JWT for auto login)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || String(password).length < 8) return res.status(400).json({ error: 'Invalid' });
    const tokenHash = sha256hex(token);
    const rec = await PasswordResetToken.findOne({ tokenHash });
    if (!rec || rec.used || rec.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired' });
    const u = await User.findById(rec.userId);
    if (!u) return res.status(400).json({ error: 'User not found' });
    u.passwordHash = await bcrypt.hash(password, 10);
    await u.save();
    rec.used = true; await rec.save();
    const jwtToken = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token: jwtToken });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;