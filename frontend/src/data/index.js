import { delhiUtCoverage, delhiUtStatistics } from './ncrbDelhiUt';
import { STATUS_KIND } from './status';

const FIRST_YEAR = 2016;
const LAST_YEAR = 2024;

// Pages ask this module for data, so moving to the real API later only
// changes this folder.
export function getDelhiUtAnnualSeries() {
  const series = [];
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
    series.push({
      year,
      statistic: delhiUtStatistics.find((s) => s.year === year) ?? null,
      coverage: delhiUtCoverage.find((c) => c.year === year) ?? null,
    });
  }
  return series;
}

const { INCOMPLETE, UNAVAILABLE } = STATUS_KIND;

export function getEvidenceCoverage() {
  return [
    {
      dataset: 'Annual totals',
      table: 'Table 3A.1',
      ranges: [
        { years: '2016–2018', kind: INCOMPLETE },
        { years: '2019', kind: UNAVAILABLE },
        { years: '2020–2024', kind: INCOMPLETE },
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
