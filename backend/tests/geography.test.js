import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import {
  approximateAreaKm2,
  assembleRings,
  buildGeometry,
  DELHI_BOUNDS,
  DELHI_RELATION,
  featureFromOsm,
  geometryHash,
  validateBoundaryFeature,
  validateGeometry,
} from '../src/geography/osmBoundary.js';
import { DataSource, GeographicalUnit } from '../src/models/index.js';
import { importDelhiBoundary, loadBoundarySnapshot } from '../src/seed/importBoundary.js';
import { objectId } from './helpers/factories.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

const app = createApp();
const clone = (value) => JSON.parse(JSON.stringify(value));
const square = (x, y, size) => [[x, y], [x + size, y], [x + size, y + size], [x, y + size], [x, y]];

function nextVersion(feature, version) {
  const next = clone(feature);
  next.properties.boundaryVersion = `osm-relation-${DELHI_RELATION.id}-v${version}`;
  next.properties.provenance.osm.version = version;
  return next;
}

function osmResponse(overrides = {}) {
  return {
    elements: [
      { type: 'node', id: 1, lon: 77.0, lat: 28.5 },
      { type: 'node', id: 2, lon: 77.2, lat: 28.5 },
      { type: 'node', id: 3, lon: 77.2, lat: 28.7 },
      { type: 'way', id: 10, nodes: [1, 2, 3] },
      { type: 'way', id: 11, nodes: [3, 1] },
      {
        type: 'relation',
        id: DELHI_RELATION.id,
        version: 9,
        timestamp: '2026-01-01T00:00:00Z',
        changeset: 5,
        tags: { ...DELHI_RELATION.tags },
        members: [{ type: 'way', ref: 10, role: 'outer' }, { type: 'way', ref: 11, role: 'outer' }],
        ...overrides,
      },
    ],
  };
}

describe('ring assembly', () => {
  it('joins reversed ways into a closed ring', () => {
    const rings = assembleRings([[[0, 0], [1, 0], [1, 1]], [[0, 0], [1, 1]]]);
    expect(rings).toHaveLength(1);
    expect(rings[0][0]).toEqual(rings[0][rings[0].length - 1]);
  });

  it('rejects an open boundary', () => {
    expect(() => assembleRings([[[0, 0], [1, 0], [1, 1]]])).toThrow(/closed ring/);
  });

  it('preserves holes and multiple polygons', () => {
    const multi = buildGeometry([square(77, 28.5, 0.1), square(77.3, 28.5, 0.1)], [square(77.02, 28.52, 0.02)]);
    expect(multi.type).toBe('MultiPolygon');
    expect(multi.coordinates[0]).toHaveLength(2);
    expect(multi.coordinates[1]).toHaveLength(1);
  });

  it('rejects a hole outside every polygon', () => {
    expect(() => buildGeometry([square(77, 28.5, 0.1)], [square(77.3, 28.8, 0.01)])).toThrow(/outside/);
  });
});

describe('OSM identity', () => {
  it('builds a feature from the expected relation', () => {
    const feature = featureFromOsm(osmResponse(), '2026-11-09T00:00:00.000Z');
    expect(feature.properties.boundaryVersion).toBe(`osm-relation-${DELHI_RELATION.id}-v9`);
    expect(feature.properties.provenance.osm.elementId).toBe(DELHI_RELATION.id);
    expect(() => validateBoundaryFeature(feature)).not.toThrow();
  });

  it('refuses a different administrative level', () => {
    const tags = { ...DELHI_RELATION.tags, admin_level: '5' };
    expect(() => featureFromOsm(osmResponse({ tags }), 'x')).toThrow(/admin_level/);
  });

  it('refuses a response without the expected relation', () => {
    expect(() => featureFromOsm(osmResponse({ id: 999 }), 'x')).toThrow(/Expected OSM relation/);
  });

  it('refuses incomplete OSM data', () => {
    const response = osmResponse();
    response.elements = response.elements.filter((e) => e.id !== 11);
    expect(() => featureFromOsm(response, 'x')).toThrow(/missing way/);
  });
});

describe('coordinate validation', () => {
  const polygon = (ring) => ({ type: 'Polygon', coordinates: [ring] });

  it('accepts longitude-latitude inside the bounds', () => {
    expect(() => validateGeometry(polygon(square(77, 28.5, 0.1)))).not.toThrow();
  });

  it('rejects swapped latitude and longitude', () => {
    const swapped = square(77, 28.5, 0.1).map(([lon, lat]) => [lat, lon]);
    expect(() => validateGeometry(polygon(swapped))).toThrow(/bounds/);
  });

  it('rejects an unclosed, short, repeated or non-numeric ring', () => {
    expect(() => validateGeometry(polygon(square(77, 28.5, 0.1).slice(0, 4)))).toThrow(/closed/);
    expect(() => validateGeometry(polygon([[77, 28.5], [77.1, 28.5], [77, 28.5]]))).toThrow(/four/);
    expect(() => validateGeometry(polygon([[77, 28.5], [77, 28.5], [77.1, 28.6], [77, 28.5]]))).toThrow(/repeats/);
    expect(() => validateGeometry(polygon([[77, 'x'], [77.1, 28.5], [77.1, 28.6], [77, 'x']]))).toThrow(/numbers/);
  });

  it('rejects other geometry types', () => {
    expect(() => validateGeometry({ type: 'Point', coordinates: [77, 28.5] })).toThrow(/Polygon/);
  });
});

describe('committed boundary snapshot', () => {
  it('is valid, within Delhi bounds and carries no crime values', async () => {
    const feature = await loadBoundarySnapshot();
    expect(() => validateBoundaryFeature(feature)).not.toThrow();
    expect(feature.properties.provenance.osm.tags).toMatchObject(DELHI_RELATION.tags);
    expect(feature.properties.provenance.licence.attribution).toMatch(/OpenStreetMap/);
    expect(approximateAreaKm2(feature.geometry)).toBeGreaterThan(1300);
    expect(approximateAreaKm2(feature.geometry)).toBeLessThan(1700);
    expect(JSON.stringify(feature.properties)).not.toMatch(/registeredCases|victims|crime count|risk|safety/i);
    expect(DELHI_BOUNDS.minLon).toBeLessThan(feature.geometry.coordinates[0][0][0]);
  });

  it('detects a geometry that does not match its hash', async () => {
    const feature = await loadBoundarySnapshot();
    feature.geometry.coordinates[0][1][0] += 0.001;
    expect(() => validateBoundaryFeature(feature)).toThrow(/hash/);
  });

  it('refuses a boundary from another OSM element', async () => {
    const feature = await loadBoundarySnapshot();
    feature.properties.provenance.osm.elementId = 123;
    expect(() => validateBoundaryFeature(feature)).toThrow(/relation/);
  });
});

describe('database behaviour', () => {
  beforeAll(startTestDb);
  afterEach(clearTestDb);
  afterAll(stopTestDb);

  describe('provenance validation', () => {
    const base = () => ({ geographyName: 'X', geographyType: 'state_ut', source: objectId(), boundaryVersion: 'v1' });

    it('refuses a verified unit without geometry or provenance', () => {
      const error = new GeographicalUnit({ ...base(), verificationStatus: 'verified' }).validateSync();
      expect(error.errors.verificationStatus).toBeDefined();
    });

    it('refuses a verified unit without attribution', async () => {
      const { properties, geometry } = await loadBoundarySnapshot();
      const provenance = clone(properties.provenance);
      delete provenance.licence.attribution;
      const error = new GeographicalUnit({ ...base(), verificationStatus: 'verified', geometry, provenance }).validateSync();
      expect(error.errors.verificationStatus).toBeDefined();
    });

    it('defaults to context-only and unverified', () => {
      expect(new GeographicalUnit(base())).toMatchObject({ contextOnly: true, verificationStatus: 'unverified' });
    });
  });

  describe('import', () => {
    it('stores the boundary with a working geospatial query', async () => {
      expect((await importDelhiBoundary()).action).toBe('inserted');
      const inside = await GeographicalUnit.countDocuments({
        geometry: { $geoIntersects: { $geometry: { type: 'Point', coordinates: [77.209, 28.6139] } } },
      });
      expect(inside).toBe(1);
      const outside = await GeographicalUnit.countDocuments({
        geometry: { $geoIntersects: { $geometry: { type: 'Point', coordinates: [72.87, 19.07] } } },
      });
      expect(outside).toBe(0);
    });

    it('is idempotent', async () => {
      await importDelhiBoundary();
      expect((await importDelhiBoundary()).action).toBe('unchanged');
      expect(await GeographicalUnit.countDocuments()).toBe(1);
      expect(await DataSource.countDocuments()).toBe(1);
    });

    it('will not replace the current version without supersede', async () => {
      await importDelhiBoundary();
      const feature = nextVersion(await loadBoundarySnapshot(), 9999);
      expect((await importDelhiBoundary({ feature })).action).toBe('conflict');
      expect(await GeographicalUnit.countDocuments()).toBe(1);
    });

    it('keeps the old version when superseding', async () => {
      await importDelhiBoundary();
      const feature = nextVersion(await loadBoundarySnapshot(), 9999);
      expect((await importDelhiBoundary({ feature, supersede: true })).action).toBe('superseded');
      expect(await GeographicalUnit.countDocuments()).toBe(2);
      expect(await GeographicalUnit.countDocuments({ isCurrent: true })).toBe(1);
    });

    it('reports different geometry under the same version and changes nothing', async () => {
      await importDelhiBoundary();
      const feature = await loadBoundarySnapshot();
      feature.geometry.coordinates[0][1][0] += 0.0001;
      feature.properties.provenance.geometrySha256 = geometryHash(feature.geometry);
      expect((await importDelhiBoundary({ feature })).action).toBe('conflict');
      expect(await GeographicalUnit.countDocuments()).toBe(1);
    });

    it('leaves unrelated units untouched', async () => {
      const other = await GeographicalUnit.create({ geographyName: 'Other', geographyType: 'other', source: objectId(), boundaryVersion: 'v1' });
      await importDelhiBoundary();
      expect(await GeographicalUnit.findById(other._id).lean()).toMatchObject({ geographyName: 'Other' });
    });

    it('allows only one current unit per name and type', async () => {
      const unit = { geographyName: 'Same', geographyType: 'other', source: objectId() };
      await GeographicalUnit.create({ ...unit, boundaryVersion: 'v1' });
      await expect(GeographicalUnit.create({ ...unit, boundaryVersion: 'v2' })).rejects.toMatchObject({ code: 11000 });
    });
  });

  describe('API', () => {
    it('returns an empty list when nothing is loaded', async () => {
      const response = await request(app).get('/api/geography');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('lists summaries without coordinates', async () => {
      await importDelhiBoundary();
      const response = await request(app).get('/api/geography?geographyType=state_ut');
      expect(response.status).toBe(200);
      expect(response.body.meta.caveats).toContain('GEOGRAPHIC_CONTEXT_ONLY');
      const [unit] = response.body.data;
      expect(unit).toMatchObject({ geographyName: 'Delhi', adminLevel: '4', contextOnly: true, verificationStatus: 'verified' });
      expect(unit.provenance.osm.elementId).toBe(DELHI_RELATION.id);
      expect(unit.geometry).toBeUndefined();
    });

    it('returns full geometry and provenance for one unit', async () => {
      await importDelhiBoundary();
      const list = await request(app).get('/api/geography');
      const response = await request(app).get(`/api/geography/${list.body.data[0].id}`);
      expect(response.status).toBe(200);
      expect(response.body.data.geometry.type).toBe(response.body.data.geometryType);
      expect(response.body.data.provenance.licence.attribution).toBe('© OpenStreetMap contributors');
      expect(JSON.stringify(response.body)).not.toMatch(/registeredCases|victims/);
    });

    it('hides unverified units', async () => {
      await GeographicalUnit.create({ geographyName: 'Unverified', geographyType: 'other', source: objectId(), boundaryVersion: 'v1' });
      expect((await request(app).get('/api/geography')).body.data).toEqual([]);
    });

    it('hides superseded versions', async () => {
      await importDelhiBoundary();
      await importDelhiBoundary({ feature: nextVersion(await loadBoundarySnapshot(), 9999), supersede: true });
      const response = await request(app).get('/api/geography');
      expect(response.body.data.map((unit) => unit.provenance.osm.version)).toEqual([9999]);
    });

    it('rejects a bad id, an unknown id and bad filters', async () => {
      const badId = await request(app).get('/api/geography/not-an-id');
      expect(badId.status).toBe(400);
      expect(badId.body.error.code).toBe('INVALID_PARAMETER');

      const unknown = await request(app).get(`/api/geography/${objectId()}`);
      expect(unknown.status).toBe(404);
      expect(unknown.body.error.code).toBe('GEOGRAPHY_NOT_FOUND');

      expect((await request(app).get('/api/geography?geographyType=planet')).status).toBe(400);
      expect((await request(app).get('/api/geography?includeCrime=true')).status).toBe(400);
    });
  });
});
