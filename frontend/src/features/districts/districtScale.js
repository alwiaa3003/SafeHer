// Colour classes and comparisons for the police-district map. Values come only from the API;
// nothing here estimates, spreads or fills in a figure.

// One hue, light to dark: light terracotta for fewer registered cases, dark red for more.
export const RAMP = ['#f2d8cc', '#e3ab96', '#cc7a62', '#a8483a', '#7c2a20'];
export const ZERO_FILL = '#fbf1ec';
export const MISSING_FILL = '#d9d4cd';

// The value of one district for one year, or null when no validated figure exists.
export function valueFor(district, year) {
  const entry = district?.values?.find((v) => v.year === year);
  return entry ? entry : null;
}

// Quantile classes over the selected view's non-zero values. Zero is its own class, so a
// printed zero is never confused with a missing figure (which is grey and has no class).
export function buildScale(values) {
  const present = values.filter((v) => Number.isInteger(v));
  const nonZero = [...present.filter((v) => v > 0)].sort((a, b) => a - b);
  const classes = [];
  if (present.some((v) => v === 0)) classes.push({ min: 0, max: 0, fill: ZERO_FILL, zero: true });
  if (nonZero.length > 0) {
    const distinct = [...new Set(nonZero)];
    const count = Math.min(distinct.length, nonZero.length < 6 ? Math.min(3, distinct.length) : 4);
    // Each class holds a near-equal share of districts, and a class only ends where the value
    // changes, so equal values always share a class. Bounds are actual data values.
    const groups = [];
    const target = nonZero.length / count;
    let current = [];
    nonZero.forEach((value, i) => {
      current.push(value);
      const next = nonZero[i + 1];
      const full = current.length >= target && groups.length < count - 1;
      if (next === undefined || (full && next !== value)) {
        groups.push({ min: current[0], max: current[current.length - 1] });
        current = [];
      }
    });
    const offset = RAMP.length - groups.length;
    groups.forEach((group, i) => classes.push({ ...group, fill: RAMP[Math.max(1, offset + i)] }));
  }
  return { classes, hasMissing: values.some((v) => !Number.isInteger(v)) };
}

export function fillFor(scale, value) {
  if (!Number.isInteger(value)) return MISSING_FILL;
  const match = scale.classes.find((c) => value >= c.min && value <= c.max);
  return match ? match.fill : MISSING_FILL;
}

export const formatCount = (value) => new Intl.NumberFormat('en-IN').format(value);

export function classLabel(c) {
  if (c.zero) return '0 cases';
  return c.min === c.max ? formatCount(c.min) : `${formatCount(c.min)}–${formatCount(c.max)}`;
}

// Change against the most recent earlier year that has a validated figure for this district
// and category. A percentage is given only when the earlier figure is above zero.
export function comparison(district, year) {
  const current = valueFor(district, year);
  if (!current) return { status: 'no_current' };
  const earlier = (district.values ?? []).filter((v) => v.year < year).sort((a, b) => b.year - a.year)[0];
  if (!earlier) return { status: 'no_previous' };
  const change = current.registeredCases - earlier.registeredCases;
  const percent = earlier.registeredCases > 0 ? (change / earlier.registeredCases) * 100 : null;
  return { status: 'ok', previousYear: earlier.year, previous: earlier.registeredCases, change, percent };
}

export function formatChange({ change, percent }) {
  const sign = change > 0 ? '+' : change < 0 ? '−' : '';
  const absolute = `${sign}${formatCount(Math.abs(change))}`;
  if (percent === null) return absolute;
  const pct = Math.abs(percent).toFixed(1);
  return `${absolute} (${sign}${pct}%)`;
}

const normalise = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const ALIASES = { 'igi-airport': ['airport', 'igi', 'igi airport'] };

// Exact district-name matches only, so search never suggests a district the user did not name.
export function matchDistricts(query, districts) {
  const q = normalise(query).replace(/\b(police|district|districts)\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (!q) return [];
  return districts.filter((d) => {
    const name = normalise(d.label);
    const names = [name, `${name} delhi`, ...(ALIASES[d.code] ?? [])];
    return names.includes(q);
  });
}
