const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const hdr = req.headers.authorization;

    if (!hdr) {
      return res.status(401).json({ error: 'No token' });
    }

    const parts = hdr.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Bad token format' });
    }

    const token = parts[1];

    const payload = jwt.verify(token, JWT_SECRET);

    // 🔥 IMPORTANT: load full user
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'User disabled' });
    }

    // attach full user (used everywhere)
    req.user = user;

    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};