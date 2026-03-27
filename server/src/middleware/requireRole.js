module.exports = function requireRole(allowed) {
  const roles = Array.isArray(allowed) ? allowed : [allowed];

  return function (req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();

    } catch (err) {
      return res.status(500).json({ error: 'Role check failed' });
    }
  };
};