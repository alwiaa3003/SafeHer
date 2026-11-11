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

const EXISTING = { 2016: 15310, 2017: 13076, 2018: 13640, 2020: 10093, 2021: 14277, 2022: 14247, 2023: 13439, 2024: 13396 };
const EXPECTED = { ...EXISTING, 2019: 13395 };
const SPREADSHEET_SHA = '655033a80b12d020cc9065a067525c2a2fc5e641112ff9cb5f7a47715e8259c3';

beforeAll(startTestDb);
beforeEach(clearTestDb);
afterAll(stopTestDb);

describe('approved annual totals import', () => {
  it('imports exactly the verified figures', async () => {
    const report = await importApprovedAnnualTotals();
    expect(report.conflicts).toEqual([]);
    expect(report.inserted.crimeRecords).toBe(9);
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
    expect(report.unchanged.crimeRecords).toBe(9);
    expect(await CrimeRecord.countDocuments({ year: 2019 })).toBe(1);
  });

  it('adds 2019 from the official NCRB spreadsheet with its qualifications', async () => {
    await importApprovedAnnualTotals();
    const r = await CrimeRecord.findOne({ year: 2019 }).populate('source').lean();
    expect(r).toMatchObject({ registeredCases: 13395, originalValue: '13395', reportingUnit: 'Delhi UT', reportingUnitType: 'state_ut', reportingUnitLabelOriginal: 'Delhi', validationStatus: 'verified_with_note' });
    expect(r.victims).toBeUndefined();
    expect(r.pdfPage).toBeUndefined();
    expect(r.evidence.sha256).toBe(SPREADSHEET_SHA);
    expect(r.validationChecks).toEqual([
      expect.objectContaining({ rule: 'EXT-2', result: 'PASS' }),
      expect.objectContaining({ rule: 'TOT-4', result: 'PENDING', scope: expect.stringMatching(/comparison is outstanding/) }),
    ]);
    expect(r.validationNotes.map((n) => n.code)).toEqual(expect.arrayContaining(['CII2021_COPY_THIRD_PARTY', 'ALL_INDIA_2019_DIFFERS', 'DELHI_CITY_SEPARATE', 'TOT4_PENDING_TABLE_3A2']));
    expect(r.source).toMatchObject({
      sourceKey: 'NCRB-AT2019-003-STATEUT-CAW-2014-2019',
      sourceType: 'crime_statistics',
      publisher: 'National Crime Records Bureau',
      sourceUrl: expect.stringMatching(/^https:\/\/www\.ncrb\.gov\.in\/uploads\//),
      reportingPeriod: { from: 2014, to: 2019 },
      extract: { sha256: SPREADSHEET_SHA },
    });
    expect(r.source.notes).toMatch(/Official NCRB download, retrieved 2026-11-10/);
    expect(await ValidationRecord.countDocuments({ reportingYear: 2019, checkName: 'TOT-4', result: 'PENDING' })).toBe(1);
  });

  it('keeps the old 2019 gap as resolved history with no numeric value', async () => {
    await importApprovedAnnualTotals();
    const gap = await CoverageRecord.findOne({ year: 2019 }).lean();
    expect(gap).toMatchObject({ status: 'resolved', resolvedBy: expect.stringMatching(/official NCRB spreadsheet/), expectedSource: 'Crime in India 2021, Table 3A.1' });
    expect(gap.registeredCases).toBeUndefined();
  });

  it('requires a source when a gap is resolved', () => {
    const doc = new CoverageRecord({ dataset: 'd', year: 2019, reportingUnit: 'Delhi UT', reportingUnitType: 'state_ut', status: 'resolved', reason: 'r' });
    expect(Object.keys(doc.validateSync().errors)).toEqual(expect.arrayContaining(['resolvedBy', 'resolvedAt']));
  });

  it('leaves the existing eight figures and their sources unchanged', async () => {
    await importApprovedAnnualTotals();
    const records = await CrimeRecord.find({ year: { $ne: 2019 } }).populate('source').lean();
    expect(Object.fromEntries(records.map((r) => [r.year, r.registeredCases]))).toEqual(EXISTING);
    records.forEach((r) => {
      expect(r.source.sourceKey).toMatch(/^CII20(18|22|24)-V1-T3A\.1$/);
      expect(r.validationChecks.find((c) => c.rule === 'TOT-4').result).toBe('PENDING');
    });
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
    expect(await ValidationRecord.countDocuments({ checkName: 'TOT-4', result: 'PENDING' })).toBe(9);
    expect(await ValidationRecord.countDocuments({ checkName: 'TOT-4', result: { $ne: 'PENDING' } })).toBe(0);
    expect(await ValidationRecord.countDocuments({ checkName: 'EXT-2', result: 'PASS' })).toBe(9);
    const record2024 = await CrimeRecord.findOne({ year: 2024 }).lean();
    expect(record2024.validationNotes.map((n) => n.code)).toContain('UT_CITY_IDENTICAL_2024');
  });

  it('stores categories with comparability not assessed and no invented definitions', async () => {
    await importApprovedAnnualTotals();
    const rows = await CrimeCategory.find().lean();
    // One label per source; the 2019 one is the spreadsheet title, not a Table 3A.2 category.
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => r.originalCategoryName)).toContain('Statement on Cases Registered In Police Stations and Cr.PC (156_3) under Crimes against Women During 2014-2019');
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
