import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  CoverageRecord,
  CrimeCategory,
  CrimeRecord,
  DataSource,
  GeographicalUnit,
  ValidationRecord,
} from '../src/models/index.js';
import { createRecord, createSourceAndCategory, objectId, recordData, sourceData } from './helpers/factories.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

const errorsOf = (doc) => doc.validateSync()?.errors ?? {};

describe('schema validation', () => {
  it('requires the core fields of a crime record', () => {
    const errors = errorsOf(new CrimeRecord({}));
    for (const field of ['year', 'reportingUnit', 'reportingUnitLabelOriginal', 'reportingUnitType', 'registeredCases', 'source', 'validationStatus']) {
      expect(errors[field], field).toBeDefined();
    }
  });

  it('never accepts a missing count as a record', () => {
    const data = recordData(objectId(), objectId());
    delete data.registeredCases;
    expect(errorsOf(new CrimeRecord(data)).registeredCases).toBeDefined();
  });

  it('rejects fractional or negative counts', () => {
    expect(errorsOf(new CrimeRecord(recordData(objectId(), objectId(), { registeredCases: 1.5 }))).registeredCases).toBeDefined();
    expect(errorsOf(new CrimeRecord(recordData(objectId(), objectId(), { registeredCases: -1 }))).registeredCases).toBeDefined();
  });

  it('requires the printed value to match the numeric count', () => {
    const doc = new CrimeRecord(recordData(objectId(), objectId(), { originalValue: '13397' }));
    expect(errorsOf(doc).originalValue).toBeDefined();
  });

  it('keeps registered cases and victims as separate fields', async () => {
    const { source, category } = await createSourceAndCategory();
    const casesOnly = await createRecord(source, category);
    expect(casesOnly.victims).toBeUndefined();

    const both = await createRecord(source, category, {
      year: 2023,
      registeredCases: 13366,
      originalValue: '13366',
      victims: 13584,
    });
    expect(both.registeredCases).toBe(13366);
    expect(both.victims).toBe(13584);
  });

  it('limits reporting unit types and legal regimes', () => {
    const errors = errorsOf(new CrimeRecord(recordData(objectId(), objectId(), { reportingUnitType: 'district', legalRegime: 'IPCBNS' })));
    expect(errors.reportingUnitType).toBeDefined();
    expect(errors.legalRegime).toBeDefined();
  });

  it('defaults category comparability to not_assessed', () => {
    const doc = new CrimeCategory({ originalCategoryName: 'Rape (Total a+b)', reportingYear: 2024, legalFramework: 'BNS', source: objectId() });
    expect(doc.comparabilityStatus).toBe('not_assessed');
  });

  it('allows only real validation results', () => {
    const doc = new ValidationRecord({ source: objectId(), checkName: 'TOT-4', reportingYear: 2024, reportingUnit: 'Delhi UT', reportingUnitType: 'state_ut', result: 'OK', explanation: 'x' });
    expect(errorsOf(doc).result).toBeDefined();
  });

  it('has no numeric field on a coverage gap', () => {
    expect(CoverageRecord.schema.path('registeredCases')).toBeUndefined();
    expect(() => new CoverageRecord({ dataset: 'd', year: 2019, reportingUnit: 'Delhi UT', reportingUnitType: 'state_ut', status: 'unavailable', reason: 'r', registeredCases: 0 })).toThrow();
  });
});

describe('geographical units', () => {
  const unit = (geometry) => ({ geographyName: 'Example', geographyType: 'police_district', source: objectId(), boundaryVersion: 'v1', geometry });

  it('does not require a geometry', () => {
    expect(new GeographicalUnit(unit(undefined)).validateSync()).toBeUndefined();
  });

  it('accepts valid longitude-latitude GeoJSON', () => {
    const coordinates = [[[77.1, 28.6], [77.2, 28.6], [77.2, 28.7], [77.1, 28.6]]];
    expect(new GeographicalUnit(unit({ type: 'Polygon', coordinates })).validateSync()).toBeUndefined();
  });

  it('rejects out-of-range and unclosed geometry', () => {
    const swapped = [[[28.6, 95], [28.7, 95], [28.7, 96], [28.6, 95]]];
    const open = [[[77.1, 28.6], [77.2, 28.6], [77.2, 28.7], [77.3, 28.7]]];
    expect(new GeographicalUnit(unit({ type: 'Polygon', coordinates: swapped })).validateSync()).toBeDefined();
    expect(new GeographicalUnit(unit({ type: 'Polygon', coordinates: open })).validateSync()).toBeDefined();
  });

  it('creates a 2dsphere index', async () => {
    const indexes = await GeographicalUnit.collection.indexes();
    expect(indexes.some((index) => index.key.geometry === '2dsphere')).toBe(true);
  });
});

describe('duplicate prevention', () => {
  const duplicate = expect.objectContaining({ code: 11000 });

  it('blocks a duplicate data source', async () => {
    await DataSource.create(sourceData());
    await expect(DataSource.create(sourceData())).rejects.toEqual(duplicate);
  });

  it('blocks a duplicate statistic from the same source', async () => {
    const { source, category } = await createSourceAndCategory();
    await createRecord(source, category, { isCurrent: false });
    await expect(createRecord(source, category, { isCurrent: false })).rejects.toEqual(duplicate);
  });

  it('allows only one current value across sources', async () => {
    const first = await createSourceAndCategory('A');
    const second = await createSourceAndCategory('B');
    await createRecord(first.source, first.category);
    await expect(createRecord(second.source, second.category)).rejects.toEqual(duplicate);
    await expect(createRecord(second.source, second.category, { isCurrent: false })).resolves.toBeDefined();
  });

  it('keeps Delhi UT and Delhi City as separate records for one year', async () => {
    const { source, category } = await createSourceAndCategory();
    await createRecord(source, category);
    await createRecord(source, category, { reportingUnit: 'Delhi UT', reportingUnitLabelOriginal: 'Delhi', reportingUnitType: 'state_ut' });
    expect(await CrimeRecord.countDocuments({ year: 2024 })).toBe(2);
  });

  it('blocks a duplicate coverage gap and validation check', async () => {
    const gap = { dataset: 'd', year: 2019, reportingUnit: 'Delhi UT', reportingUnitType: 'state_ut', status: 'unavailable', reason: 'r' };
    await CoverageRecord.create(gap);
    await expect(CoverageRecord.create(gap)).rejects.toEqual(duplicate);

    const check = { source: objectId(), checkName: 'TOT-4', reportingYear: 2024, reportingUnit: 'Delhi UT', reportingUnitType: 'state_ut', result: 'PENDING', explanation: 'x' };
    await ValidationRecord.create(check);
    await expect(ValidationRecord.create(check)).rejects.toEqual(duplicate);
  });
});
