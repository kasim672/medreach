const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT from the httpOnly cookie (never from a header/localStorage —
 * that would defeat the httpOnly protection against XSS-based token theft).
 * Attaches { id, role, managedHospital } to req.user on success.
 */
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.medreach_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

/** Role-based access control. Usage: requireRole('hospital_admin') */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
