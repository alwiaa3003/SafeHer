import mongoose from 'mongoose';
import { GEOGRAPHY_TYPES } from './constants.js';

function positionIsValid(position) {
  return (
    Array.isArray(position) &&
    position.length >= 2 &&
    position[0] >= -180 &&
    position[0] <= 180 &&
    position[1] >= -90 &&
    position[1] <= 90
  );
}

function ringIsValid(ring) {
  if (!Array.isArray(ring) || ring.length < 4 || !ring.every(positionIsValid)) return false;
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}

const polygonIsValid = (rings) => Array.isArray(rings) && rings.length > 0 && rings.every(ringIsValid);

// Coordinates must be [longitude, latitude], as GeoJSON requires.
const geometrySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Polygon', 'MultiPolygon'], required: true },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator(value) {
          if (this.type === 'Polygon') return polygonIsValid(value);
          return Array.isArray(value) && value.length > 0 && value.every(polygonIsValid);
        },
        message: 'Geometry must be valid GeoJSON with [longitude, latitude] positions',
      },
    },
  },
  { _id: false },
);

const provenanceSchema = new mongoose.Schema(
  {
    provider: { type: String, trim: true },
    sourceUrl: { type: String, trim: true, match: /^https?:\/\// },
    retrievalUrl: { type: String, trim: true, match: /^https?:\/\// },
    osm: {
      elementType: { type: String, enum: ['node', 'way', 'relation'] },
      elementId: Number,
      version: Number,
      timestamp: Date,
      changeset: Number,
      tags: mongoose.Schema.Types.Mixed,
    },
    retrievedAt: Date,
    licence: { name: String, url: String, copyrightUrl: String, attribution: String },
    crs: { type: String, trim: true },
    geometrySha256: { type: String, match: /^[0-9a-f]{64}$/ },
  },
  { _id: false },
);

function verifiedRecordIsComplete(status) {
  if (status !== 'verified') return true;
  const source = this.provenance;
  return Boolean(
    this.geometry &&
      source?.provider &&
      source.sourceUrl &&
      source.retrievedAt &&
      source.licence?.name &&
      source.licence?.attribution &&
      source.crs &&
      source.geometrySha256,
  );
}

const geographicalUnitSchema = new mongoose.Schema(
  {
    geographyName: { type: String, required: true, trim: true },
    geographyType: { type: String, required: true, enum: GEOGRAPHY_TYPES },
    adminLevel: { type: String, trim: true },
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource', required: true },
    boundaryVersion: { type: String, required: true, trim: true },
    validityPeriod: { from: Date, to: Date },
    // Left empty until a verified, licensed boundary is available.
    geometry: { type: geometrySchema, default: undefined },
    provenance: { type: provenanceSchema, default: undefined },
    // "verified" means the source identity and licence were checked. It is not a legal survey.
    verificationStatus: {
      type: String,
      required: true,
      enum: ['unverified', 'verified'],
      default: 'unverified',
      validate: {
        validator: verifiedRecordIsComplete,
        message: 'A verified unit needs geometry, source, licence, attribution, CRS and a geometry hash',
      },
    },
    // Boundaries give geographic context. Crime values are never stored on them.
    contextOnly: { type: Boolean, required: true, default: true },
    isCurrent: { type: Boolean, required: true, default: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

geographicalUnitSchema.index(
  { geographyName: 1, geographyType: 1, boundaryVersion: 1, source: 1 },
  { unique: true },
);
geographicalUnitSchema.index(
  { geographyName: 1, geographyType: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true }, name: 'uniq_current_geography' },
);
geographicalUnitSchema.index({ verificationStatus: 1, isCurrent: 1, geographyType: 1 });
geographicalUnitSchema.index({ geometry: '2dsphere' }, { sparse: true });

export const GeographicalUnit = mongoose.model(
  'GeographicalUnit',
  geographicalUnitSchema,
  'geographicalUnits',
);
