/**
 * Centralized error handler. Never leaks stack traces or internal error
 * details to the client in production — this is a common misconfiguration
 * ("Misconfigured Security Settings", rated P in Table 5) that this backend
 * deliberately controls for, independent of which CSS framework the request
 * originated from.
 */
function errorHandler(err, req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production';
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.status || 500).json({
    error: isProd ? 'Internal server error.' : err.message,
  });
}

function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Resource not found.' });
}

module.exports = { errorHandler, notFoundHandler };
