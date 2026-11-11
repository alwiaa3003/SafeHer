import dotenv from 'dotenv';
import { z } from 'zod';

const schema = z.object({
  MONGODB_URI: z
    .string({ error: 'MONGODB_URI is required' })
    .regex(/^mongodb(\+srv)?:\/\//, 'MONGODB_URI must be a MongoDB connection string'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
  NODE_ENV: z.string().default('development'),
  // Switchable at the provider's request, as the Nominatim usage policy requires.
  GEOCODER_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  // Optional contact (a URL or email) added to the User-Agent that identifies SafeHer.
  GEOCODER_CONTACT: z.string().trim().max(200).optional(),
  // Development only: path to an unlicensed boundary copy for local review. See the check below.
  SAFEHER_REVIEW_DISTRICT_BOUNDARIES: z.string().optional(),
  // Number of reverse-proxy hops in front of the API (often 1 on a hosting platform), so rate
  // limits apply per client rather than to the proxy. 0 when the API faces clients directly.
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  // Requests per client: all API routes per 15 minutes, and place search per minute.
  RATE_LIMIT_API: z.coerce.number().int().min(10).max(100000).default(600),
  RATE_LIMIT_PLACES: z.coerce.number().int().min(1).max(1000).default(20),
});

const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Each allowed origin must be an exact scheme://host[:port]. A wildcard is never accepted, and a
// production deployment accepts only https origins (plus local addresses for a local check).
function parseOrigins(value, nodeEnv) {
  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  for (const origin of origins) {
    if (origin === '*' || !/^https?:\/\/[^/\s*]+$/.test(origin)) {
      throw new Error(`Invalid environment configuration: CORS_ORIGINS entry "${origin}" must be an exact origin such as https://example.org`);
    }
    if (nodeEnv === 'production' && !origin.startsWith('https://') && !LOCAL_ORIGIN.test(origin)) {
      throw new Error(`Invalid environment configuration: CORS_ORIGINS entry "${origin}" must use https in production`);
    }
  }
  return origins;
}

export function loadConfig(source) {
  if (!source) dotenv.config({ quiet: true });
  const parsed = schema.safeParse(source ?? process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Invalid environment configuration: ${problems}`);
  }
  const { MONGODB_URI, PORT, CORS_ORIGINS, NODE_ENV, GEOCODER_URL, GEOCODER_CONTACT, SAFEHER_REVIEW_DISTRICT_BOUNDARIES, TRUST_PROXY, RATE_LIMIT_API, RATE_LIMIT_PLACES } = parsed.data;
  // A review-boundary path left in a production environment is a configuration error, not
  // something to ignore quietly: the production server never serves review geometry.
  if (NODE_ENV === 'production' && SAFEHER_REVIEW_DISTRICT_BOUNDARIES) {
    throw new Error('Invalid environment configuration: SAFEHER_REVIEW_DISTRICT_BOUNDARIES must not be set in production');
  }
  return {
    mongodbUri: MONGODB_URI,
    port: PORT,
    corsOrigins: parseOrigins(CORS_ORIGINS, NODE_ENV),
    nodeEnv: NODE_ENV,
    trustProxy: TRUST_PROXY,
    rateLimits: { api: RATE_LIMIT_API, places: RATE_LIMIT_PLACES },
    geocoder: {
      baseUrl: GEOCODER_URL.replace(/\/$/, ''),
      userAgent: `SafeHer/0.1 (academic research prototype${GEOCODER_CONTACT ? `; ${GEOCODER_CONTACT}` : ''})`,
    },
  };
}
