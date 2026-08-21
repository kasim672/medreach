const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospitals');
const alertRoutes = require('./routes/alerts');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // Security headers. This is the concrete, testable answer to Table 5's
  // "Misconfigured Security Settings" (P across all frameworks) - the paper
  // notes this risk is conditional on developer configuration; here we make
  // the configuration explicit and identical across all three frontend variants.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // frameworks' inline critical CSS; documented trade-off, see report
          imgSrc: ["'self'", 'data:', 'https://*.tile.openstreetmap.org'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
  app.use(
    cors({
      origin: allowedOrigins.length ? allowedOrigins : false,
      credentials: true, // required so httpOnly auth cookie is sent cross-origin (dev: different ports per variant)
    })
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/hospitals', hospitalRoutes);
  app.use('/api/alerts', alertRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
