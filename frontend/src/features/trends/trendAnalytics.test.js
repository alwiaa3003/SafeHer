import { describe, expect, it } from 'vitest';
import { buildTrendSeries } from '../../test/trendFixture';
import { analyseRange, formatPercent, formatSigned, selectRange, yearOverYear } from './trendAnalytics';

const series = buildTrendSeries();
const row = (year, cases) => ({ year, statistic: cases === null ? null : { registeredCases: cases } });

describe('trend analytics on the nine production years', () => {
  const result = analyseRange(series);

  it('uses every year from 2016 to 2024, including 2019', () => {
    expect(result.points.map((p) => [p.year, p.cases])).toEqual([
      [2016, 15310], [2017, 13076], [2018, 13640], [2019, 13395], [2020, 10093],
      [2021, 14277], [2022, 14247], [2023, 13439], [2024, 13396],
    ]);
    expect(result.missingYears).toEqual([]);
  });

  it('finds the highest, lowest and latest recorded years', () => {
    expect(result.highest).toEqual({ value: 15310, years: [2016] });
    expect(result.lowest).toEqual({ value: 10093, years: [2020] });
    expect(result.latest).toEqual({ year: 2024, cases: 13396 });
  });

  it('computes year-over-year absolute and percentage changes from adjacent years', () => {
    const calc = result.changes.filter((c) => c.status === 'calculated');
    expect(calc.map((c) => [c.year, c.absolute])).toEqual([
      [2017, -2234], [2018, 564], [2019, -245], [2020, -3302], [2021, 4184], [2022, -30], [2023, -808], [2024, -43],
    ]);
    expect(calc.map((c) => formatPercent(c.percent))).toEqual(['−14.6%', '+4.3%', '−1.8%', '−24.7%', '+41.5%', '−0.2%', '−5.7%', '−0.3%']);
    expect(result.changes[0]).toMatchObject({ year: 2016, status: 'first' });
  });

  it('reports the overall change and the largest movements', () => {
    expect(result.overall).toMatchObject({ from: { year: 2016 }, to: { year: 2024 }, absolute: -1914, direction: 'decrease' });
    expect(formatPercent(result.overall.percent)).toBe('−12.5%');
    expect(result.largestIncrease).toMatchObject({ year: 2021, absolute: 4184 });
    expect(result.largestDecrease).toMatchObject({ year: 2020, absolute: -3302 });
  });

  it('recomputes for a selected range', () => {
    const recent = analyseRange(selectRange(series, 2020, 2024));
    expect(recent.highest).toEqual({ value: 14277, years: [2021] });
    expect(recent.lowest).toEqual({ value: 10093, years: [2020] });
    expect(recent.changes[0]).toMatchObject({ year: 2020, status: 'first' });
    expect(recent.overall.absolute).toBe(3303);
  });
});

describe('missing and edge values', () => {
  it('never treats a missing year as zero and does not bridge it', () => {
    const rows = [row(2018, 100), row(2019, null), row(2020, 120)];
    const changes = yearOverYear(rows);
    expect(changes.map((c) => c.status)).toEqual(['first', 'not_calculated', 'not_calculated']);
    const result = analyseRange(rows);
    expect(result.lowest.value).toBe(100);
    expect(result.missingYears).toEqual([2019]);
  });

  it('avoids division by zero', () => {
    const [, second] = yearOverYear([row(2020, 0), row(2021, 5)]);
    expect(second).toMatchObject({ absolute: 5, percent: null });
  });

  it('formats signs consistently', () => {
    expect(formatSigned(564)).toBe('+564');
    expect(formatSigned(-2234)).toBe('−2,234');
    expect(formatSigned(0)).toBe('0');
    expect(formatPercent(0.04)).toBe('0.0%');
  });

  it('handles an empty range', () => {
    const result = analyseRange([]);
    expect(result).toMatchObject({ latest: null, highest: null, overall: null, largestIncrease: null });
  });
});
