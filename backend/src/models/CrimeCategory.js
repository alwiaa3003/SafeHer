import mongoose from 'mongoose';
import { COMPARABILITY_STATUSES, LEGAL_REGIMES, yearField } from './constants.js';

// Labels are stored per publication. Equivalence across editions is never assumed.
const crimeCategorySchema = new mongoose.Schema(
  {
    originalCategoryName: { type: String, required: true, trim: true },
    normalizedCategoryName: { type: String, trim: true },
    // Despite its name, this holds the source's publication year. The years a table
    // covers are in source.reportingPeriod. The API exposes this as publicationYear.
    reportingYear: yearField,
    legalReference: { type: String, trim: true },
    legalFramework: { type: String, required: true, enum: LEGAL_REGIMES },
    definition: { type: String, trim: true },
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource', required: true },
    comparabilityStatus: {
      type: String,
      enum: COMPARABILITY_STATUSES,
      required: true,
      default: 'not_assessed',
    },
  },
  { timestamps: true },
);

crimeCategorySchema.index(
  { originalCategoryName: 1, reportingYear: 1, legalFramework: 1, source: 1 },
  { unique: true },
);
crimeCategorySchema.index({ reportingYear: 1, legalFramework: 1 });

export const CrimeCategory = mongoose.model('CrimeCategory', crimeCategorySchema, 'crimeCategories');
