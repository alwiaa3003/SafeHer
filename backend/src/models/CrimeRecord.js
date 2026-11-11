import mongoose from 'mongoose';
import {
  AGE_GROUPS,
  countField,
  LEGAL_REGIMES,
  REPORTING_UNIT_TYPES,
  VALIDATION_RESULTS,
  VALIDATION_STATUSES,
  yearField,
} from './constants.js';

const { Schema } = mongoose;

const crimeRecordSchema = new Schema(
  {
    year: yearField,
    reportingUnit: { type: String, required: true, trim: true },
    reportingUnitLabelOriginal: { type: String, required: true, trim: true },
    reportingUnitType: { type: String, required: true, enum: REPORTING_UNIT_TYPES },
    // Stable identifier used to join district records to boundaries. Never a runtime name match.
    reportingUnitCode: { type: String, trim: true, match: /^[a-z0-9-]+$/ },
    crimeCategory: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'CrimeCategory', required: true },
    categoryLabelOriginal: { type: String, required: true, trim: true },
    legalRegime: { type: String, required: true, enum: LEGAL_REGIMES },
    ageGroup: { type: String, required: true, enum: AGE_GROUPS, default: 'all' },

    // A missing year is held in coverageRecords, so a record always has a printed count.
    registeredCases: { ...countField, required: true },
    // Victims are a different measure. Left empty unless the source publishes them.
    victims: { ...countField, default: undefined },
    originalValue: {
      type: String,
      required: true,
      match: /^\d+$/,
      validate: {
        validator(value) {
          return Number(value) === this.registeredCases;
        },
        message: 'originalValue must match registeredCases',
      },
    },

    source: { type: Schema.Types.ObjectId, ref: 'DataSource', required: true },
    sourceReference: { type: String, required: true, trim: true },
    pdfPage: { type: Number, min: 1 },
    pdfPageStatus: { type: String, trim: true },
    evidence: {
      fileName: { type: String, trim: true },
      sha256: { type: String, match: /^[0-9a-f]{64}$/ },
      extractPage: { type: Number, min: 1 },
      alsoFoundIn: { type: [String], default: undefined },
    },
    sourceHistory: {
      type: [
        new Schema(
          {
            edition: String,
            tableNumber: String,
            pdfPage: Number,
            tableTitle: String,
            status: String,
            reason: String,
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    validationStatus: { type: String, required: true, enum: VALIDATION_STATUSES },
    validationChecks: {
      type: [
        new Schema(
          {
            rule: { type: String, required: true },
            result: { type: String, required: true, enum: VALIDATION_RESULTS },
            scope: String,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    validationNotes: {
      type: [
        new Schema(
          {
            code: { type: String, required: true },
            text: { type: String, required: true },
            display: { type: Boolean, default: false },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    // Only one published edition may be the displayed value for a statistic.
    isCurrent: { type: Boolean, required: true, default: true },
    extractionMethod: { type: String, trim: true },
    extractedAt: Date,
    checkedAgainstExtractAt: Date,
  },
  { timestamps: true },
);

crimeRecordSchema.index(
  { year: 1, reportingUnit: 1, reportingUnitType: 1, category: 1, legalRegime: 1, ageGroup: 1, source: 1 },
  { unique: true, name: 'uniq_statistic_per_source' },
);
crimeRecordSchema.index(
  { year: 1, reportingUnit: 1, reportingUnitType: 1, crimeCategory: 1, legalRegime: 1, ageGroup: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true }, name: 'uniq_current_statistic' },
);
crimeRecordSchema.index({ reportingUnit: 1, reportingUnitType: 1, year: 1 });
crimeRecordSchema.index({ validationStatus: 1 });

export const CrimeRecord = mongoose.model('CrimeRecord', crimeRecordSchema, 'crimeRecords');
