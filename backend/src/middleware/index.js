import { isDatabaseReady } from '../config/database.js';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || (issue.keys ? issue.keys.join(', ') : 'query'),
        message: issue.message,
      }));
      next(new ApiError(400, 'INVALID_QUERY', 'One or more query parameters are invalid.', details));
      return;
    }
    req.validatedQuery = parsed.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
      next(new ApiError(400, 'INVALID_PARAMETER', 'One or more path parameters are invalid.', details));
      return;
    }
    req.validatedParams = parsed.data;
    next();
  };
}

export function requireDatabase(_req, _res, next) {
  if (isDatabaseReady()) {
    next();
    return;
  }
  next(new ApiError(503, 'DATABASE_UNAVAILABLE', 'The data service is temporarily unavailable.'));
}

// Published NCRB figures change only when a reviewed import runs, so short public caching is
// safe. Routes with other needs (health, place search, district data) set their own header.
export const cacheFor = (value) => (_req, res, next) => {
  res.set('Cache-Control', value);
  next();
};
export const PUBLIC_DATA_CACHE = 'public, max-age=300';

export function notFound(req, _res, next) {
  next(new ApiError(404, 'NOT_FOUND', 'This API route does not exist.'));
}

// Unexpected errors return a generic message so internals are not exposed.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  // Errors, including 503s while the database reconnects, must never be cached.
  res.set('Cache-Control', 'no-store');
  // Malformed requests rejected by Express itself (for example bad URL encoding) carry a 4xx status.
  if (!(error instanceof ApiError) && Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    res.status(error.status).json({ error: { code: 'BAD_REQUEST', message: 'The request could not be understood.' } });
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }
  // Logs only the message, with any connection string masked; never the request or its query.
  console.error(`Unhandled error: ${String(error.message).replace(/mongodb(\+srv)?:\/\/\S+/g, '[connection string hidden]')}`);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  });
}
