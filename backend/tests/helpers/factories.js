import mongoose from 'mongoose';
import { CrimeCategory, CrimeRecord, DataSource } from '../../src/models/index.js';

const SHA = 'a'.repeat(64);

export const objectId = () => new mongoose.Types.ObjectId();

export function sourceData(overrides = {}) {
  return {
    sourceKey: 'CII2024-V1-T3B.1',
    sourceType: 'crime_statistics',
    sourceName: 'Crime in India 2024',
    publisher: 'National Crime Records Bureau',
    publicationYear: 2024,
    tableReference: '3B.1',
    sourceUrl: 'https://www.ncrb.mha.gov.in/uploads/files/11CrimeinIndia2024-VolumeI.pdf',
    extract: { sha256: SHA },
    ...overrides,
  };
}

export function recordData(source, category, overrides = {}) {
  return {
    year: 2024,
    reportingUnit: 'Delhi City',
    reportingUnitLabelOriginal: 'Delhi City',
    reportingUnitType: 'metro_city',
    crimeCategory: 'Total crime against women',
    category,
    categoryLabelOriginal: 'Crime against Women (IPC+SLL) in Metropolitan Cities - 2022-2024',
    legalRegime: 'ALL',
    ageGroup: 'all',
    registeredCases: 13396,
    originalValue: '13396',
    source,
    sourceReference: 'CII2024-V1-T3B.1-p400',
    validationStatus: 'pending',
    ...overrides,
  };
}

export async function createSourceAndCategory(key = 'CII2024-V1-T3B.1') {
  const source = await DataSource.create(sourceData({ sourceKey: key }));
  const category = await CrimeCategory.create({
    originalCategoryName: `Category for ${key}`,
    reportingYear: 2024,
    legalFramework: 'ALL',
    source: source._id,
  });
  return { source, category };
}

export const createRecord = (source, category, overrides) =>
  CrimeRecord.create(recordData(source._id, category._id, overrides));
