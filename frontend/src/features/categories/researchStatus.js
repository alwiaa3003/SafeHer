// Research-only findings, recorded in docs/research/ncrb-table-3a2-validation.md.
// They are not production data and contain no category counts.
export const RESEARCH_DOCUMENT = 'docs/research/ncrb-table-3a2-validation.md';

export const TABLE_3A2_RESEARCH = [
  { edition: 'Crime in India 2018', year: 2018, sub2: 'FAIL', note: 'Printed kidnapping formula includes a parent column and its own sub-columns.' },
  { edition: 'Crime in India 2022', year: 2022, sub2: 'FAIL', note: 'Same printed kidnapping formula issue.' },
  { edition: 'Crime in India 2023', year: 2023, sub2: 'PASS_WITH_NOTE', note: 'The sum reconciles, but the printed formula has the same structure.' },
  { edition: 'Crime in India 2024', year: 2024, sub2: 'PASS', note: 'IPC and BNS columns are printed separately; neither is a full-year measure alone.' },
];

export const APPROVAL_CONDITIONS = [
  'A reviewer signs off the extraction for each edition.',
  'A documented decision on the 2018 and 2022 kidnapping formula.',
  'A category-by-category comparability review, including IPC and BNS.',
  'Agreed wording for rows whose sub-totals do not reconcile.',
  'Explicit approval of a reviewed import.',
];

// The normalised name every production annual total uses.
export const TOTAL_CATEGORY = 'Total crime against women';
