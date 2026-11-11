import { STATUS_KIND } from './status';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DELHI_UT_TREND_PATH = '/api/crimes/trends?reportingUnit=Delhi%20UT';

// Pages ask this module for data. There is deliberately no fallback: if the
// request fails, the caller shows an error and no figures.
export async function fetchDelhiUtAnnualSeries({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${DELHI_UT_TREND_PATH}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Trend request failed (${response.status})`);
  const body = await response.json();
  return body.data.series;
}

async function getJson(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

// The API caps a page at 100 rows; SafeHer's production collections are far smaller.
const ALL_ROWS = 'limit=100';

export async function fetchCrimeRecords({ reportingUnitType, signal } = {}) {
  const unit = reportingUnitType ? `&reportingUnitType=${encodeURIComponent(reportingUnitType)}` : '';
  return (await getJson(`/api/crimes?${ALL_ROWS}${unit}`, signal)).data;
}

// Source labels per publication. They are not category-level crime observations.
export async function fetchCategoryLabels({ signal } = {}) {
  return (await getJson(`/api/crimes/categories?${ALL_ROWS}`, signal)).data;
}

export async function fetchValidationChecks({ checkName, signal } = {}) {
  const check = checkName ? `&checkName=${encodeURIComponent(checkName)}` : '';
  return (await getJson(`/api/validation?${ALL_ROWS}${check}`, signal)).data;
}

export async function fetchDataSources({ signal } = {}) {
  return (await getJson(`/api/data-sources?${ALL_ROWS}`, signal)).data;
}

// Boundary summaries without geometry.
export async function fetchGeographyList({ signal } = {}) {
  return (await getJson(`/api/geography?${ALL_ROWS}`, signal)).data;
}

// Place search through SafeHer's rate-limited, caching proxy for Nominatim.
export async function searchPlaces(query, { signal } = {}) {
  return getJson(`/api/places/search?q=${encodeURIComponent(query)}`, signal);
}

export async function reversePlace(latitude, longitude, { signal } = {}) {
  return getJson(`/api/places/reverse?lat=${latitude.toFixed(5)}&lon=${longitude.toFixed(5)}`, signal);
}

// Police-district map: years, validated categories, units, sources and boundary status.
export async function fetchDistrictMeta({ signal } = {}) {
  return (await getJson('/api/police-districts/meta', signal)).data;
}

// Printed NCRB values for one category, every available year, for all district units.
export async function fetchDistrictStatistics(category, { signal } = {}) {
  return (await getJson(`/api/police-districts/statistics?category=${encodeURIComponent(category)}`, signal)).data;
}

const WITHHELD_REVIEW_COPY = {
  status: 'unavailable',
  reason:
    'No licensed map of the police districts is available. The server offered an unlicensed review copy, which this public site never draws.',
};

// A production build draws only published (licensed) boundaries. A review copy reaching it means
// the API is misconfigured; its shapes are discarded and the table is shown instead.
export function publicBoundaryCollection(body, production = import.meta.env.PROD) {
  if (!production || body?.meta?.boundary?.status === 'published') return body;
  if (!body?.features?.length) return body;
  return { type: 'FeatureCollection', features: [], meta: { boundary: WITHHELD_REVIEW_COPY } };
}

// A GeoJSON FeatureCollection. It is empty when no publishable boundary exists.
export async function fetchDistrictBoundaries({ signal } = {}) {
  return publicBoundaryCollection(await getJson('/api/police-districts/boundaries', signal));
}

// Returns null when no verified boundary has been loaded.
export async function fetchDelhiBoundary({ signal } = {}) {
  const list = await getJson('/api/geography?geographyType=state_ut&limit=1', signal);
  if (list.data.length === 0) return null;
  const detail = await getJson(`/api/geography/${list.data[0].id}`, signal);
  return detail.data;
}

const { INCOMPLETE, UNAVAILABLE, VERIFIED_WITH_NOTE } = STATUS_KIND;
const TOTALS_CHECKED = 'Totals checked – validation pending';

export function getEvidenceCoverage() {
  return [
    {
      dataset: 'Annual totals',
      table: 'Table 3A.1; 2019 from NCRB spreadsheet',
      ranges: [{ years: '2016–2024', kind: VERIFIED_WITH_NOTE, label: TOTALS_CHECKED }],
    },
    {
      dataset: 'Category breakdown',
      table: 'Table 3A.2',
      ranges: [
        { years: '2016–2017', kind: UNAVAILABLE },
        { years: '2018', kind: INCOMPLETE },
        { years: '2019–2021', kind: UNAVAILABLE },
        { years: '2022–2024', kind: INCOMPLETE },
      ],
    },
  ];
}
