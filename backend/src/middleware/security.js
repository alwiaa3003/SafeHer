import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

// Defaults for one public instance. They are generous for a person using the map (a page load
// makes under ten API calls) and low enough to slow scraping or abuse. Place search is tighter
// because every uncached search costs a request to the shared Nominatim service.
export const RATE_LIMIT_DEFAULTS = {
  windowMs: 15 * 60 * 1000,
  api: 600,
  placesWindowMs: 60 * 1000,
  places: 20,
};

function limitExceeded(_req, res, _next, options) {
  res.set('Cache-Control', 'no-store');
  res.status(options.statusCode).json({
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment and try again.' },
  });
}

function limiter(windowMs, limit, extra = {}) {
  return rateLimit({ windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false, handler: limitExceeded, ...extra });
}

export function securityMiddleware(limits = {}) {
  const config = { ...RATE_LIMIT_DEFAULTS, ...limits };
  return {
    // A JSON API: no scripts, frames or documents are served, so the strictest policy applies.
    headers: helmet({
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
    // The health check is exempt so a hosting platform's probes are never limited.
    api: limiter(config.windowMs, config.api, { skip: (req) => req.path === '/health' }),
    places: limiter(config.placesWindowMs, config.places),
  };
}

// Only GET, HEAD and OPTIONS are served. A request body is never read, so one is refused
// rather than silently ignored.
export function readOnlyRequests(req, res, next) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    res.set('Allow', 'GET, HEAD, OPTIONS');
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'The SafeHer API is read-only.' } });
    return;
  }
  const length = Number(req.headers['content-length'] ?? 0);
  if (length > 0 || req.headers['transfer-encoding']) {
    res.status(413).json({ error: { code: 'BODY_NOT_ACCEPTED', message: 'Requests to this API must not have a body.' } });
    return;
  }
  next();
}
