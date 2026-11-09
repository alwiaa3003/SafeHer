import dotenv from 'dotenv';
import { z } from 'zod';

const schema = z.object({
  MONGODB_URI: z
    .string({ error: 'MONGODB_URI is required' })
    .regex(/^mongodb(\+srv)?:\/\//, 'MONGODB_URI must be a MongoDB connection string'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
  NODE_ENV: z.string().default('development'),
});

export function loadConfig(source) {
  if (!source) dotenv.config({ quiet: true });
  const parsed = schema.safeParse(source ?? process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Invalid environment configuration: ${problems}`);
  }
  const { MONGODB_URI, PORT, CORS_ORIGINS, NODE_ENV } = parsed.data;
  return {
    mongodbUri: MONGODB_URI,
    port: PORT,
    corsOrigins: CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
    nodeEnv: NODE_ENV,
  };
}
