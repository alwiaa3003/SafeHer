import { readFile } from 'node:fs/promises';
import { validateBoundaryFeature } from '../geography/osmBoundary.js';
import { DataSource, ensureIndexes, GeographicalUnit } from '../models/index.js';

const SNAPSHOT = new URL('../../data/geography/delhi-boundary.geojson', import.meta.url);

export async function loadBoundarySnapshot() {
  return JSON.parse(await readFile(SNAPSHOT, 'utf8'));
}

async function ensureSource(provenance) {
  const { osm } = provenance;
  const sourceKey = `OSM-RELATION-${osm.elementId}-V${osm.version}`;
  const existing = await DataSource.findOne({ sourceKey }).lean();
  if (existing) return existing;
  return DataSource.create({
    sourceKey,
    sourceType: 'geographic_boundary',
    sourceName: `OpenStreetMap relation ${osm.elementId}`,
    publisher: 'OpenStreetMap contributors',
    boundaryReference: {
      provider: 'OpenStreetMap',
      elementType: 'relation',
      elementId: osm.elementId,
      version: osm.version,
      lastEditedYear: new Date(osm.timestamp).getUTCFullYear(),
    },
    sourceUrl: provenance.sourceUrl,
    notes: `${provenance.licence.name}. ${provenance.licence.attribution}. Geographic boundary only; contains no crime data.`,
  });
}

// Adds the boundary if absent. Replacing the current version needs { supersede: true },
// and an older version is marked non-current rather than deleted.
export async function importDelhiBoundary({ feature, supersede = false } = {}) {
  const boundary = feature ?? (await loadBoundarySnapshot());
  validateBoundaryFeature(boundary);
  await ensureIndexes();

  const { properties, geometry } = boundary;
  const { provenance } = properties;
  const identity = { geographyName: properties.geographyName, geographyType: properties.geographyType };

  const sameVersion = await GeographicalUnit.findOne({ ...identity, boundaryVersion: properties.boundaryVersion }).lean();
  if (sameVersion) {
    if (sameVersion.provenance?.geometrySha256 !== provenance.geometrySha256) {
      return { action: 'conflict', reason: 'Same version exists with different geometry. Nothing changed.' };
    }
    return { action: 'unchanged', boundaryVersion: properties.boundaryVersion };
  }

  const current = await GeographicalUnit.findOne({ ...identity, isCurrent: true });
  if (current) {
    if (current.provenance?.osm?.elementId !== provenance.osm.elementId) {
      return { action: 'conflict', reason: 'Current boundary comes from a different OSM element. Nothing changed.' };
    }
    if (!supersede) {
      return { action: 'conflict', reason: `Current version is ${current.boundaryVersion}. Use --supersede to replace it.` };
    }
  }

  const source = await ensureSource(provenance);
  const unit = new GeographicalUnit({ ...properties, source: source._id, geometry, isCurrent: true });
  await unit.validate();

  if (current) {
    current.isCurrent = false;
    await current.save();
  }
  try {
    await unit.save();
  } catch (error) {
    if (current) {
      current.isCurrent = true;
      await current.save();
    }
    throw error;
  }
  return {
    action: current ? 'superseded' : 'inserted',
    boundaryVersion: properties.boundaryVersion,
    previousVersion: current?.boundaryVersion,
  };
}
