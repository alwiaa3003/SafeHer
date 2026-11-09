import mongoose from 'mongoose';
import { REPORTING_UNIT_TYPES, VALIDATION_RESULTS, yearField } from './constants.js';

const validationRecordSchema = new mongoose.Schema(
  {
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource', required: true },
    checkName: { type: String, required: true, trim: true },
    reportingYear: yearField,
    reportingUnit: { type: String, required: true, trim: true },
    reportingUnitType: { type: String, required: true, enum: REPORTING_UNIT_TYPES },
    result: { type: String, required: true, enum: VALIDATION_RESULTS },
    explanation: { type: String, required: true, trim: true },
    // Empty while a check is pending.
    checkedAt: Date,
  },
  { timestamps: true },
);

validationRecordSchema.index(
  { source: 1, checkName: 1, reportingYear: 1, reportingUnit: 1, reportingUnitType: 1 },
  { unique: true },
);
validationRecordSchema.index({ reportingYear: 1, result: 1 });

export const ValidationRecord = mongoose.model(
  'ValidationRecord',
  validationRecordSchema,
  'validationRecords',
);
