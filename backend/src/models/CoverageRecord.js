import mongoose from 'mongoose';
import { REPORTING_UNIT_TYPES, yearField } from './constants.js';

export const GAP_STATUSES = ['missing_pending_source', 'unavailable'];

// Records a gap without storing a number, so missing data can never read as zero.
// A gap later filled by a verified source is kept as history with status 'resolved'.
const coverageRecordSchema = new mongoose.Schema(
  {
    dataset: { type: String, required: true, trim: true },
    year: yearField,
    reportingUnit: { type: String, required: true, trim: true },
    reportingUnitType: { type: String, required: true, enum: REPORTING_UNIT_TYPES },
    status: { type: String, required: true, enum: [...GAP_STATUSES, 'resolved'] },
    reason: { type: String, required: true, trim: true },
    expectedSource: { type: String, trim: true },
    resolvedBy: {
      type: String,
      trim: true,
      required() {
        return this.status === 'resolved';
      },
    },
    resolvedAt: {
      type: Date,
      required() {
        return this.status === 'resolved';
      },
    },
  },
  { timestamps: true, strict: 'throw' },
);

coverageRecordSchema.index(
  { dataset: 1, year: 1, reportingUnit: 1, reportingUnitType: 1 },
  { unique: true },
);

export const CoverageRecord = mongoose.model('CoverageRecord', coverageRecordSchema, 'coverageRecords');
