import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { DataSource, ensureIndexes, GeographicalUnit } from '../models/index.js';

// Police-district boundary names as published by GSDL, mapped to SafeHer's unit codes.
// The district data uses the same codes, so the join never depends on matching names at runtime.
export const GSDL_DISTRICT_CODES = {
  CENTRAL: 'central', DWARKA: 'dwarka', EAST: 'east', AIRPORT: 'igi-airport', 'NEW DELHI': 'new-delhi',
  NORTH: 'north', 'NORTH EAST': 'north-east', 'NORTH WEST': 'north-west', OUTER: 'outer',
  'OUTER NORTH': 'outer-north', ROHINI: 'rohini', SHAHDARA: 'shahdara', SOUTH: 'south',
  'SOUTH EAST': 'south-east', 'SOUTH WEST': 'south-west', WEST: 'west',
};

const DISTRICT_NAMES = {
  central: 'Central', dwarka: 'Dwarka', east: 'East', 'igi-airport': 'IGI Airport', 'new-delhi': 'New Delhi',
  north: 'North', 'north-east': 'North-East', 'north-west': 'North-West', outer: 'Outer', 'outer-north': 'Outer North',
  rohini: 'Rohini', shahdara: 'Shahdara', south: 'South', 'south-east': 'South-East', 'south-west': 'South-West', west: 'West',
};

// Spellings other layers may use for the same districts. Matching is exact after these, never fuzzy.
const NAME_ALIASES = { 'IGI AIRPORT': 'igi-airport', 'IGI': 'igi-airport' };

const GSDL_LAYER ='https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/0';
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

// A ring that touches itself at a repeated vertex is invalid for MongoDB's 2dsphere index.
// The GSDL layer has three such points, each closing a sliver of two or three vertices. Only
// loops of at most MAX_SLIVER vertices are removed; anything larger is left to fail loudly.
const MAX_SLIVER = 3;
export function removeSliverLoops(ring) {
  let points = ring.slice(0, -1);
  for (let changed = true; changed;) {
    changed = false;
    const seen = new Map();
    for (let j = 0; j < points.length && !changed; j += 1) {
      const key = points[j].join(',');
      if (seen.has(key)) {
        const i = seen.get(key);
        const inner = j - i;
        const wrap = points.length - j + i;
        if (inner <= MAX_SLIVER) { points = [...points.slice(0, i), ...points.slice(j)]; changed = true; }
        else if (wrap <= MAX_SLIVER) { points = points.slice(i, j); changed = true; }
      }
      seen.set(key, j);
    }
  }
  return [...points, points[0]];
}

// GSDL positions carry Z and M values ([lng, lat, 0, null]); GeoJSON storage needs [lng, lat].
export function twoDimensional(geometry) {
  const ring = (positions) => removeSliverLoops(positions.map(([lng, lat]) => [lng, lat]));
  if (geometry.type === 'Polygon') return { type: 'Polygon', coordinates: geometry.coordinates.map(ring) };
  return { type: 'MultiPolygon', coordinates: geometry.coordinates.map((polygon) => polygon.map(ring)) };
}

// Every feature must map to a distinct known district, and all 16 must be present.
export function districtFeatures(collection, nameField = 'DISTRICT') {
  if (collection?.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
    throw new Error('Boundary file must be a GeoJSON FeatureCollection');
  }
  const byCode = new Map();
  for (const feature of collection.features) {
    const name = String(feature.properties?.[nameField] ?? '').trim().toUpperCase().replace(/-/g, ' ').replace(/\s+/g, ' ');
    const code = GSDL_DISTRICT_CODES[name] ?? NAME_ALIASES[name];
    if (!code) throw new Error(`Unknown police district "${feature.properties?.[nameField]}"`);
    if (byCode.has(code)) throw new Error(`Duplicate police district "${code}"`);
    if (!['Polygon', 'MultiPolygon'].includes(feature.geometry?.type)) throw new Error(`District ${code} has no polygon geometry`);
    byCode.set(code, feature);
  }
  const missing = Object.keys(DISTRICT_NAMES).filter((code) => !byCode.has(code));
  if (missing.length > 0) throw new Error(`Missing police districts: ${missing.join(', ')}`);
  return byCode;
}

// Imports the GSDL police-district layer FOR LOCAL REVIEW ONLY.
// GSDL states "All Rights Reserved" and publishes no licence, so the units are stored as
// unverified. The public boundary endpoint never serves unverified units unless the app was
// started with reviewBoundaries (the in-memory development server only).
export async function importReviewOnlyGsdlDistricts(filePath) {
  if (process.env.NODE_ENV === 'production') throw new Error('Review-only boundaries cannot be imported in production');
  const text = await readFile(filePath, 'utf8');
  const byCode = districtFeatures(JSON.parse(text));
  await ensureIndexes();
  const fileSha = sha256(text);
  const boundaryVersion = `gsdl-dp-district-local-review-${fileSha.slice(0, 12)}`;
  const sourceKey = `GSDL-DP-DISTRICT-BOUNDARY-REVIEW-${fileSha.slice(0, 12)}`;
  const source = (await DataSource.findOne({ sourceKey }).lean()) ?? (await DataSource.create({
    sourceKey,
    sourceType: 'geographic_boundary',
    sourceName: 'GSDL Delhi Police district boundaries (local review copy)',
    publisher: 'GeoSpatial Delhi Limited',
    boundaryReference: { provider: 'GSDL', elementType: 'arcgis_layer', layerUrl: GSDL_LAYER },
    sourceUrl: GSDL_LAYER,
    notes: 'Not licensed for publication: the GSDL website states "All Rights Reserved". Imported only into a temporary development database for review.',
  }));

  let inserted = 0;
  for (const [code, original] of byCode) {
    const feature = { ...original, geometry: twoDimensional(original.geometry) };
    const exists = await GeographicalUnit.findOne({ unitCode: code, geographyType: 'police_district', boundaryVersion }).lean();
    if (exists) continue;
    await GeographicalUnit.create({
      geographyName: DISTRICT_NAMES[code],
      geographyType: 'police_district',
      unitCode: code,
      source: source._id,
      boundaryVersion,
      geometry: feature.geometry,
      provenance: {
        provider: 'GSDL',
        sourceUrl: GSDL_LAYER,
        crs: 'EPSG:4326 (requested from the service; native EPSG:32643). Z/M values dropped; self-touching slivers of up to 3 vertices removed',
        geometrySha256: sha256(JSON.stringify(feature.geometry)),
        licence: { name: 'None stated; website says All Rights Reserved', attribution: '© GeoSpatial Delhi Limited' },
      },
      verificationStatus: 'unverified',
      contextOnly: false,
      isCurrent: true,
      notes: 'Local review only. Not licensed for publication.',
    });
    inserted += 1;
  }
  return { action: inserted ? 'inserted' : 'unchanged', inserted, boundaryVersion };
}

const RESTRICTED_PROVIDERS = ['GSDL'];

// Imports a police-district layer whose licence permits public display, as verified units.
// It is used only once a licence (or written permission) exists; none does at present (OR-45).
// Every field below is required, and a provider that publishes no open licence needs a
// permissionReference recording the written permission.
export async function importLicensedPoliceDistricts(filePath, { provider, sourceUrl, sourceName, boundaryVersion, crs, retrievedAt, licence, nameField = 'DISTRICT' }) {
  for (const [field, value] of Object.entries({ provider, sourceUrl, sourceName, boundaryVersion, crs, retrievedAt, 'licence.name': licence?.name, 'licence.attribution': licence?.attribution })) {
    if (!value) throw new Error(`Licensed boundary import needs ${field}`);
  }
  if (RESTRICTED_PROVIDERS.includes(provider) && !licence.permissionReference) {
    throw new Error(`${provider} publishes no open licence: record the written permission in licence.permissionReference first`);
  }
  const text = await readFile(filePath, 'utf8');
  const byCode = districtFeatures(JSON.parse(text), nameField);
  await ensureIndexes();
  const fileSha = sha256(text);
  const sourceKey = `${provider.toUpperCase()}-POLICE-DISTRICT-BOUNDARY-${fileSha.slice(0, 12)}`;
  const source = (await DataSource.findOne({ sourceKey }).lean()) ?? (await DataSource.create({
    sourceKey,
    sourceType: 'geographic_boundary',
    sourceName,
    publisher: provider,
    boundaryReference: { provider, elementType: 'boundary_layer', layerUrl: sourceUrl },
    sourceUrl,
    notes: `${licence.name}. ${licence.attribution}.${licence.permissionReference ? ` Permission: ${licence.permissionReference}.` : ''} File sha256 ${fileSha}.`,
  }));

  let inserted = 0;
  for (const [code, original] of byCode) {
    const geometry = twoDimensional(original.geometry);
    if (await GeographicalUnit.exists({ unitCode: code, geographyType: 'police_district', boundaryVersion })) continue;
    await GeographicalUnit.create({
      geographyName: DISTRICT_NAMES[code],
      geographyType: 'police_district',
      unitCode: code,
      source: source._id,
      boundaryVersion,
      geometry,
      provenance: { provider, sourceUrl, crs, retrievedAt: new Date(retrievedAt), geometrySha256: sha256(JSON.stringify(geometry)), licence },
      verificationStatus: 'verified',
      contextOnly: false,
      isCurrent: true,
    });
    inserted += 1;
  }
  return { action: inserted ? 'inserted' : 'unchanged', inserted, boundaryVersion };
}
