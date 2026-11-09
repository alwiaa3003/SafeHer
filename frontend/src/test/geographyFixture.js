import { jsonResponse } from './trendFixture';

// A test-only shape. It is not a real boundary and is never served by the app.
const TEST_GEOMETRY = {
  type: 'Polygon',
  coordinates: [[[77, 28.5], [77.2, 28.5], [77.2, 28.7], [77, 28.7], [77, 28.5]]],
};

export const testUnit = {
  id: 'a'.repeat(24),
  geographyName: 'Delhi',
  geographyType: 'state_ut',
  adminLevel: '4',
  boundaryVersion: 'osm-relation-1942586-v152',
  verificationStatus: 'verified',
  contextOnly: true,
  geometryType: 'Polygon',
  provenance: {
    provider: 'OpenStreetMap',
    sourceUrl: 'https://www.openstreetmap.org/relation/1942586',
    osm: { elementType: 'relation', elementId: 1942586, version: 152, timestamp: '2026-08-08T10:40:29Z' },
    retrievedAt: '2026-11-09T00:00:00.000Z',
    licence: {
      name: 'Open Data Commons Open Database License (ODbL) 1.0',
      url: 'https://opendatacommons.org/licenses/odbl/1-0/',
      copyrightUrl: 'https://www.openstreetmap.org/copyright',
      attribution: '© OpenStreetMap contributors',
    },
    crs: 'EPSG:4326 (WGS 84), [longitude, latitude]',
  },
  geometry: TEST_GEOMETRY,
};

export function geographyResponse(url) {
  if (String(url).includes('/api/geography?')) {
    const { geometry, ...summary } = testUnit;
    void geometry;
    return jsonResponse({ data: [summary], meta: { total: 1 } });
  }
  return jsonResponse({ data: testUnit, meta: {} });
}
