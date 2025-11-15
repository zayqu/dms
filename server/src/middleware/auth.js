const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
module.exports = function (req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: 'No token' });
  const parts = hdr.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Bad token' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) { return res.status(401).json({ error: 'Invalid token' }); }
};
