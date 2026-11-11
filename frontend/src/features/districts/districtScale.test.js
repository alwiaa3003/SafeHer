import { describe, expect, it } from 'vitest';
import { buildScale, classLabel, comparison, fillFor, formatChange, matchDistricts, MISSING_FILL, RAMP, ZERO_FILL } from './districtScale';

const district = (values) => ({ code: 'x', label: 'X', values: values.map(([year, n]) => ({ year, registeredCases: n })) });

describe('colour scale', () => {
  it('builds classes from the actual values, light to dark', () => {
    const values = [10, 88, 459, 480, 549, 622, 626, 639, 640, 718, 736, 761, 774, 898, 988, 1048];
    const scale = buildScale(values);
    expect(scale.classes).toHaveLength(4);
    expect(scale.classes[0].min).toBe(10);
    expect(scale.classes.at(-1).max).toBe(1048);
    expect(scale.classes.map((c) => c.fill)).toEqual(RAMP.slice(1));
    expect(fillFor(scale, 10)).toBe(RAMP[1]);
    expect(fillFor(scale, 1048)).toBe(RAMP[4]);
    // Every value falls in exactly one class.
    for (const v of values) expect(scale.classes.filter((c) => v >= c.min && v <= c.max)).toHaveLength(1);
  });

  it('gives zero its own class and missing values a neutral grey', () => {
    const scale = buildScale([0, 0, 3, 5, null]);
    expect(scale.classes[0]).toMatchObject({ zero: true, fill: ZERO_FILL });
    expect(classLabel(scale.classes[0])).toBe('0 cases');
    expect(fillFor(scale, 0)).toBe(ZERO_FILL);
    expect(fillFor(scale, null)).toBe(MISSING_FILL);
    expect(scale.hasMissing).toBe(true);
  });

  it('handles a view where every value is zero, or every value is missing', () => {
    expect(buildScale([0, 0, 0]).classes).toEqual([expect.objectContaining({ zero: true })]);
    expect(buildScale([null, null])).toEqual({ classes: [], hasMissing: true });
  });

  it('merges classes rather than repeating a value at a boundary', () => {
    const scale = buildScale([5, 5, 5, 5, 5, 5, 5, 9]);
    expect(scale.classes.map(classLabel)).toEqual(['5', '9']);
  });
});

describe('comparison with the previous year', () => {
  it('reports absolute and percentage change against the latest earlier year', () => {
    const result = comparison(district([[2020, 480], [2021, 645], [2022, 625]]), 2022);
    expect(result).toMatchObject({ status: 'ok', previousYear: 2021, previous: 645, change: -20 });
    expect(formatChange(result)).toBe('−20 (−3.1%)');
  });

  it('omits the percentage when the earlier figure is zero', () => {
    const result = comparison(district([[2021, 0], [2022, 4]]), 2022);
    expect(result.percent).toBeNull();
    expect(formatChange(result)).toBe('+4');
  });

  it('explains when no comparison is possible', () => {
    expect(comparison(district([[2022, 9]]), 2022).status).toBe('no_previous');
    expect(comparison(district([[2022, 9]]), 2020).status).toBe('no_current');
  });
});

describe('district search', () => {
  const districts = [
    { code: 'north-east', label: 'North-East' },
    { code: 'igi-airport', label: 'IGI Airport' },
    { code: 'new-delhi', label: 'New Delhi' },
    { code: 'rohini', label: 'Rohini' },
  ];
  it('matches exact district names, with or without "district" or "Delhi"', () => {
    expect(matchDistricts('north east', districts).map((d) => d.code)).toEqual(['north-east']);
    expect(matchDistricts('North-East Delhi', districts).map((d) => d.code)).toEqual(['north-east']);
    expect(matchDistricts('Rohini police district', districts).map((d) => d.code)).toEqual(['rohini']);
    expect(matchDistricts('airport', districts).map((d) => d.code)).toEqual(['igi-airport']);
    expect(matchDistricts('New Delhi', districts).map((d) => d.code)).toEqual(['new-delhi']);
  });
  it('does not guess from partial or unrelated text', () => {
    expect(matchDistricts('roh', districts)).toEqual([]);
    expect(matchDistricts('India Gate', districts)).toEqual([]);
    expect(matchDistricts('district', districts)).toEqual([]);
  });
});
