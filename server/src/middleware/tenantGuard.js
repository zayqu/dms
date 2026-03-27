module.exports = function tenantGuard(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.user.location) {
      return res.status(400).json({ error: 'User has no location assigned' });
    }

    // attach location for use in routes
    req.locationId = req.user.location;

    next();

  } catch (err) {
    return res.status(500).json({ error: 'Tenant guard failed' });
  }
};