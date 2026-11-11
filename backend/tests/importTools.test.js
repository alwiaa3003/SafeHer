import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CrimeCategory, CrimeRecord, DataSource, ValidationRecord } from '../src/models/index.js';
import { findDuplicateDistrictRecords, importPoliceDistrictStatistics, loadPoliceDistrictDataset, verifyPoliceDistrictImport } from '../src/seed/importPoliceDistricts.js';
import { startTestDb, stopTestDb } from './helpers/testDb.js';

const counts = async () => ({
  dataSources: await DataSource.countDocuments(),
  validationRecords: await ValidationRecord.countDocuments(),
  crimeCategories: await CrimeCategory.countDocuments(),
  crimeRecords: await CrimeRecord.countDocuments(),
});
const EXPECTED = { dataSources: 3, validationRecords: 3, crimeCategories: 23, crimeRecords: 529 };

beforeAll(startTestDb);
afterAll(stopTestDb);

describe('police-district import tooling', () => {
  it('a dry run reports every insert but writes nothing', async () => {
    const report = await importPoliceDistrictStatistics(undefined, { dryRun: true });
    expect(report.dryRun).toBe(true);
    expect(report.inserted).toEqual(EXPECTED);
    expect(report.conflicts).toEqual([]);
    expect(await counts()).toEqual({ dataSources: 0, validationRecords: 0, crimeCategories: 0, crimeRecords: 0 });
  });

  it('verification fails on an empty database', async () => {
    const result = await verifyPoliceDistrictImport();
    expect(result.pass).toBe(false);
    expect(result.checks.find((c) => c.name === 'record count')).toMatchObject({ pass: false, detail: '0 of 529' });
  });

  it('after a real import, verification passes and a dry run plans nothing', async () => {
    const report = await importPoliceDistrictStatistics();
    expect(report.inserted).toEqual(EXPECTED);
    expect(await counts()).toEqual(EXPECTED);
    const result = await verifyPoliceDistrictImport();
    expect(result.checks.filter((c) => !c.pass)).toEqual([]);
    expect(result.pass).toBe(true);
    const again = await importPoliceDistrictStatistics(undefined, { dryRun: true });
    expect(again.inserted).toEqual({});
    expect(again.unchanged).toEqual(EXPECTED);
  });

  it('a dry run flags a changed printed value as a conflict without touching the stored one', async () => {
    const dataset = await loadPoliceDistrictDataset();
    const changed = dataset.values.map((v) => (v.year === 2022 && v.unit === 'Central' && v.category === 'rape' ? { ...v, originalValue: String(Number(v.originalValue) + 1) } : v));
    const report = await importPoliceDistrictStatistics({ ...dataset, values: changed }, { dryRun: true });
    expect(report.conflicts).toHaveLength(1);
    expect(report.conflicts[0]).toMatchObject({ collection: 'crimeRecords', fields: ['registeredCases', 'originalValue'] });
    const stored = await CrimeRecord.findOne({ year: 2022, reportingUnitCode: 'central', crimeCategory: 'rape' }).lean();
    expect(stored.originalValue).toBe(dataset.values.find((v) => v.year === 2022 && v.unit === 'Central' && v.category === 'rape').originalValue);
  });

  it('detects duplicate identities and fails verification when they exist', async () => {
    expect(await findDuplicateDistrictRecords()).toEqual([]);
    // Inserted around the unique index, as a database without indexes would allow.
    await CrimeRecord.collection.dropIndexes();
    const copy = await CrimeRecord.findOne({ reportingUnitCode: 'west', crimeCategory: 'total', year: 2021 }).lean();
    delete copy._id;
    await CrimeRecord.collection.insertOne(copy);
    expect(await findDuplicateDistrictRecords()).toHaveLength(1);
    expect((await verifyPoliceDistrictImport()).pass).toBe(false);
  });
});
