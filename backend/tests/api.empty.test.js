import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { startTestDb, stopTestDb } from './helpers/testDb.js';

const app = createApp();

beforeAll(startTestDb);
afterAll(stopTestDb);

describe('empty collections return no fabricated data', () => {
  it.each(['/api/crimes', '/api/crimes/categories', '/api/data-sources', '/api/validation'])(
    '%s returns an empty list',
    async (path) => {
      const response = await request(app).get(path);
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    },
  );

  it('trends returns an empty series', async () => {
    const response = await request(app).get('/api/crimes/trends?reportingUnit=Delhi%20UT');
    expect(response.status).toBe(200);
    expect(response.body.data.series).toEqual([]);
  });

  it('summary reports no latest value', async () => {
    const response = await request(app).get('/api/crimes/summary?reportingUnit=Delhi%20UT');
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ availableYears: [], missingYears: [], latest: null });
  });
});
