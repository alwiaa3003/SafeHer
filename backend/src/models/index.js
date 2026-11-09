import { CoverageRecord } from './CoverageRecord.js';
import { CrimeCategory } from './CrimeCategory.js';
import { CrimeRecord } from './CrimeRecord.js';
import { DataSource } from './DataSource.js';
import { GeographicalUnit } from './GeographicalUnit.js';
import { ValidationRecord } from './ValidationRecord.js';

export { CoverageRecord, CrimeCategory, CrimeRecord, DataSource, GeographicalUnit, ValidationRecord };

export const allModels = [
  DataSource,
  CrimeCategory,
  CrimeRecord,
  CoverageRecord,
  GeographicalUnit,
  ValidationRecord,
];

// Builds any missing indexes. It never drops an index or a collection.
export function ensureIndexes() {
  return Promise.all(allModels.map((model) => model.init()));
}
