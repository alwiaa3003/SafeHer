import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  CoverageRecord,
  CrimeCategory,
  CrimeRecord,
  DataSource,
  GeographicalUnit,
  ValidationRecord,
} from '../src/models/index.js';
import { importApprovedAnnualTotals, loadApprovedInputs } from '../src/seed/importApproved.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

const EXPECTED = { 2016: 15310, 2017: 13076, 2018: 13640, 2020: 10093, 2021: 14277, 2022: 14247, 2023: 13439, 2024: 13396 };

beforeAll(startTestDb);
beforeEach(clearTestDb);
afterAll(stopTestDb);

describe('approved annual totals import', () => {
  it('imports exactly the verified figures', async () => {
    const report = await importApprovedAnnualTotals();
    expect(report.conflicts).toEqual([]);
    expect(report.inserted.crimeRecords).toBe(8);
    const records = await CrimeRecord.find().lean();
    expect(Object.fromEntries(records.map((r) => [r.year, r.registeredCases]))).toEqual(EXPECTED);
    records.forEach((record) => {
      expect(record.validationStatus).toBe('verified_with_note');
      expect(record.victims).toBeUndefined();
    });
  });

  it('is idempotent', async () => {
    await importApprovedAnnualTotals();
    const counts = async () => [await DataSource.countDocuments(), await CrimeCategory.countDocuments(), await CrimeRecord.countDocuments(), await CoverageRecord.countDocuments(), await ValidationRecord.countDocuments()];
    const before = await counts();
    const report = await importApprovedAnnualTotals();
    expect(await counts()).toEqual(before);
    expect(report.inserted).toEqual({});
    expect(report.unchanged.crimeRecords).toBe(8);
  });

  it('keeps 2019 as a coverage gap with no numeric value', async () => {
    await importApprovedAnnualTotals();
    expect(await CrimeRecord.countDocuments({ year: 2019 })).toBe(0);
    const gap = await CoverageRecord.findOne({ year: 2019 }).lean();
    expect(gap.status).toBe('missing_pending_source');
    expect(gap.registeredCases).toBeUndefined();
  });

  it('preserves original Delhi and Delhi UT labels', async () => {
    await importApprovedAnnualTotals();
    const label = async (year) => (await CrimeRecord.findOne({ year }).lean()).reportingUnitLabelOriginal;
    expect(await label(2018)).toBe('Delhi UT');
    expect(await label(2024)).toBe('Delhi');
    expect(await CrimeRecord.countDocuments({ reportingUnitType: 'metro_city' })).toBe(0);
  });

  it('keeps provenance, pending checks and the 2024 caveat', async () => {
    await importApprovedAnnualTotals();
    const record2021 = await CrimeRecord.findOne({ year: 2021 }).populate('source').lean();
    expect(record2021.source.sourceName).toBe('Crime in India 2022');
    expect(record2021.sourceHistory[0].status).toBe('superseded');
    expect(await ValidationRecord.countDocuments({ checkName: 'TOT-4', result: 'PENDING' })).toBe(8);
    expect(await ValidationRecord.countDocuments({ checkName: 'EXT-2', result: 'PASS' })).toBe(8);
    const record2024 = await CrimeRecord.findOne({ year: 2024 }).lean();
    expect(record2024.validationNotes.map((n) => n.code)).toContain('UT_CITY_IDENTICAL_2024');
  });

  it('stores categories with comparability not assessed and no invented definitions', async () => {
    await importApprovedAnnualTotals();
    const rows = await CrimeCategory.find().lean();
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      expect(row.comparabilityStatus).toBe('not_assessed');
      expect(row.definition).toBeUndefined();
    });
  });

  it('adds no boundaries or geography', async () => {
    await importApprovedAnnualTotals();
    expect(await GeographicalUnit.countDocuments()).toBe(0);
  });

  it('skips statistics that are not approved', async () => {
    const inputs = await loadApprovedInputs();
    const statistics = inputs.statistics.map((s, i) => (i === 0 ? { ...s, validationStatus: 'pending' } : s));
    const report = await importApprovedAnnualTotals({ statistics, coverage: inputs.coverage });
    expect(report.skippedUnapproved).toBe(1);
    expect(await CrimeRecord.countDocuments({ year: 2016 })).toBe(0);
  });

  it('reports a conflict and never overwrites an existing record', async () => {
    await importApprovedAnnualTotals();
    await CrimeRecord.updateOne({ year: 2024 }, { $set: { registeredCases: 1, originalValue: '1' } });
    const report = await importApprovedAnnualTotals();
    expect(report.conflicts).toHaveLength(1);
    expect(report.conflicts[0].fields).toEqual(['registeredCases', 'originalValue']);
    expect((await CrimeRecord.findOne({ year: 2024 }).lean()).registeredCases).toBe(1);
  });

  it('leaves unrelated documents untouched', async () => {
    const other = await DataSource.create({ sourceKey: 'UNRELATED', sourceType: 'crime_statistics', sourceName: 'Other', publisher: 'P', publicationYear: 2000, tableReference: 'X', sourceUrl: 'https://example.org' });
    await importApprovedAnnualTotals();
    expect(await DataSource.findById(other._id).lean()).toMatchObject({ sourceKey: 'UNRELATED' });
  });
});
