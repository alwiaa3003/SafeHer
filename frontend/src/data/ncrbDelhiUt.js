// Delhi UT annual totals. 2016-2018 and 2020-2024 come from NCRB Table 3A.1 and were
// checked against one-page table extracts held in docs/source-reports/. 2019 comes from
// NCRB's official 2014-2019 additional-table spreadsheet (see DELHI_UT_2019).
// Source files stay out of Git, so their names and hashes are recorded here.

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

// Official NCRB spreadsheet, listed under year 2019 on NCRB's additional-tables page.
// Retrieved 2026-11-10; a fresh download was byte-identical. Not a Crime in India page.
export const SOURCE_SPREADSHEET_2014_19 = {
  fileName: '1679740555003StateUT-wiseCasesRegistered1563underCrimesagainstWomenduring2014-2019.xlsx',
  path: 'docs/source-reports/retrieved-2026-11-10/state-caw-2014-2019/1679740555003StateUT-wiseCasesRegistered1563underCrimesagainstWomenduring2014-2019.xlsx',
  sha256: '655033a80b12d020cc9065a067525c2a2fc5e641112ff9cb5f7a47715e8259c3',
  sizeBytes: 15800,
  url: 'https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/post/1679740555003StateUT-wiseCasesRegistered1563underCrimesagainstWomenduring2014-2019.xlsx',
  worksheet: 'Total Cognizable SLL Crimes',
  title: 'Statement on Cases Registered In Police Stations and Cr.PC (156_3) under Crimes against Women During 2014-2019',
  geographyLabel: 'Delhi',
};

const DELHI_UT_2019 = {
  year: 2019,
  reportingUnit: 'Delhi UT',
  reportingUnitType: 'state_ut',
  reportingUnitLabelOriginal: SOURCE_SPREADSHEET_2014_19.geographyLabel,
  crimeCategory: 'Total crime against women',
  categoryLabelOriginal: SOURCE_SPREADSHEET_2014_19.title,
  legalRegime: 'ALL',
  ageGroup: 'all',
  metric: 'cases',
  originalValue: '13395',
  numericValue: 13395,
  edition: 'Crime in India 2019 Additional Tables',
  editionBasis: 'Listed under year 2019 on the NCRB additional-tables page; the spreadsheet prints no edition.',
  volume: 'Additional tables',
  tableNumber: 'Additional table 003 (State/UT)',
  sourceKey: 'NCRB-AT2019-003-STATEUT-CAW-2014-2019',
  sourceReference: 'NCRB-AT2019-003-STATEUT-CAW-2014-2019-SL34',
  sourceUrl: SOURCE_SPREADSHEET_2014_19.url,
  sourceNotes:
    'Official NCRB download, retrieved 2026-11-10 from ncrb.gov.in (redirected to ncrb.mha.gov.in; server Last-Modified 2023-03-25; 15,800 bytes). Worksheet "Total Cognizable SLL Crimes", row SL 34 "Delhi". Source line printed: "Source: Crime in India".',
  evidence: {
    fileName: SOURCE_SPREADSHEET_2014_19.fileName,
    path: SOURCE_SPREADSHEET_2014_19.path,
    sha256: SOURCE_SPREADSHEET_2014_19.sha256,
  },
  sourceHistory: [],
  validationStatus: 'verified_with_note',
  validationChecks: {
    'EXT-2': {
      status: 'passed',
      scope: 'Row SL 34 "Delhi" read from the official spreadsheet: 51 under Cr.PC 156(3) + 13,344 in police stations = 13,395. The same file reproduces the 2016-2018 production figures.',
    },
    'TOT-4': {
      status: 'pending',
      scope: 'Requires an approved comparison with Table 3A.2. No 2019 Table 3A.2 source has been obtained, so this comparison is outstanding.',
    },
  },
  validationNotes: [
    {
      code: 'TOT4_PENDING_TABLE_3A2',
      text: 'The comparison with the category table (Table 3A.2) is not complete for this production record. No 2019 Table 3A.2 source has been obtained.',
      display: false,
    },
    {
      code: 'SOURCE_OFFICIAL_SPREADSHEET',
      text: 'Taken from NCRB\'s official 2014-2019 spreadsheet, not from a Crime in India report page',
      display: true,
    },
    {
      code: 'CII2021_COPY_THIRD_PARTY',
      text: 'Crime in India 2021 Table 3A.1 also prints 13,395, but only a third-party-hosted copy of that report was available, not an NCRB-hosted copy.',
      display: false,
    },
    {
      code: 'ALL_INDIA_2019_DIFFERS',
      text: 'The all-India 2019 total is 405,861 in the official spreadsheet and 405,326 in the third-party-hosted Crime in India 2021 copy. The reason is unresolved. The Delhi value is identical in both.',
      display: false,
    },
    {
      code: 'DELHI_CITY_SEPARATE',
      text: 'Delhi City is a separate reporting row in a separate NCRB table and is not part of this record.',
      display: false,
    },
  ],
  extractionMethod: 'xlsx cell read (Python standard library)',
  extractedAt: '2026-11-10',
  checkedAgainstExtractAt: '2026-11-10',
};

export const delhiUtStatistics = [
  statistic({ year: 2016, originalValue: '15310', source: SOURCES.CII2018, pdfPage: 241, extract: WOMEN_2016_18 }),
  statistic({ year: 2017, originalValue: '13076', source: SOURCES.CII2018, pdfPage: 241, extract: WOMEN_2016_18 }),
  statistic({ year: 2018, originalValue: '13640', source: SOURCES.CII2018, pdfPage: 241, extract: WOMEN_2016_18 }),
  DELHI_UT_2019,
  statistic({ year: 2020, originalValue: '10093', source: SOURCES.CII2022, pdfPage: 259, extract: WOMEN_2020_22 }),
  statistic({ year: 2021, originalValue: '14277', source: SOURCES.CII2022, pdfPage: 259, extract: WOMEN_2020_22, sourceHistory: [SUPERSEDED_2021_SOURCE] }),
  statistic({ year: 2022, originalValue: '14247', source: SOURCES.CII2024, pdfPage: 329, extract: WOMEN_2022_24, alsoFoundIn: [WOMEN_2020_22.fileName] }),
  statistic({ year: 2023, originalValue: '13439', source: SOURCES.CII2024, pdfPage: 329, extract: WOMEN_2022_24 }),
  statistic({ year: 2024, originalValue: '13396', source: SOURCES.CII2024, pdfPage: 329, extract: WOMEN_2022_24, extraNotes: [NOTE_UT_CITY_2024] }),
];

export const delhiUtCoverage = [
  {
    // Kept as history. A resolved gap is not reported as missing.
    year: 2019,
    status: 'resolved',
    reason: 'The English Crime in India 2021 edition has not been obtained yet.',
    expectedSource: 'Crime in India 2021, Table 3A.1',
    resolvedBy: 'NCRB-AT2019-003-STATEUT-CAW-2014-2019 (official NCRB spreadsheet, row SL 34)',
    resolvedAt: '2026-11-10',
  },
];
