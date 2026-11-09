import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { connectDatabase, databaseState, disconnectDatabase } from '../src/config/database.js';
import { loadConfig } from '../src/config/env.js';

describe('configuration', () => {
  it('requires MONGODB_URI', () => {
    expect(() => loadConfig({})).toThrow(/MONGODB_URI/);
  });

  it('rejects a value that is not a MongoDB connection string', () => {
    expect(() => loadConfig({ MONGODB_URI: 'http://example.com' })).toThrow(/MongoDB connection string/);
  });

  it('reads settings from the environment', () => {
    const config = loadConfig({ MONGODB_URI: 'mongodb://127.0.0.1:27017/x', PORT: '4100', CORS_ORIGINS: 'http://a, http://b' });
    expect(config).toMatchObject({ port: 4100, corsOrigins: ['http://a', 'http://b'] });
  });
});

describe('database connection handling', () => {
  it('rejects an empty connection string', () => {
    expect(() => connectDatabase('')).toThrow(/connection string/);
  });

  it('fails cleanly when MongoDB cannot be reached', async () => {
    await expect(
      connectDatabase('mongodb://127.0.0.1:1/safeher_unreachable', { serverSelectionTimeoutMS: 300 }),
    ).rejects.toThrow();
    await disconnectDatabase();
    expect(databaseState()).toBe('disconnected');
  });

  it('reports 503 and hides internals when the database is down', async () => {
    const app = createApp();
    const healthResponse = await request(app).get('/api/health');
    expect(healthResponse.status).toBe(503);
    expect(healthResponse.body).toEqual({ status: 'degraded', api: 'ok', database: { status: 'disconnected' } });

    const crimes = await request(app).get('/api/crimes');
    expect(crimes.status).toBe(503);
    expect(crimes.body.error.code).toBe('DATABASE_UNAVAILABLE');
    expect(JSON.stringify(crimes.body)).not.toMatch(/mongodb|127\.0\.0\.1/i);

    const geography = await request(app).get('/api/geography');
    expect(geography.status).toBe(503);
    expect(geography.body.error.code).toBe('DATABASE_UNAVAILABLE');
  });
});
