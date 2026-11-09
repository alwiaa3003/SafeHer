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
      table: 'Table 3A.1',
      ranges: [
        { years: '2016–2018', kind: VERIFIED_WITH_NOTE, label: TOTALS_CHECKED },
        { years: '2019', kind: UNAVAILABLE },
        { years: '2020–2024', kind: VERIFIED_WITH_NOTE, label: TOTALS_CHECKED },
      ],
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
