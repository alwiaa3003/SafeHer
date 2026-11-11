import { delhiUtStatistics } from '../data/ncrbDelhiUt';
import { districtResponse } from './districtFixture';
import { testUnit } from './geographyFixture';
import { jsonResponse, toApiStatistic } from './trendFixture';

// Mirrors the API's response shapes, built from the same approved figures the seed imports.
const RESULT = { passed: 'PASS', pending: 'PENDING', failed: 'FAIL' };
const periodOf = (title) => {
  const m = title.match(/(\d{4})-(\d{4})\s*$/);
  return m ? { from: Number(m[1]), to: Number(m[2]) } : null;
};

export function categoryLabels() {
  const seen = new Map();
  delhiUtStatistics.forEach((s) => {
    if (seen.has(s.edition)) return;
    seen.set(s.edition, {
      id: `cat-${seen.size + 1}`,
      originalCategoryName: s.categoryLabelOriginal,
      normalizedCategoryName: s.crimeCategory,
      publicationYear: Number(s.edition.match(/\d{4}/)[0]),
      reportingPeriod: periodOf(s.categoryLabelOriginal),
      legalReference: s.categoryLabelOriginal,
      legalFramework: s.legalRegime,
      definition: null,
      comparabilityStatus: 'not_assessed',
      source: { sourceName: s.edition, sourceType: 'crime_statistics', tableReference: s.tableNumber },
    });
  });
  return [...seen.values()];
}

// Built as the importer builds dataSources documents, plus the boundary source.
export function dataSources() {
  const crime = new Map();
  delhiUtStatistics.forEach((s) => {
    const sourceKey = s.sourceKey ?? s.sourceReference.replace(/-p\d+$/, '');
    if (crime.has(sourceKey)) return;
    crime.set(sourceKey, {
      id: `src-${sourceKey}`, sourceKey, sourceType: 'crime_statistics', sourceName: s.edition,
      publisher: 'National Crime Records Bureau', publicationYear: Number(s.edition.match(/\d{4}/)[0]),
      volume: s.volume, tableReference: s.tableNumber, boundaryReference: null, tableTitle: s.categoryLabelOriginal,
      sourceUrl: s.sourceUrl, reportingPeriod: periodOf(s.categoryLabelOriginal), editionBasis: s.editionBasis,
      extract: { fileName: s.evidence.fileName, sha256: s.evidence.sha256, ...(s.evidence.extractPage ? { extractPage: s.evidence.extractPage } : {}) },
      notes: s.sourceNotes ?? null,
    });
  });
  const { osm, licence, sourceUrl } = testUnit.provenance;
  const boundary = {
    id: `src-OSM-RELATION-${osm.elementId}-V${osm.version}`, sourceKey: `OSM-RELATION-${osm.elementId}-V${osm.version}`,
    sourceType: 'geographic_boundary', sourceName: `OpenStreetMap relation ${osm.elementId}`, publisher: 'OpenStreetMap contributors',
    publicationYear: null, volume: null, tableReference: null,
    boundaryReference: { provider: 'OpenStreetMap', elementType: 'relation', elementId: osm.elementId, version: osm.version, lastEditedYear: 2026 },
    tableTitle: null, sourceUrl, reportingPeriod: null, editionBasis: null, extract: null,
    notes: `${licence.name}. ${licence.attribution}. Geographic boundary only; contains no crime data.`,
  };
  return [...crime.values(), boundary];
}

const sourceFor = (s) => dataSources().find((d) => d.sourceKey === (s.sourceKey ?? s.sourceReference.replace(/-p\d+$/, '')));

export function validationChecks(checkName) {
  return delhiUtStatistics.flatMap((s) =>
    Object.entries(s.validationChecks)
      .filter(([rule]) => !checkName || rule === checkName)
      .map(([rule, check]) => ({
        id: `${rule}-${s.year}`, checkName: rule, reportingYear: s.year, reportingUnit: s.reportingUnit,
        reportingUnitType: s.reportingUnitType, result: RESULT[check.status], explanation: check.scope,
        checkedAt: check.status === 'pending' ? null : `${s.checkedAgainstExtractAt}T00:00:00.000Z`, source: sourceFor(s),
      })),
  );
}

export function crimeRecords(reportingUnitType) {
  if (reportingUnitType && reportingUnitType !== 'state_ut') return [];
  return delhiUtStatistics.map((s) => ({ ...toApiStatistic(s), id: `rec-${s.year}` }));
}

const page = (data) => jsonResponse({ data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } });

// Test-only place-search responses, in the API's shape. Not real geocoding results.
export const TEST_PLACE = {
  id: 'test-1', name: 'Test Landmark', label: 'Test Road, Test Neighbourhood, Delhi', kind: 'monument',
  latitude: 28.6, longitude: 77.1, boundingBox: { south: 28.59, north: 28.61, west: 77.09, east: 77.11 },
};
const PLACE_META = { provider: 'Nominatim', attribution: '© OpenStreetMap contributors', licence: 'ODbL 1.0', cached: false };

export function apiResponse(url) {
  const { pathname, searchParams } = new URL(String(url), 'http://localhost');
  if (pathname.startsWith('/api/police-districts/')) return districtResponse(url);
  if (pathname === '/api/places/search') return jsonResponse({ data: searchParams.get('q') === 'nowhere' ? [] : [TEST_PLACE], meta: PLACE_META });
  if (pathname === '/api/places/reverse') return jsonResponse({ data: { road: 'Test Road', neighbourhood: 'Test Neighbourhood', area: null, city: 'Delhi', label: 'Test Road, Test Neighbourhood, Delhi' }, meta: PLACE_META });
  if (pathname === '/api/crimes/categories') return page(categoryLabels());
  if (pathname === '/api/data-sources') return page(dataSources());
  if (pathname === '/api/validation') return page(validationChecks(searchParams.get('checkName')));
  if (pathname === '/api/crimes') return page(crimeRecords(searchParams.get('reportingUnitType')));
  return null;
}
