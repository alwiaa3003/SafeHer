import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { importApprovedAnnualTotals } from '../src/seed/importApproved.js';
import { createRecord, createSourceAndCategory } from './helpers/factories.js';
import { startTestDb, stopTestDb } from './helpers/testDb.js';

const app = createApp({ corsOrigins: ['http://localhost:5173'] });
const get = (path) => request(app).get(path);
const UT = 'reportingUnit=Delhi%20UT';

beforeAll(async () => {
  await startTestDb();
  await importApprovedAnnualTotals();
  // Printed NCRB Delhi City figures, held only in this in-memory test database.
  const { source, category } = await createSourceAndCategory();
  await createRecord(source, category);
});
afterAll(stopTestDb);

describe('health', () => {
  it('reports API and database status', async () => {
    const response = await get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', api: 'ok', database: { status: 'connected' } });
  });
});

describe('GET /api/crimes', () => {
  it('returns structured records with provenance', async () => {
    const response = await get(`/api/crimes?${UT}`);
    expect(response.status).toBe(200);
    expect(response.body.meta).toMatchObject({ total: 8, page: 1 });
    const first = response.body.data[0];
    expect(first).toMatchObject({ year: 2016, registeredCases: 15310, victims: null, originalValue: '15310', edition: 'Crime in India 2018', tableNumber: '3A.1', validationStatus: 'verified_with_note' });
    expect(first.evidence.path).toBeUndefined();
    expect(first.__v).toBeUndefined();
  });

  it('filters by year and keeps Delhi UT and Delhi City separate', async () => {
    const response = await get('/api/crimes?year=2024');
    expect(response.body.data.map((r) => [r.reportingUnit, r.reportingUnitType])).toEqual(
      expect.arrayContaining([['Delhi UT', 'state_ut'], ['Delhi City', 'metro_city']]),
    );
    const ut = await get('/api/crimes?year=2024&reportingUnitType=state_ut');
    expect(ut.body.data).toHaveLength(1);
    expect(ut.body.data[0].reportingUnit).toBe('Delhi UT');
  });

  it('returns no record for 2019', async () => {
    const response = await get('/api/crimes?year=2019');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});

describe('GET /api/crimes/trends', () => {
  it('returns a continuous series with a real 2019 gap', async () => {
    const response = await get(`/api/crimes/trends?${UT}`);
    expect(response.status).toBe(200);
    const { series, reportingUnitType, measure } = response.body.data;
    expect(reportingUnitType).toBe('state_ut');
    expect(measure).toBe('registeredCases');
    expect(series.map((p) => p.year)).toEqual([2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]);
    const gap = series.find((p) => p.year === 2019);
    expect(gap.statistic).toBeNull();
    expect(gap.availability).toBe('missing');
    expect(gap.coverage.status).toBe('missing_pending_source');
  });

  it('never mixes reporting units', async () => {
    const response = await get('/api/crimes/trends?reportingUnit=Delhi%20City');
    expect(response.body.data.series.map((p) => p.statistic.reportingUnit)).toEqual(['Delhi City']);
  });

  it('requires a reporting unit', async () => {
    const response = await get('/api/crimes/trends');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_QUERY');
  });

  it('supports a year range', async () => {
    const response = await get(`/api/crimes/trends?${UT}&fromYear=2022&toYear=2023`);
    expect(response.body.data.series.map((p) => p.year)).toEqual([2022, 2023]);
  });
});

describe('GET /api/crimes/summary', () => {
  it('summarises without adding across years', async () => {
    const response = await get(`/api/crimes/summary?${UT}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      availableYears: [2016, 2017, 2018, 2020, 2021, 2022, 2023, 2024],
      latest: { year: 2024, registeredCases: 13396, validationStatus: 'verified_with_note' },
      validationStatusCounts: { verified_with_note: 8 },
    });
    expect(response.body.data.missingYears.map((g) => g.year)).toEqual([2019]);
    expect(response.body.data.total).toBeUndefined();
  });
});

describe('reference endpoints', () => {
  it('lists categories with original labels', async () => {
    const response = await get('/api/crimes/categories?reportingYear=2018');
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({ originalCategoryName: 'Crime against Women (IPC + SLL) - 2016-2018', comparabilityStatus: 'not_assessed', definition: null });
  });

  it('finds a multi-year table by any year it covers, not only its publication year', async () => {
    const response = await get('/api/crimes/categories?reportingYear=2017');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({ publicationYear: 2018, reportingPeriod: { from: 2016, to: 2018 } });
    expect(response.body.data[0].reportingYear).toBeUndefined();
  });

  it('returns every table covering an overlapping year and none for an uncovered year', async () => {
    const overlapping = await get('/api/crimes/categories?reportingYear=2022');
    expect(overlapping.body.data.map((c) => c.publicationYear)).toEqual([2022, 2024]);
    const uncovered = await get('/api/crimes/categories?reportingYear=2019');
    expect(uncovered.body.data).toEqual([]);
  });

  it('filters categories by publication year separately', async () => {
    const response = await get('/api/crimes/categories?publicationYear=2018');
    expect(response.body.data.map((c) => c.originalCategoryName)).toEqual(['Crime against Women (IPC + SLL) - 2016-2018']);
  });

  it('lists data sources', async () => {
    const response = await get('/api/data-sources?publicationYear=2022');
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({ sourceKey: 'CII2022-V1-T3A.1', sourceName: 'Crime in India 2022' });
  });

  it('keeps pending validation visible', async () => {
    const response = await get('/api/validation?result=PENDING&year=2024');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({ checkName: 'TOT-4', result: 'PENDING', checkedAt: null });
  });
});

describe('invalid requests', () => {
  it.each([
    '/api/crimes?year=abc',
    '/api/crimes?year=20245',
    '/api/crimes?reportingUnitType=city',
    '/api/crimes?unknown=1',
    '/api/crimes?limit=1000',
    '/api/crimes?fromYear=2024&toYear=2020',
    '/api/crimes?reportingUnit[$ne]=x',
    '/api/validation?result=OK',
    '/api/crimes/categories?legalFramework=NONE',
  ])('rejects %s', async (path) => {
    const response = await get(path);
    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({ code: 'INVALID_QUERY' });
    expect(Array.isArray(response.body.error.details)).toBe(true);
  });

  it('returns JSON for an unknown route', async () => {
    const response = await get('/api/nothing');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it.each(['post', 'put', 'patch', 'delete'])('offers no %s route', async (method) => {
    expect((await request(app)[method]('/api/crimes')).status).toBe(404);
  });
});

describe('CORS', () => {
  it('allows the configured frontend only', async () => {
    const allowed = await get('/api/health').set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const denied = await get('/api/health').set('Origin', 'http://evil.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});
