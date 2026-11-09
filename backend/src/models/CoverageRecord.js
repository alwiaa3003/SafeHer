import mongoose from 'mongoose';
import { REPORTING_UNIT_TYPES, yearField } from './constants.js';

// Records a gap without storing a number, so missing data can never read as zero.
const coverageRecordSchema = new mongoose.Schema(
  {
    dataset: { type: String, required: true, trim: true },
    year: yearField,
    reportingUnit: { type: String, required: true, trim: true },
    reportingUnitType: { type: String, required: true, enum: REPORTING_UNIT_TYPES },
    status: { type: String, required: true, enum: ['missing_pending_source', 'unavailable'] },
    reason: { type: String, required: true, trim: true },
    expectedSource: { type: String, trim: true },
  },
  { timestamps: true, strict: 'throw' },
);

coverageRecordSchema.index(
  { dataset: 1, year: 1, reportingUnit: 1, reportingUnitType: 1 },
  { unique: true },
);

export const CoverageRecord = mongoose.model('CoverageRecord', coverageRecordSchema, 'coverageRecords');
