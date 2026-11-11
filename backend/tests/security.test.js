import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

const fakeGeocoder = (impl = async () => ({ value: [], cached: true })) => ({ search: vi.fn(impl), reverse: vi.fn(impl) });

describe('security headers', () => {
  it('sends hardened headers and hides the framework', async () => {
    const res = await request(createApp({ geocoder: fakeGeocoder() })).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toMatch(/default-src 'none'/);
    expect(res.headers['content-security-policy']).toMatch(/frame-ancestors 'none'/);
    expect(res.headers['strict-transport-security']).toMatch(/max-age=/);
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('rate limiting', () => {
  it('limits each client across the API, with standard headers and a JSON error', async () => {
    const app = createApp({ geocoder: fakeGeocoder(), rateLimits: { api: 3 } });
    for (let i = 0; i < 3; i += 1) expect((await request(app).get('/api/crimes')).status).toBe(503);
    const limited = await request(app).get('/api/crimes');
    expect(limited.status).toBe(429);
    expect(limited.body).toEqual({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment and try again.' } });
    expect(limited.headers.ratelimit).toMatch(/r=0/);
    expect(limited.headers['cache-control']).toBe('no-store');
  });

  it('never limits the health check', async () => {
    const app = createApp({ geocoder: fakeGeocoder(), rateLimits: { api: 2 } });
    for (let i = 0; i < 5; i += 1) expect((await request(app).get('/api/health')).status).toBe(503);
  });

  it('limits place search more tightly than the rest of the API', async () => {
    const geocoder = fakeGeocoder();
    const app = createApp({ geocoder, rateLimits: { places: 2 } });
    expect((await request(app).get('/api/places/search?q=India%20Gate')).status).toBe(200);
    expect((await request(app).get('/api/places/search?q=Red%20Fort')).status).toBe(200);
    expect((await request(app).get('/api/places/search?q=Qutub')).status).toBe(429);
    expect(geocoder.search).toHaveBeenCalledTimes(2);
    expect((await request(app).get('/api/crimes')).status).toBe(503);
  });
});

describe('request handling', () => {
  const app = createApp({ geocoder: fakeGeocoder() });

  it('refuses request bodies', async () => {
    const res = await request(app).get('/api/health').set('Content-Type', 'application/json').send('{"a":1}');
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('BODY_NOT_ACCEPTED');
  });

  it('rejects operator injection in query strings', async () => {
    for (const path of ['/api/crimes?reportingUnit[$ne]=x', '/api/police-districts/statistics?category[$gt]=', '/api/places/search?q[$regex]=.*']) {
      const res = await request(app).get(path);
      expect([400, 503]).toContain(res.status);
      expect(res.status === 503 || res.body.error.code === 'INVALID_QUERY').toBe(true);
    }
    // Place search needs no database, so the query is validated and refused.
    expect((await request(app).get('/api/places/search?q[$regex]=.*')).status).toBe(400);
  });

  it('answers malformed URLs with a safe client error, never a 500 or a stack trace', async () => {
    for (const path of ['/api/geography/%E0%A4%A', '/api/places/search?q=%E0%A4%A', '/api/%ZZ']) {
      const res = await request(app).get(path);
      expect(res.status).not.toBe(500);
      if (res.status >= 400) expect(['BAD_REQUEST', 'NOT_FOUND', 'DATABASE_UNAVAILABLE', 'INVALID_QUERY']).toContain(res.body.error.code);
      expect(JSON.stringify(res.body)).not.toMatch(/stack|URIError|at .*\.js/);
    }
  });

  it('hides unexpected errors behind a generic message', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const broken = createApp({ geocoder: fakeGeocoder(async () => { throw new Error('secret detail mongodb+srv://user:pw@host/db'); }) });
    const res = await request(broken).get('/api/places/search?q=India%20Gate');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
    expect(spy.mock.calls[0][0]).not.toMatch(/user:pw/);
    expect(spy.mock.calls[0][0]).toMatch(/connection string hidden/);
    spy.mockRestore();
  });

  it('keeps place-search responses out of shared caches', async () => {
    const res = await request(app).get('/api/places/search?q=India%20Gate');
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('production configuration', () => {
  const base = { MONGODB_URI: 'mongodb://localhost/x' };

  it('rejects wildcard or malformed CORS origins', () => {
    expect(() => loadConfig({ ...base, CORS_ORIGINS: '*' })).toThrow(/exact origin/);
    expect(() => loadConfig({ ...base, CORS_ORIGINS: 'https://example.org/path' })).toThrow(/exact origin/);
  });

  it('requires https origins in production, except local addresses', () => {
    expect(() => loadConfig({ ...base, NODE_ENV: 'production', CORS_ORIGINS: 'http://example.org' })).toThrow(/https in production/);
    expect(loadConfig({ ...base, NODE_ENV: 'production', CORS_ORIGINS: 'https://safeher.example.org,http://localhost:4173' }).corsOrigins).toEqual(['https://safeher.example.org', 'http://localhost:4173']);
  });

  it('accepts the committed .env.example as a valid development configuration', () => {
    const example = dotenv.parse(readFileSync(new URL('../.env.example', import.meta.url)));
    expect(loadConfig(example)).toMatchObject({ nodeEnv: 'development', trustProxy: 0, rateLimits: { api: 600, places: 20 } });
    expect(example.SAFEHER_REVIEW_DISTRICT_BOUNDARIES).toBeUndefined();
  });

  it('reads proxy and rate-limit settings with safe defaults', () => {
    expect(loadConfig(base)).toMatchObject({ trustProxy: 0, rateLimits: { api: 600, places: 20 } });
    expect(loadConfig({ ...base, TRUST_PROXY: '1', RATE_LIMIT_API: '300', RATE_LIMIT_PLACES: '10' })).toMatchObject({ trustProxy: 1, rateLimits: { api: 300, places: 10 } });
    expect(() => loadConfig({ ...base, RATE_LIMIT_API: '0' })).toThrow();
  });
});
