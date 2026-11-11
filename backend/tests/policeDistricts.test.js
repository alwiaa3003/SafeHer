import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { isPublishableBoundary } from '../src/controllers/policeDistrictsController.js';
import { CrimeCategory, CrimeRecord, DataSource, GeographicalUnit, ValidationRecord } from '../src/models/index.js';
import { importApprovedAnnualTotals } from '../src/seed/importApproved.js';
import { districtFeatures, GSDL_DISTRICT_CODES, importLicensedPoliceDistricts, importReviewOnlyGsdlDistricts, removeSliverLoops, twoDimensional } from '../src/seed/importPoliceDistrictBoundaries.js';
import { assertDatasetIsSound, importPoliceDistrictStatistics, loadPoliceDistrictDataset } from '../src/seed/importPoliceDistricts.js';
import { startTestDb, stopTestDb } from './helpers/testDb.js';

const app = createApp({ corsOrigins: [] });
const reviewApp = createApp({ corsOrigins: [], reviewBoundaries: true });
const get = (p, target = app) => request(target).get(p);

const DISTRICTS = ['Central', 'Dwarka', 'East', 'IGI Airport', 'New Delhi', 'North', 'North-East', 'North-West', 'Outer', 'Outer North', 'Rohini', 'Shahdara', 'South', 'South-East', 'South-West', 'West'];
const NON_GEOGRAPHIC = ['Crime Branch', 'EOW', 'Metro', 'RAILWAY', 'SPUWAC', 'Spl Cell', 'Vigilance'];
const PRODUCTION_TOTALS = { 2020: 10093, 2021: 14277, 2022: 14247 };

// Test-only squares, one per district name. They are not real boundaries and never leave this test.
function squareCollection(names = Object.keys(GSDL_DISTRICT_CODES)) {
  return {
    type: 'FeatureCollection',
    features: names.map((name, i) => {
      const x = 77 + (i % 4) * 0.05;
      const y = 28.5 + Math.floor(i / 4) * 0.05;
      return { type: 'Feature', properties: { DISTRICT: name }, geometry: { type: 'Polygon', coordinates: [[[x, y], [x + 0.04, y], [x + 0.04, y + 0.04], [x, y + 0.04], [x, y]]] } };
    }),
  };
}

let folder;
beforeAll(async () => {
  await startTestDb();
  await importApprovedAnnualTotals();
  await importPoliceDistrictStatistics();
  folder = await mkdtemp(path.join(tmpdir(), 'safeher-district-test-'));
});
afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
  await stopTestDb();
});

describe('dataset file', () => {
  it('holds the 23 units, the 2020-2022 totals and 2022 headline categories only', async () => {
    const dataset = await loadPoliceDistrictDataset();
    expect(dataset.units.filter((u) => u.kind === 'police_district').map((u) => u.labelOriginal).sort()).toEqual([...DISTRICTS].sort());
    expect(dataset.units.filter((u) => u.kind === 'non_geographic').map((u) => u.labelOriginal).sort()).toEqual([...NON_GEOGRAPHIC].sort());
    expect(dataset.categories[0]).toMatchObject({ key: 'total', years: [2020, 2021, 2022] });
    expect(dataset.categories.slice(1).every((c) => c.years.length === 1 && c.years[0] === 2022)).toBe(true);
    expect(dataset.categories.some((c) => /Kidnapping/i.test(c.labelOriginal))).toBe(false);
    expect(dataset.categories.some((c) => /Girls \(Below 18|Women \(18/.test(c.label))).toBe(false);
    for (const source of dataset.sources) expect(source.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('refuses unsound data instead of importing it', async () => {
    const dataset = await loadPoliceDistrictDataset();
    expect(() => assertDatasetIsSound({ ...dataset, units: dataset.units.slice(1) })).toThrow(/16 police districts/);
    const unvalidated = { ...dataset, values: [...dataset.values, { year: 2020, unit: 'Central', category: 'rape', column: 23, originalValue: '1' }] };
    expect(() => assertDatasetIsSound(unvalidated)).toThrow(/not validated for 2020/);
    const changed = dataset.values.map((v) => (v.year === 2021 && v.unit === 'West' && v.category === 'total' ? { ...v, originalValue: '1' } : v));
    expect(() => assertDatasetIsSound({ ...dataset, values: changed })).toThrow(/do not reconcile/);
    const invented = dataset.values.map((v, i) => (i === 0 ? { ...v, originalValue: 'about 400' } : v));
    expect(() => assertDatasetIsSound({ ...dataset, values: invented })).toThrow(/Non-numeric/);
  });
});

describe('import', () => {
  it('stores every printed value with provenance, and a second run changes nothing', async () => {
    expect(await CrimeRecord.countDocuments({ reportingUnitType: { $in: ['police_district', 'police_unit_non_geographic'] } })).toBe(529);
    expect(await DataSource.countDocuments({ reportingLevel: 'police_district' })).toBe(3);
    expect(await ValidationRecord.countDocuments({ checkName: 'DIST-REC', result: 'PASS' })).toBe(3);
    const districtSources = await DataSource.find({ reportingLevel: 'police_district' }).select('_id').lean();
    expect(await CrimeCategory.countDocuments({ source: { $in: districtSources.map((s) => s._id) } })).toBe(23);
    const again = await importPoliceDistrictStatistics();
    expect(again.inserted).toEqual({});
    expect(again.conflicts).toEqual([]);
  });
});

describe('GET /api/police-districts/meta', () => {
  it('lists years, validated categories, the 16 districts and the 7 units kept off the map', async () => {
    const { status, body } = await get('/api/police-districts/meta');
    expect(status).toBe(200);
    expect(body.data.years).toEqual([2020, 2021, 2022]);
    expect(body.data.geographicPrecision).toBe('Police district');
    expect(body.data.districts.map((d) => d.label).sort()).toEqual([...DISTRICTS].sort());
    expect(body.data.nonGeographicUnits.map((d) => d.labelOriginal).sort()).toEqual([...NON_GEOGRAPHIC].sort());
    const codes = new Set(body.data.districts.map((d) => d.code));
    expect(body.data.nonGeographicUnits.some((u) => codes.has(u.code))).toBe(false);
    expect(body.data.categories[0]).toMatchObject({ key: 'total', label: 'Total crime against women', labelOriginal: 'Total Crime against Women (IPC+SLL)', years: [2020, 2021, 2022] });
    expect(body.data.categories.find((c) => c.key === 'rape')).toMatchObject({ label: 'Rape (Sec. 376 IPC)', legalRegime: 'IPC', years: [2022] });
    expect(body.data.sources.map((s) => s.reportingPeriod.from)).toEqual([2020, 2021, 2022]);
    expect(body.data.sources[0]).toMatchObject({ publisher: 'National Crime Records Bureau', reportingLevel: 'police_district' });
    expect(body.data.sources[0].reconciliation).toMatch(/sum to 10093/);
    expect(body.data.notices).toEqual(['Registered cases, not proven offences.', 'District-level statistics do not identify individual incident locations.', 'Not a safety score.']);
  });

  it('reports that no publishable boundary exists', async () => {
    const { body } = await get('/api/police-districts/meta');
    expect(body.data.boundary.status).toBe('unavailable');
    expect(body.data.boundary.reason).toMatch(/All Rights Reserved/);
  });

  it('rejects query parameters', async () => {
    expect((await get('/api/police-districts/meta?x=1')).status).toBe(400);
  });
});

describe('GET /api/police-districts/statistics', () => {
  it('returns the printed totals for all 16 districts, separately from non-geographic units', async () => {
    const { status, body } = await get('/api/police-districts/statistics?category=total');
    expect(status).toBe(200);
    expect(body.data.years).toEqual([2020, 2021, 2022]);
    expect(body.data.districts).toHaveLength(16);
    expect(body.data.nonGeographicUnits).toHaveLength(7);
    const central = body.data.districts.find((d) => d.code === 'central');
    expect(central.values.map((v) => [v.year, v.registeredCases, v.originalValue])).toEqual([[2020, 480, '480'], [2021, 645, '645'], [2022, 625, '625']]);
    expect(central.values[0]).toMatchObject({ sourceKey: 'NCRB-DISTRICT-CAW-2020', validationStatus: 'verified_with_note' });
    for (const year of [2020, 2021, 2022]) {
      const all = [...body.data.districts, ...body.data.nonGeographicUnits].map((u) => u.values.find((v) => v.year === year).registeredCases);
      expect(all.reduce((a, b) => a + b, 0)).toBe(PRODUCTION_TOTALS[year]);
    }
    expect(body.meta.notices).toContain('Not a safety score.');
  });

  it('keeps zero as a printed value, distinct from missing', async () => {
    const { body } = await get('/api/police-districts/statistics?category=murder-with-rape');
    expect(body.data.years).toEqual([2022]);
    const central = body.data.districts.find((d) => d.code === 'central');
    expect(central.values).toEqual([expect.objectContaining({ year: 2022, registeredCases: 0, originalValue: '0' })]);
  });

  it('serves a 2022-only category without inventing other years', async () => {
    const { body } = await get('/api/police-districts/statistics?category=rape');
    expect(body.data.category).toMatchObject({ key: 'rape', legalRegime: 'IPC' });
    expect(body.data.districts.every((d) => d.values.length === 1 && d.values[0].year === 2022)).toBe(true);
    const empty = await get('/api/police-districts/statistics?category=rape&year=2020');
    expect(empty.status).toBe(200);
    expect(empty.body.data.districts).toEqual([]);
  });

  it('filters by year', async () => {
    const { body } = await get('/api/police-districts/statistics?category=total&year=2021');
    expect(body.data.districts.every((d) => d.values.length === 1 && d.values[0].year === 2021)).toBe(true);
  });

  it('validates the query', async () => {
    expect((await get('/api/police-districts/statistics')).status).toBe(400);
    expect((await get('/api/police-districts/statistics?category=Total%20crime')).status).toBe(400);
    expect((await get('/api/police-districts/statistics?category=total&year=22')).status).toBe(400);
    expect((await get('/api/police-districts/statistics?category=total&unit=central')).status).toBe(400);
    const unknown = await get('/api/police-districts/statistics?category=kidnapping');
    expect(unknown.status).toBe(404);
    expect(unknown.body.error.code).toBe('CATEGORY_NOT_AVAILABLE');
  });
});

describe('GET /api/police-districts/boundaries', () => {
  it('serves no geometry when no licensed boundary exists', async () => {
    const { status, body } = await get('/api/police-districts/boundaries');
    expect(status).toBe(200);
    expect(body).toMatchObject({ type: 'FeatureCollection', features: [], meta: { boundary: { status: 'unavailable' } } });
  });

  it('never serves a review-only copy from the normal app, and labels it on the review server', async () => {
    const file = path.join(folder, 'districts.geojson');
    await writeFile(file, JSON.stringify(squareCollection()));
    expect((await importReviewOnlyGsdlDistricts(file)).inserted).toBe(16);
    expect(await GeographicalUnit.countDocuments({ geographyType: 'police_district', verificationStatus: 'unverified' })).toBe(16);

    expect((await get('/api/police-districts/boundaries')).body.features).toEqual([]);
    expect((await get('/api/police-districts/meta')).body.data.boundary.status).toBe('unavailable');

    const review = await get('/api/police-districts/boundaries', reviewApp);
    expect(review.body.features).toHaveLength(16);
    expect(review.body.meta.boundary).toMatchObject({ status: 'review_only', reviewOnly: true, provider: 'GSDL' });
    const meta = await get('/api/police-districts/meta', reviewApp);
    const dataCodes = meta.body.data.districts.map((d) => d.code).sort();
    expect(review.body.features.map((f) => f.properties.code).sort()).toEqual(dataCodes);
    expect(review.body.features.some((f) => ['metro', 'railway', 'crime-branch'].includes(f.properties.code))).toBe(false);
    expect((await importReviewOnlyGsdlDistricts(file)).inserted).toBe(0);
  });

  it('refuses incomplete or unknown district layers', () => {
    expect(() => districtFeatures(squareCollection(Object.keys(GSDL_DISTRICT_CODES).slice(1)))).toThrow(/Missing police districts: central/);
    expect(() => districtFeatures(squareCollection([...Object.keys(GSDL_DISTRICT_CODES), 'METRO']))).toThrow(/Unknown police district "METRO"/);
    expect(() => districtFeatures(squareCollection([...Object.keys(GSDL_DISTRICT_CODES), 'WEST']))).toThrow(/Duplicate/);
  });

  it('drops Z/M values and removes only tiny self-touching slivers from review geometry', () => {
    const square = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
    expect(twoDimensional({ type: 'Polygon', coordinates: [square.map(([x, y]) => [x, y, 0, null])] }).coordinates[0]).toEqual(square);
    expect(removeSliverLoops([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0], [0.001, 0], [0.001, 0.001], [0, 0]])).toEqual(square);
    expect(removeSliverLoops([[0, 0], [1, 0], [1, 0.5], [1.001, 0.5], [1, 0.5], [1, 1], [0, 1], [0, 0]])).toEqual([[0, 0], [1, 0], [1, 0.5], [1, 1], [0, 1], [0, 0]]);
    // A larger self-touching loop is a real shape problem and is left unchanged.
    const lobe = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0.5, 2], [0.5, 1.5], [1, 1], [0, 1], [0, 0]];
    expect(removeSliverLoops(lobe)).toEqual(lobe);
  });

  it('cannot be switched to review mode in production', async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      expect(() => createApp({ reviewBoundaries: true })).toThrow(/not allowed in production/);
      await expect(importReviewOnlyGsdlDistricts(path.join(folder, 'districts.geojson'))).rejects.toThrow(/cannot be imported in production/);
    } finally {
      process.env.NODE_ENV = previous;
    }
    const production = { MONGODB_URI: 'mongodb://localhost/x', NODE_ENV: 'production' };
    expect(() => loadConfig({ ...production, SAFEHER_REVIEW_DISTRICT_BOUNDARIES: 'districts.geojson' })).toThrow(/must not be set in production/);
    expect(loadConfig(production).nodeEnv).toBe('production');
  });

  it('never publishes GSDL geometry, even if a unit is wrongly marked verified', async () => {
    // Bypasses model validation on purpose, as a mistaken manual database edit would.
    await GeographicalUnit.collection.updateMany({ geographyType: 'police_district', 'provenance.provider': 'GSDL' }, { $set: { verificationStatus: 'verified' } });
    try {
      expect((await get('/api/police-districts/boundaries')).body.features).toEqual([]);
      expect((await get('/api/police-districts/meta')).body.data.boundary.status).toBe('unavailable');
    } finally {
      await GeographicalUnit.collection.updateMany({ geographyType: 'police_district', 'provenance.provider': 'GSDL' }, { $set: { verificationStatus: 'unverified' } });
    }
    expect(isPublishableBoundary({ verificationStatus: 'verified', provenance: { provider: 'GSDL', licence: { name: 'x' } } })).toBe(false);
    expect(isPublishableBoundary({ verificationStatus: 'verified', provenance: { provider: 'GSDL', licence: { name: 'x', permissionReference: 'Letter 1' } } })).toBe(true);
    expect(isPublishableBoundary({ verificationStatus: 'unverified', provenance: { provider: 'Other', licence: { name: 'CC BY 4.0' } } })).toBe(false);
  });

  it('sends cache headers: cacheable in public, never cached in review', async () => {
    for (const p of ['/api/police-districts/meta', '/api/police-districts/statistics?category=total', '/api/police-districts/boundaries']) {
      expect((await get(p)).headers['cache-control']).toBe('public, max-age=3600');
      expect((await get(p, reviewApp)).headers['cache-control']).toBe('no-store');
    }
  });

  const LICENSED = {
    provider: 'Test Provider',
    sourceUrl: 'https://example.org/test-layer',
    sourceName: 'Test-only licensed layer',
    boundaryVersion: 'test-licensed-1',
    crs: 'EPSG:4326',
    retrievedAt: '2026-11-10',
    licence: { name: 'CC BY 4.0 (test)', url: 'https://creativecommons.org/licenses/by/4.0/', attribution: '© Test Provider' },
  };

  it('refuses a boundary import without a licence, or GSDL without written permission', async () => {
    const file = path.join(folder, 'districts.geojson');
    await expect(importLicensedPoliceDistricts(file, { ...LICENSED, licence: { name: 'CC BY 4.0' } })).rejects.toThrow(/needs licence.attribution/);
    await expect(importLicensedPoliceDistricts(file, { ...LICENSED, provider: 'GSDL' })).rejects.toThrow(/written permission/);
  });

  it('rejects invalid geometry', async () => {
    const bowtie = squareCollection();
    bowtie.features[0].geometry.coordinates = [[[77, 28.5], [77.04, 28.54], [77.04, 28.5], [77, 28.54], [77, 28.5]]];
    const file = path.join(folder, 'invalid.geojson');
    await writeFile(file, JSON.stringify(bowtie));
    await expect(importLicensedPoliceDistricts(file, { ...LICENSED, boundaryVersion: 'test-invalid' })).rejects.toThrow();
    expect(await GeographicalUnit.countDocuments({ boundaryVersion: 'test-invalid' })).toBe(0);
  });

  it('publishes all 16 districts once a licensed layer is imported, with its attribution', async () => {
    // Only one current layer may exist per district, so the review copy is removed first.
    await GeographicalUnit.deleteMany({ geographyType: 'police_district' });
    const names = Object.keys(GSDL_DISTRICT_CODES).map((n) => (n === 'AIRPORT' ? 'IGI Airport' : n.replace(' ', '-')));
    const file = path.join(folder, 'licensed.geojson');
    await writeFile(file, JSON.stringify(squareCollection(names)));
    try {
      expect((await importLicensedPoliceDistricts(file, LICENSED)).inserted).toBe(16);
      const { body } = await get('/api/police-districts/boundaries');
      expect(body.features).toHaveLength(16);
      expect(body.meta.boundary).toMatchObject({ status: 'published', reviewOnly: false, provider: 'Test Provider', licence: LICENSED.licence, districtCount: 16 });
      const meta = await get('/api/police-districts/meta');
      expect(body.features.map((f) => f.properties.code).sort()).toEqual(meta.body.data.districts.map((d) => d.code).sort());
      const nonGeographic = new Set(meta.body.data.nonGeographicUnits.map((u) => u.code));
      expect(body.features.some((f) => nonGeographic.has(f.properties.code))).toBe(false);
    } finally {
      await GeographicalUnit.deleteMany({ geographyType: 'police_district' });
    }
  });
});

describe('import command', () => {
  const run = (args) => new Promise((resolve) => {
    const env = { ...process.env };
    delete env.MONGODB_URI;
    execFile(process.execPath, ['src/seed/policeDistricts.js', ...args], { cwd: path.resolve(import.meta.dirname, '..'), env }, (error, stdout, stderr) => resolve({ code: error ? error.code : 0, stdout, stderr }));
  });

  it('refuses to write without --approved, and --check never contacts a database', async () => {
    const refused = await run([]);
    expect(refused.code).toBe(1);
    expect(refused.stderr).toMatch(/Refusing to import/);
    const check = await run(['--check']);
    expect(check.code).toBe(0);
    expect(check.stdout).toMatch(/Dataset sound: 529 values, 23 units, 21 categories, 3 sources\. No database was contacted\./);
    expect(check.stdout).toMatch(/would insert \{"dataSources":3,"validationRecords":3,"crimeCategories":23,"crimeRecords":529\}/);
    const twoModes = await run(['--dry-run', '--approved']);
    expect(twoModes.code).toBe(1);
    expect(twoModes.stderr).toMatch(/Choose one of/);
  });
});

describe('Delhi-wide endpoints are unchanged by district records', () => {
  it('lists only Delhi-wide records and labels by default', async () => {
    const crimes = await get('/api/crimes?limit=100');
    expect(crimes.body.data.every((r) => ['state_ut', 'metro_city'].includes(r.reportingUnitType))).toBe(true);
    expect(crimes.body.meta.total).toBe(9);
    const districts = await get('/api/crimes?reportingUnitType=police_district&year=2022&limit=100');
    expect(districts.body.meta.total).toBe(16 * 21);
    const labels = await get('/api/crimes/categories?limit=100');
    expect(labels.body.data.some((c) => c.source.reportingLevel === 'police_district')).toBe(false);
  });

  it('refuses a district series on the trends endpoint', async () => {
    const response = await get('/api/crimes/trends?reportingUnit=Central&reportingUnitType=police_district');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('USE_DISTRICT_ENDPOINT');
    expect((await get('/api/crimes/trends?reportingUnit=Delhi%20UT')).body.data.series).toHaveLength(9);
  });
});
