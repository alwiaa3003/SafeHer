import { createHash } from 'node:crypto';

// The only boundary this project accepts. A refresh must match this identity.
export const DELHI_RELATION = {
  id: 1942586,
  tags: {
    type: 'boundary',
    boundary: 'administrative',
    admin_level: '4',
    name: 'Delhi',
    'ISO3166-2': 'IN-DL',
    wikidata: 'Q9357528',
  },
};

// A plausibility box around Delhi. It also catches swapped latitude and longitude.
export const DELHI_BOUNDS = { minLon: 76.7, maxLon: 77.5, minLat: 28.3, maxLat: 29.0 };

export const OSM_LICENCE = {
  name: 'Open Data Commons Open Database License (ODbL) 1.0',
  url: 'https://opendatacommons.org/licenses/odbl/1-0/',
  copyrightUrl: 'https://www.openstreetmap.org/copyright',
  attribution: '© OpenStreetMap contributors',
};

export const CONTEXT_NOTE =
  'Geographic context only. Volunteer-maintained OpenStreetMap outline; not a legally authoritative boundary. Not established as identical to any NCRB reporting unit.';

const KEPT_TAGS = ['type', 'boundary', 'admin_level', 'border_type', 'name', 'ISO3166-2', 'ref', 'ref:LGD:state', 'wikidata'];
const samePoint = (a, b) => a[0] === b[0] && a[1] === b[1];

export function assembleRings(wayLines) {
  const remaining = wayLines.map((line) => [...line]);
  const rings = [];
  while (remaining.length > 0) {
    const ring = remaining.shift();
    while (ring.length < 2 || !samePoint(ring[0], ring[ring.length - 1])) {
      const end = ring[ring.length - 1];
      const index = remaining.findIndex(
        (line) => samePoint(line[0], end) || samePoint(line[line.length - 1], end),
      );
      if (index < 0) throw new Error('Boundary ways do not form a closed ring');
      const [next] = remaining.splice(index, 1);
      const oriented = samePoint(next[0], end) ? next : [...next].reverse();
      ring.push(...oriented.slice(1));
    }
    rings.push(ring);
  }
  return rings;
}

function signedArea(ring) {
  let total = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    total += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return total / 2;
}

function orient(ring, counterClockwise) {
  return signedArea(ring) > 0 === counterClockwise ? ring : [...ring].reverse();
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function buildGeometry(outerLines, innerLines = []) {
  const polygons = assembleRings(outerLines).map((outer) => [orient(outer, true)]);
  for (const inner of assembleRings(innerLines)) {
    const owner = polygons.find((polygon) => pointInRing(inner[0], polygon[0]));
    if (!owner) throw new Error('An inner boundary ring is outside every outer ring');
    owner.push(orient(inner, false));
  }
  if (polygons.length === 0) throw new Error('Boundary has no outer ring');
  return polygons.length === 1
    ? { type: 'Polygon', coordinates: polygons[0] }
    : { type: 'MultiPolygon', coordinates: polygons };
}

export function assertRelationIdentity(relation, expected = DELHI_RELATION) {
  if (relation?.type !== 'relation' || relation.id !== expected.id) {
    throw new Error(`Expected OSM relation ${expected.id}`);
  }
  for (const [key, value] of Object.entries(expected.tags)) {
    if (relation.tags?.[key] !== value) throw new Error(`OSM tag ${key} does not match the expected boundary`);
  }
}

function linesFromMembers(relation, role, elements) {
  const ways = new Map(elements.filter((e) => e.type === 'way').map((e) => [e.id, e]));
  const nodes = new Map(elements.filter((e) => e.type === 'node').map((e) => [e.id, e]));
  return relation.members
    .filter((member) => member.type === 'way' && member.role === role)
    .map((member) => {
      const way = ways.get(member.ref);
      if (!way) throw new Error(`OSM response is missing way ${member.ref}`);
      return way.nodes.map((id) => {
        const node = nodes.get(id);
        if (!node) throw new Error(`OSM response is missing node ${id}`);
        return [node.lon, node.lat];
      });
    });
}

export function validateRing(ring, bounds) {
  if (!Array.isArray(ring) || ring.length < 4) throw new Error('A ring needs at least four positions');
  if (!samePoint(ring[0], ring[ring.length - 1])) throw new Error('A ring must be closed');
  ring.forEach((position, index) => {
    const [lon, lat] = position;
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) throw new Error('Coordinates must be numbers');
    if (lon < bounds.minLon || lon > bounds.maxLon || lat < bounds.minLat || lat > bounds.maxLat) {
      throw new Error('Coordinates are outside the expected longitude-latitude bounds');
    }
    if (index > 0 && samePoint(position, ring[index - 1])) throw new Error('A ring repeats a position');
  });
}

export function validateGeometry(geometry, bounds = DELHI_BOUNDS) {
  if (geometry?.type === 'Polygon') {
    if (!geometry.coordinates?.length) throw new Error('Polygon has no rings');
    geometry.coordinates.forEach((ring) => validateRing(ring, bounds));
    return;
  }
  if (geometry?.type === 'MultiPolygon') {
    if (!geometry.coordinates?.length) throw new Error('MultiPolygon has no polygons');
    geometry.coordinates.forEach((polygon) => {
      if (!polygon?.length) throw new Error('Polygon has no rings');
      polygon.forEach((ring) => validateRing(ring, bounds));
    });
    return;
  }
  throw new Error('Geometry must be a Polygon or MultiPolygon');
}

export const geometryHash = (geometry) => createHash('sha256').update(JSON.stringify(geometry)).digest('hex');

// Approximate area, used only to flag a suspicious refresh.
export function approximateAreaKm2(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const km2 = (ring) => {
    const lat = (ring.reduce((sum, p) => sum + p[1], 0) / ring.length) * (Math.PI / 180);
    return Math.abs(signedArea(ring)) * 111.32 * 111.32 * Math.cos(lat);
  };
  return polygons.reduce(
    (total, [outer, ...holes]) => total + km2(outer) - holes.reduce((sum, hole) => sum + km2(hole), 0),
    0,
  );
}

export function featureFromOsm(apiResponse, retrievedAt) {
  const relation = apiResponse.elements.find((e) => e.type === 'relation' && e.id === DELHI_RELATION.id);
  assertRelationIdentity(relation);
  const geometry = buildGeometry(
    linesFromMembers(relation, 'outer', apiResponse.elements),
    linesFromMembers(relation, 'inner', apiResponse.elements),
  );
  validateGeometry(geometry);

  const tags = Object.fromEntries(KEPT_TAGS.filter((key) => key in relation.tags).map((key) => [key, relation.tags[key]]));
  return {
    type: 'Feature',
    properties: {
      geographyName: relation.tags.name,
      geographyType: 'state_ut',
      adminLevel: relation.tags.admin_level,
      boundaryVersion: `osm-relation-${relation.id}-v${relation.version}`,
      verificationStatus: 'verified',
      contextOnly: true,
      notes: CONTEXT_NOTE,
      provenance: {
        provider: 'OpenStreetMap',
        sourceUrl: `https://www.openstreetmap.org/relation/${relation.id}`,
        retrievalUrl: `https://api.openstreetmap.org/api/0.6/relation/${relation.id}/full.json`,
        osm: {
          elementType: 'relation',
          elementId: relation.id,
          version: relation.version,
          timestamp: relation.timestamp,
          changeset: relation.changeset,
          tags,
        },
        retrievedAt,
        licence: OSM_LICENCE,
        crs: 'EPSG:4326 (WGS 84), [longitude, latitude]',
        geometrySha256: geometryHash(geometry),
      },
    },
    geometry,
  };
}

export function validateBoundaryFeature(feature) {
  if (feature?.type !== 'Feature') throw new Error('Boundary must be a GeoJSON Feature');
  const { properties, geometry } = feature;
  const osm = properties?.provenance?.osm;
  if (osm?.elementType !== 'relation' || osm.elementId !== DELHI_RELATION.id) {
    throw new Error(`Boundary must come from OSM relation ${DELHI_RELATION.id}`);
  }
  for (const [key, value] of Object.entries(DELHI_RELATION.tags)) {
    if (osm.tags?.[key] !== value) throw new Error(`OSM tag ${key} does not match the expected boundary`);
  }
  validateGeometry(geometry);
  if (properties.provenance.geometrySha256 !== geometryHash(geometry)) {
    throw new Error('Boundary geometry does not match its recorded hash');
  }
  if (properties.contextOnly !== true) throw new Error('Boundary must be marked context-only');
}
