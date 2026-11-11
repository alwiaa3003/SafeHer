import dataset from '../../../backend/data/ncrb/delhi-police-district-caw.json';
import { jsonResponse } from './trendFixture';

// Mirrors /api/police-districts/* from the same printed NCRB values the backend imports.
const UNIT_TYPE = { police_district: 'districts', non_geographic: 'nonGeographicUnits' };

const sources = dataset.sources.map((s) => ({
  id: `src-${s.sourceKey}`,
  sourceKey: s.sourceKey,
  sourceType: 'crime_statistics',
  sourceName: `NCRB District-wise Crime against Women ${s.year}`,
  publisher: 'National Crime Records Bureau',
  publicationYear: s.year,
  tableReference: 'District-wise Crime against Women',
  reportingLevel: 'police_district',
  sourceUrl: s.sourceUrl,
  reportingPeriod: { from: s.year, to: s.year },
  reconciliation: `The 23 Delhi police units sum to ${s.reconciliation.sumOf23Units}, equal to the printed district total and to the Delhi UT total in Table 3A.1.`,
}));

const unitOf = (u) => ({ code: u.key, label: u.label, labelOriginal: u.labelOriginal });
const byLabel = (a, b) => a.label.localeCompare(b.label);

export const DISTRICT_BOUNDARY_UNAVAILABLE = {
  status: 'unavailable',
  reason: 'The only complete map of Delhi\'s 16 police districts is published by GeoSpatial Delhi Limited (GSDL), which states "All Rights Reserved" and offers no licence for reuse. SafeHer will draw the districts once written permission or an openly licensed map is available.',
};

export function districtMeta(boundary = DISTRICT_BOUNDARY_UNAVAILABLE) {
  return {
    measure: 'registered_cases',
    geographicPrecision: 'Police district',
    years: [2020, 2021, 2022],
    categories: dataset.categories.map((c) => ({ key: c.key, label: c.label, labelOriginal: c.labelOriginal, legalRegime: c.legalRegime, years: c.years })),
    districts: dataset.units.filter((u) => u.kind === 'police_district').map(unitOf).sort(byLabel),
    nonGeographicUnits: dataset.units.filter((u) => u.kind === 'non_geographic').map(unitOf).sort(byLabel),
    sources,
    boundary,
    notices: ['Registered cases, not proven offences.', 'District-level statistics do not identify individual incident locations.', 'Not a safety score.'],
  };
}

export function districtStatistics(category, { omit = [] } = {}) {
  const meta = dataset.categories.find((c) => c.key === category);
  const result = { category: { key: category, labelOriginal: meta?.labelOriginal, legalRegime: meta?.legalRegime }, years: meta?.years ?? [], districts: [], nonGeographicUnits: [] };
  for (const unit of dataset.units) {
    const values = dataset.values
      .filter((v) => v.unit === unit.labelOriginal && v.category === category && !omit.includes(`${unit.key}|${v.year}`))
      .map((v) => {
        const source = sources.find((s) => s.publicationYear === v.year);
        return { year: v.year, registeredCases: Number(v.originalValue), originalValue: v.originalValue, sourceKey: source.sourceKey, sourceName: source.sourceName, sourceUrl: source.sourceUrl, sourceReference: `${source.sourceKey}, Delhi section, row "${unit.labelOriginal}", column ${v.column}`, validationStatus: 'verified_with_note' };
      });
    if (values.length) result[UNIT_TYPE[unit.kind]].push({ ...unitOf(unit), values });
  }
  return result;
}

// Test-only squares in a 4 x 4 grid, one per district code. Not real boundaries; never served by the app.
export function testDistrictBoundaries() {
  const codes = dataset.units.filter((u) => u.kind === 'police_district').map((u) => u.key);
  return {
    type: 'FeatureCollection',
    features: codes.map((code, i) => {
      const x = 77.0 + (i % 4) * 0.05;
      const y = 28.5 + Math.floor(i / 4) * 0.05;
      const name = dataset.units.find((u) => u.key === code).label;
      return { type: 'Feature', properties: { code, name, boundaryVersion: 'test-squares' }, geometry: { type: 'Polygon', coordinates: [[[x, y], [x + 0.05, y], [x + 0.05, y + 0.05], [x, y + 0.05], [x, y]]] } };
    }),
  };
}

export const REVIEW_BOUNDARY = { status: 'review_only', reviewOnly: true, provider: 'GSDL', licence: { name: 'None stated; website says All Rights Reserved' }, boundaryVersion: 'test-squares', districtCount: 16 };

// A test-only "licensed" layer summary, for checking how published boundaries are credited.
export const PUBLISHED_BOUNDARY = { status: 'published', reviewOnly: false, provider: 'Test Provider', licence: { name: 'CC BY 4.0 (test)', url: 'https://creativecommons.org/licenses/by/4.0/', attribution: '© Test Provider' }, boundaryVersion: 'test-squares', districtCount: 16, reason: null };

export function districtResponse(url, { boundaries = null, boundary = DISTRICT_BOUNDARY_UNAVAILABLE, omit } = {}) {
  const { pathname, searchParams } = new URL(String(url), 'http://localhost');
  if (pathname === '/api/police-districts/meta') return jsonResponse({ data: districtMeta(boundary), meta: {} });
  if (pathname === '/api/police-districts/statistics') return jsonResponse({ data: districtStatistics(searchParams.get('category'), { omit }), meta: {} });
  if (pathname === '/api/police-districts/boundaries') {
    return jsonResponse({ ...(boundaries ?? { type: 'FeatureCollection', features: [] }), meta: { boundary } });
  }
  return null;
}
