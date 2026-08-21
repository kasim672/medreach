const rateLimit = require('express-rate-limit');

/**
 * Rate limiting on auth endpoints to mitigate brute-force credential attacks.
 * Table 5 of Almeida & S. (2026) rates "Weak Authentication and Session
 * Management" as N (not identified) for all frameworks because it's a
 * backend/session-layer concern outside CSS frameworks' scope — this
 * middleware is exactly the kind of control that lives in that layer.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts. Please try again later.' },
});

module.exports = { loginLimiter, registerLimiter };
