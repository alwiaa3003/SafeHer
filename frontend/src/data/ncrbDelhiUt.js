// Delhi UT annual totals from NCRB Table 3A.1. Each value and geography label was
// checked against a one-page table extract held in docs/source-reports/.
// Those extracts stay out of Git, so their names and hashes are recorded here.
// 2019 is absent on purpose: see delhiUtCoverage.

const BASE = 'https://www.ncrb.mha.gov.in/uploads';

const SOURCES = {
  CII2018: {
    code: 'CII2018-V1',
    edition: 'Crime in India 2018',
    volume: 'Volume I',
    url: `${BASE}/nationalcrimerecordsbureau/custom/1653734481_Crime%20in%20India%202018%20-%20Volume%201_3_0_0.pdf`,
  },
  CII2022: {
    code: 'CII2022-V1',
    edition: 'Crime in India 2022',
    volume: 'Volume I',
    url: `${BASE}/nationalcrimerecordsbureau/custom/1701607577CrimeinIndia2022Book1.pdf`,
  },
  CII2024: {
    code: 'CII2024-V1',
    edition: 'Crime in India 2024',
    volume: 'Volume I',
    url: `${BASE}/files/11CrimeinIndia2024-VolumeI.pdf`,
  },
};

const TABLE_NUMBER = '3A.1';

// The extracts print the table and its years, but no edition or report page.
export const SOURCE_EXTRACTS = {
  WOMEN_2016_18: {
    fileName: 'women_2016-18.pdf',
    path: 'docs/source-reports/women_2016-18.pdf',
    sha256: '752f07f0eb2e75fd66b4c0be96b321bbec4cc734b29e87e733654da3a56cb5c9',
    extractPage: 1,
    tableTitle: 'Crime against Women (IPC + SLL) - 2016-2018',
    geographyLabel: 'Delhi UT',
  },
  WOMEN_2020_22: {
    fileName: 'women_2020-22.pdf',
    path: 'docs/source-reports/women_2020-22.pdf',
    sha256: '6ce1f47d43c4f1a0859bca1519ce0775efbdf5ebc57e855d01e0df6b5c040489',
    extractPage: 1,
    tableTitle: 'Crime against Women (IPC+SLL) - 2020-2022',
    geographyLabel: 'Delhi',
  },
  WOMEN_2022_24: {
    fileName: 'women_2022-24.pdf',
    path: 'docs/source-reports/women_2022-24.pdf',
    sha256: 'e6e7172febd7a10e66beb58edb659f43aa2b02b245c86385c5db037087ee3259',
    extractPage: 1,
    tableTitle: 'Crime against Women (IPC+SLL) - 2022-2024',
    geographyLabel: 'Delhi',
  },
};

const NOTE_TOT4_PENDING = {
  code: 'TOT4_PENDING_TABLE_3A2',
  text: 'The comparison with the category table (Table 3A.2) is not complete for this production record. Table 3A.2 research extracts for 2018 and 2022-2024 are held but are not approved for production; sources for 2016, 2017, 2020 and 2021 have not been obtained.',
  display: false,
};

const NOTE_FULL_REPORT_PAGE = {
  code: 'FULL_REPORT_PAGE_NOT_RECHECKED',
  text: 'The full-report page was recorded earlier and has not been independently rechecked against the full report.',
  display: false,
};

const NOTE_UT_CITY_2024 = {
  code: 'UT_CITY_IDENTICAL_2024',
  text: 'Delhi UT and Delhi City totals are identical for 2024, and this is unexplained.',
  display: true,
};

function statistic({ year, originalValue, source, pdfPage, extract, alsoFoundIn = [], sourceHistory = [], extraNotes = [] }) {
  return {
    year,
    reportingUnit: 'Delhi UT',
    reportingUnitType: 'state_ut',
    reportingUnitLabelOriginal: extract.geographyLabel,
    crimeCategory: 'Total crime against women',
    categoryLabelOriginal: extract.tableTitle,
    legalRegime: 'ALL',
    ageGroup: 'all',
    metric: 'cases',
    originalValue,
    numericValue: Number(originalValue),
    edition: source.edition,
    editionBasis: 'Inferred from the table year range; the extract does not print an edition.',
    volume: source.volume,
    tableNumber: TABLE_NUMBER,
    pdfPage,
    pdfPageStatus: 'not_independently_rechecked',
    sourceReference: `${source.code}-T${TABLE_NUMBER}-p${pdfPage}`,
    sourceUrl: source.url,
    evidence: {
      fileName: extract.fileName,
      path: extract.path,
      sha256: extract.sha256,
      extractPage: extract.extractPage,
      alsoFoundIn,
    },
    sourceHistory,
    validationStatus: 'verified_with_note',
    validationChecks: {
      'EXT-2': {
        status: 'passed',
        scope: 'Value and geography label compared with the Table 3A.1 extract.',
      },
      'TOT-4': {
        status: 'pending',
        scope: 'Requires an approved comparison with Table 3A.2. Holding a report or research extract does not complete this check.',
      },
    },
    validationNotes: [NOTE_TOT4_PENDING, NOTE_FULL_REPORT_PAGE, ...extraNotes],
    extractionMethod: 'pdftotext',
    extractedAt: '2026-11-09',
    checkedAgainstExtractAt: '2026-11-09',
  };
}

const { WOMEN_2016_18, WOMEN_2020_22, WOMEN_2022_24 } = SOURCE_EXTRACTS;

const SUPERSEDED_2021_SOURCE = {
  edition: 'Crime in India 2023',
  tableNumber: TABLE_NUMBER,
  pdfPage: 259,
  tableTitle: 'Crime against Women (IPC+SLL) - 2021-2023',
  status: 'superseded',
  reason: 'Previously recorded. The full Crime in India 2023 volume is now held, but this record remains supported by the one-page 2020-2022 table extract, not by this table.',
};

export const delhiUtStatistics = [
  statistic({ year: 2016, originalValue: '15310', source: SOURCES.CII2018, pdfPage: 241, extract: WOMEN_2016_18 }),
  statistic({ year: 2017, originalValue: '13076', source: SOURCES.CII2018, pdfPage: 241, extract: WOMEN_2016_18 }),
  statistic({ year: 2018, originalValue: '13640', source: SOURCES.CII2018, pdfPage: 241, extract: WOMEN_2016_18 }),
  statistic({ year: 2020, originalValue: '10093', source: SOURCES.CII2022, pdfPage: 259, extract: WOMEN_2020_22 }),
  statistic({ year: 2021, originalValue: '14277', source: SOURCES.CII2022, pdfPage: 259, extract: WOMEN_2020_22, sourceHistory: [SUPERSEDED_2021_SOURCE] }),
  statistic({ year: 2022, originalValue: '14247', source: SOURCES.CII2024, pdfPage: 329, extract: WOMEN_2022_24, alsoFoundIn: [WOMEN_2020_22.fileName] }),
  statistic({ year: 2023, originalValue: '13439', source: SOURCES.CII2024, pdfPage: 329, extract: WOMEN_2022_24 }),
  statistic({ year: 2024, originalValue: '13396', source: SOURCES.CII2024, pdfPage: 329, extract: WOMEN_2022_24, extraNotes: [NOTE_UT_CITY_2024] }),
];

export const delhiUtCoverage = [
  {
    year: 2019,
    status: 'missing_pending_source',
    reason: 'The English Crime in India 2021 edition has not been obtained yet.',
    expectedSource: 'Crime in India 2021, Table 3A.1',
  },
];
