import cors from 'cors';
import express from 'express';
import { createNominatimGeocoder } from './geocoding/nominatim.js';
import { errorHandler, notFound } from './middleware/index.js';
import { readOnlyRequests, securityMiddleware } from './middleware/security.js';
import { apiRouter } from './routes/index.js';

// rateLimits: overrides for RATE_LIMIT_DEFAULTS (tests use small values).
// trustProxy: number of reverse-proxy hops in front of the app, so rate limits see client IPs.
export function createApp({ corsOrigins = [], geocoder, geocoderOptions, reviewBoundaries = false, rateLimits, trustProxy = 0 } = {}) {
  const app = express();
  app.disable('x-powered-by');
  if (trustProxy) app.set('trust proxy', trustProxy);
  // One geocoder per app, so its rate limit and cache are shared by every request.
  app.locals.geocoder = geocoder ?? createNominatimGeocoder(geocoderOptions);
  // Only the in-memory development server may serve unlicensed boundaries, for local review.
  if (reviewBoundaries && process.env.NODE_ENV === 'production') throw new Error('Review boundaries are not allowed in production');
  app.locals.reviewBoundaries = Boolean(reviewBoundaries);

  const security = securityMiddleware(rateLimits);
  app.use(security.headers);
  app.use(cors({ origin: corsOrigins, methods: ['GET', 'HEAD', 'OPTIONS'] }));
  app.use(readOnlyRequests);
  app.use('/api', security.api);
  app.use('/api/places', security.places);
  app.use('/api', apiRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
