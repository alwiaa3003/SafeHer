// Descriptive calculations on the API's annual series. Every result describes
// registered cases only; none measures prevalence, risk or safety.

export const formatCount = (value) => value.toLocaleString('en-IN');

export function formatSigned(value) {
  if (value === 0) return '0';
  return `${value > 0 ? '+' : '−'}${formatCount(Math.abs(value))}`;
}

export function formatPercent(value) {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return '0.0%';
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toFixed(1)}%`;
}

export const casesOf = (row) => row.statistic?.registeredCases ?? null;

export function yearsWithData(series) {
  return series.filter((row) => casesOf(row) !== null).map((row) => row.year);
}

export function selectRange(series, from, to) {
  return series.filter((row) => row.year >= from && row.year <= to);
}

function change(previous, current) {
  const absolute = current - previous;
  // A zero base has no defined percentage change.
  return { absolute, percent: previous === 0 ? null : (absolute / previous) * 100 };
}

const direction = (absolute) => (absolute > 0 ? 'increase' : absolute < 0 ? 'decrease' : 'none');

// Changes are only computed between consecutive calendar years that both have a value.
export function yearOverYear(rows) {
  return rows.map((row, index) => {
    const current = casesOf(row);
    const prev = rows[index - 1];
    if (!prev) return { year: row.year, cases: current, status: 'first' };
    const previous = casesOf(prev);
    if (current === null || previous === null || prev.year !== row.year - 1) {
      return { year: row.year, cases: current, status: 'not_calculated' };
    }
    const { absolute, percent } = change(previous, current);
    return { year: row.year, cases: current, previousYear: prev.year, previous, absolute, percent, direction: direction(absolute), status: 'calculated' };
  });
}

function extremes(points, pick) {
  if (points.length === 0) return null;
  const value = pick(...points.map((p) => p.cases));
  return { value, years: points.filter((p) => p.cases === value).map((p) => p.year) };
}

export function analyseRange(rows) {
  const points = rows.filter((row) => casesOf(row) !== null).map((row) => ({ year: row.year, cases: casesOf(row) }));
  const changes = yearOverYear(rows);
  const calculated = changes.filter((c) => c.status === 'calculated');
  const increases = calculated.filter((c) => c.absolute > 0);
  const decreases = calculated.filter((c) => c.absolute < 0);
  const first = points[0];
  const last = points[points.length - 1];
  const overall = points.length >= 2 ? { from: first, to: last, ...change(first.cases, last.cases) } : null;

  return {
    points,
    missingYears: rows.filter((row) => casesOf(row) === null).map((row) => row.year),
    latest: last ?? null,
    highest: extremes(points, Math.max),
    lowest: extremes(points, Math.min),
    overall: overall && { ...overall, direction: direction(overall.absolute) },
    changes,
    largestIncrease: increases.length ? increases.reduce((a, b) => (b.absolute > a.absolute ? b : a)) : null,
    largestDecrease: decreases.length ? decreases.reduce((a, b) => (b.absolute < a.absolute ? b : a)) : null,
  };
}
