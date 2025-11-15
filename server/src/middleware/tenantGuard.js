// ensures req.user and attaches tenantId
const User = require('../models/User');
module.exports = async function tenantGuard(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const u = await User.findById(req.userId);
  if (!u) return res.status(401).json({ error: 'User not found' });
  req.user = u;
  req.tenantId = u.tenantId;
  next();
};