import mongoose from 'mongoose';
import { REPORTING_LEVELS, SOURCE_TYPES, yearField } from './constants.js';

function isCrimeSource() {
  return this.sourceType === 'crime_statistics';
}

function isBoundarySource() {
  return this.sourceType === 'geographic_boundary';
}

// OSM boundaries are identified by element id and version; a layer published by another
// provider (for example an ArcGIS map service) is identified by its layer URL instead.
function isOsmBoundary() {
  return isBoundarySource.call(this) && !this.boundaryReference?.layerUrl;
}

const dataSourceSchema = new mongoose.Schema(
  {
    // One entry per publication table (e.g. CII2024-V1-T3A.1) or boundary version.
    sourceKey: { type: String, required: true, trim: true },
    sourceType: { type: String, required: true, enum: SOURCE_TYPES },
    sourceName: { type: String, required: true, trim: true },
    publisher: { type: String, required: true, trim: true },
    publicationYear: { ...yearField, required: isCrimeSource },
    volume: { type: String, trim: true },
    tableReference: {
      type: String,
      required: isCrimeSource,
      trim: true,
      validate: {
        validator(value) {
          return !this.sourceType || isCrimeSource.call(this) || !value;
        },
        message: 'Only crime-statistics sources have a table reference',
      },
    },
    tableTitle: { type: String, trim: true },
    // Set for district-level publications, so Delhi-wide pages can leave them out.
    reportingLevel: { type: String, enum: REPORTING_LEVELS },
    // Identifies a boundary version. Kept apart from NCRB table references.
    boundaryReference: {
      provider: { type: String, trim: true, required: isBoundarySource },
      elementType: { type: String, trim: true, required: isBoundarySource },
      elementId: { type: Number, required: isOsmBoundary },
      version: { type: Number, required: isOsmBoundary },
      layerUrl: { type: String, trim: true, match: /^https?:\/\// },
      lastEditedYear: { ...yearField, required: false },
    },
    sourceUrl: { type: String, required: true, trim: true, match: /^https?:\/\// },
    reportingPeriod: {
      from: { ...yearField, required: false },
      to: { ...yearField, required: false },
    },
    editionBasis: { type: String, trim: true },
    extract: {
      fileName: { type: String, trim: true },
      sha256: { type: String, match: /^[0-9a-f]{64}$/ },
      extractPage: { type: Number, min: 1 },
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

dataSourceSchema.index({ sourceKey: 1 }, { unique: true });
dataSourceSchema.index({ publicationYear: 1, tableReference: 1 });

export const DataSource = mongoose.model('DataSource', dataSourceSchema, 'dataSources');
