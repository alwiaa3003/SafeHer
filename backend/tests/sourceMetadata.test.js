import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { CrimeCategory, CrimeRecord, DataSource, GeographicalUnit, ValidationRecord } from '../src/models/index.js';
import { importApprovedAnnualTotals } from '../src/seed/importApproved.js';
import { importDelhiBoundary } from '../src/seed/importBoundary.js';
import { migrateSourceMetadata, planSourceMigration } from '../src/seed/migrateSourceMetadata.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

const app = createApp({ corsOrigins: ['http://localhost:5173'] });
const get = (path) => request(app).get(path);
const OSM_KEY = 'OSM-RELATION-1942586-V152';
const raw = () => DataSource.collection;

// Rewrites documents into the shape stored before sourceType existed.
async function makeLegacy() {
  await raw().updateMany({ publisher: 'National Crime Records Bureau' }, { $unset: { sourceType: '' } });
  await raw().updateOne(
    { sourceKey: OSM_KEY },
    {
      $unset: { sourceType: '', boundaryReference: '' },
      $set: { publicationYear: 2026, tableReference: 'relation/1942586/v152' },
    },
  );
}

const snapshot = async () => ({
  records: await CrimeRecord.collection.find({}).sort({ year: 1 }).toArray(),
  validation: await ValidationRecord.collection.find({}).sort({ _id: 1 }).toArray(),
  categories: await CrimeCategory.collection.find({}).sort({ _id: 1 }).toArray(),
  units: await GeographicalUnit.collection.find({}).toArray(),
});

beforeAll(startTestDb);
beforeEach(async () => {
  await clearTestDb();
  await importApprovedAnnualTotals();
  await importDelhiBoundary();
});
afterAll(stopTestDb);

describe('source classification', () => {
  it('stores new sources with their type and keeps OSM identity out of table references', async () => {
    const ncrb = await DataSource.findOne({ sourceKey: 'CII2024-V1-T3A.1' }).lean();
    expect(ncrb).toMatchObject({ sourceType: 'crime_statistics', tableReference: '3A.1', publicationYear: 2024 });
    const osm = await DataSource.findOne({ sourceKey: OSM_KEY }).lean();
    expect(osm.sourceType).toBe('geographic_boundary');
    expect(osm.tableReference).toBeUndefined();
    expect(osm.boundaryReference).toMatchObject({ provider: 'OpenStreetMap', elementType: 'relation', elementId: 1942586, version: 152 });
  });

  it('requires the fields that match the source type', () => {
    expect(new DataSource({ sourceKey: 'A', sourceName: 'A', publisher: 'P', sourceUrl: 'https://e.org' }).validateSync().errors.sourceType).toBeDefined();
    const crime = new DataSource({ sourceKey: 'A', sourceType: 'crime_statistics', sourceName: 'A', publisher: 'P', sourceUrl: 'https://e.org' });
    expect(Object.keys(crime.validateSync().errors)).toEqual(expect.arrayContaining(['tableReference', 'publicationYear']));
    const boundary = new DataSource({ sourceKey: 'B', sourceType: 'geographic_boundary', sourceName: 'B', publisher: 'P', sourceUrl: 'https://e.org', tableReference: 'relation/1/v1' });
    const errors = boundary.validateSync().errors;
    expect(errors.tableReference).toBeDefined();
    expect(errors['boundaryReference.elementId']).toBeDefined();
  });

  it.each([['new shape', async () => {}], ['legacy shape', makeLegacy]])('makes the type clear in the API for the %s', async (_label, prepare) => {
    await prepare();
    const crime = await get('/api/data-sources?sourceType=crime_statistics');
    expect(crime.body.data).toHaveLength(4);
    crime.body.data.forEach((s) => {
      expect(s).toMatchObject({ sourceType: 'crime_statistics', boundaryReference: null, tableReference: expect.stringMatching(/^(3A\.1|Additional table 003 \(State\/UT\))$/) });
      expect(s.extract.sha256).toMatch(/^[0-9a-f]{64}$/);
    });

    const boundary = await get('/api/data-sources?sourceType=geographic_boundary');
    expect(boundary.body.data).toHaveLength(1);
    expect(boundary.body.data[0]).toMatchObject({
      sourceKey: OSM_KEY,
      tableReference: null,
      publicationYear: null,
      sourceUrl: 'https://www.openstreetmap.org/relation/1942586',
      boundaryReference: { provider: 'OpenStreetMap', elementId: 1942586, version: 152 },
    });
  });

  it('rejects an unknown source type', async () => {
    expect((await get('/api/data-sources?sourceType=other')).status).toBe(400);
  });
});

describe('source metadata migration', () => {
  it('flags anything it cannot classify instead of guessing', () => {
    expect(planSourceMigration({ sourceKey: 'X', publisher: 'Unknown', tableReference: 'T' }).action).toBe('needs_review');
    expect(planSourceMigration({ sourceKey: 'OSM-RELATION-1-V2', publisher: 'O', tableReference: 'relation/9/v2' }).action).toBe('needs_review');
  });

  it('changes nothing on a dry run', async () => {
    await makeLegacy();
    const before = await raw().find({}).sort({ sourceKey: 1 }).toArray();
    const report = await migrateSourceMetadata();
    expect(report).toMatchObject({ applied: false, updated: 0 });
    expect(report.plan.filter((p) => p.action === 'update')).toHaveLength(5);
    expect(await raw().find({}).sort({ sourceKey: 1 }).toArray()).toEqual(before);
  });

  it('adds classification, preserves NCRB provenance and moves the OSM identity', async () => {
    await makeLegacy();
    const before = await raw().findOne({ sourceKey: 'CII2018-V1-T3A.1' });
    expect((await migrateSourceMetadata({ apply: true })).updated).toBe(5);

    expect(await raw().findOne({ sourceKey: 'CII2018-V1-T3A.1' })).toEqual({ ...before, sourceType: 'crime_statistics' });
    const osm = await raw().findOne({ sourceKey: OSM_KEY });
    expect(osm.tableReference).toBeUndefined();
    expect(osm.publicationYear).toBeUndefined();
    expect(osm.boundaryReference).toEqual({ provider: 'OpenStreetMap', elementType: 'relation', elementId: 1942586, version: 152, lastEditedYear: 2026 });
    expect(osm.sourceUrl).toBe('https://www.openstreetmap.org/relation/1942586');

    for (const doc of await DataSource.find({})) expect(doc.validateSync()).toBeUndefined();
  });

  it('is idempotent', async () => {
    await makeLegacy();
    await migrateSourceMetadata({ apply: true });
    const before = await raw().find({}).sort({ sourceKey: 1 }).toArray();
    const second = await migrateSourceMetadata({ apply: true });
    expect(second.updated).toBe(0);
    expect(second.plan.every((p) => p.action === 'unchanged')).toBe(true);
    expect(await raw().find({}).sort({ sourceKey: 1 }).toArray()).toEqual(before);
  });

  it('leaves crime, validation, category and boundary documents untouched', async () => {
    await makeLegacy();
    const before = await snapshot();
    await migrateSourceMetadata({ apply: true });
    expect(await snapshot()).toEqual(before);
    expect(before.records.map((r) => [r.year, r.registeredCases])).toEqual([
      [2016, 15310], [2017, 13076], [2018, 13640], [2019, 13395], [2020, 10093], [2021, 14277], [2022, 14247], [2023, 13439], [2024, 13396],
    ]);
    expect(before.categories.every((c) => c.comparabilityStatus === 'not_assessed')).toBe(true);
    expect(before.units.every((u) => u.contextOnly === true && !('registeredCases' in u))).toBe(true);
  });

  it('lets the seed run after migration without conflicts or duplicates', async () => {
    await makeLegacy();
    await migrateSourceMetadata({ apply: true });
    expect((await importApprovedAnnualTotals()).conflicts).toEqual([]);
    expect((await importDelhiBoundary()).action).toBe('unchanged');
    expect(await DataSource.countDocuments()).toBe(5);
  });
});
