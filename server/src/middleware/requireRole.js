module.exports = function requireRole(allowed) {
  const arr = Array.isArray(allowed) ? allowed : [allowed];
  return async function (req, res, next) {
    const User = require('../models/User');
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
    const u = await User.findById(req.userId);
    if (!u) return res.status(401).json({ error: 'User not found' });
    if (!arr.includes(u.role)) return res.status(403).json({ error: 'Forbidden' });
    req.user = u;
    next();
  };
};