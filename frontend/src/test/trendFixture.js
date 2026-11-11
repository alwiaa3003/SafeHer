import { delhiUtCoverage, delhiUtStatistics } from '../data/ncrbDelhiUt';

const RESULT = { passed: 'PASS', pending: 'PENDING', failed: 'FAIL' };

// Converts a source-of-truth statistic to the shape the API serves, as the seed and serializer do.
export function toApiStatistic(source) {
  return {
    ...source,
    registeredCases: source.numericValue,
    victims: null,
    pdfPage: source.pdfPage ?? null,
    validationChecks: Object.entries(source.validationChecks).map(([rule, check]) => ({ rule, result: RESULT[check.status], scope: check.scope })),
  };
}

// The API's response shape, built from the same verified figures it serves.
export function buildTrendSeries() {
  const series = [];
  for (let year = 2016; year <= 2024; year += 1) {
    const source = delhiUtStatistics.find((s) => s.year === year);
    const coverage = delhiUtCoverage.find((c) => c.year === year) ?? null;
    series.push({
      year,
      availability: source ? 'available' : 'missing',
      statistic: source ? toApiStatistic(source) : null,
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
