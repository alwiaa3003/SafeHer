import { delhiUtCoverage, delhiUtStatistics } from '../data/ncrbDelhiUt';

// The API's response shape, built from the same verified figures it serves.
export function buildTrendSeries() {
  const series = [];
  for (let year = 2016; year <= 2024; year += 1) {
    const source = delhiUtStatistics.find((s) => s.year === year);
    const coverage = delhiUtCoverage.find((c) => c.year === year) ?? null;
    series.push({
      year,
      availability: source ? 'available' : 'missing',
      statistic: source ? { ...source, registeredCases: source.numericValue, victims: null } : null,
      coverage,
    });
  }
  return series;
}

export function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

export const trendResponse = (series = buildTrendSeries()) =>
  jsonResponse({ data: { reportingUnit: 'Delhi UT', reportingUnitType: 'state_ut', measure: 'registeredCases', series }, meta: {} });
