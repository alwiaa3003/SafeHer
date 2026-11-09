// Development-preview figures read from official NCRB PDFs.
// None has had the manual PDF check required by the data specification, so
// every record stays `pending`. 2019 is absent on purpose: see delhiUtCoverage.

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
  CII2023: {
    code: 'CII2023-V1',
    edition: 'Crime in India 2023',
    volume: 'Part I',
    url: `${BASE}/files/1CrimeinIndia2023PartI.pdf`,
  },
  CII2024: {
    code: 'CII2024-V1',
    edition: 'Crime in India 2024',
    volume: 'Volume I',
    url: `${BASE}/files/11CrimeinIndia2024-VolumeI.pdf`,
  },
};

const TABLE_NUMBER = '3A.1';

function statistic({ year, originalValue, source, pdfPage, labels }) {
  return {
    year,
    reportingUnit: 'Delhi UT',
    reportingUnitType: 'state_ut',
    reportingUnitLabelOriginal: labels.unit,
    crimeCategory: 'Total crime against women',
    categoryLabelOriginal: labels.category,
    legalRegime: 'ALL',
    ageGroup: 'all',
    metric: 'cases',
    originalValue,
    numericValue: Number(originalValue),
    edition: source.edition,
    volume: source.volume,
    tableNumber: TABLE_NUMBER,
    pdfPage,
    sourceReference: `${source.code}-T${TABLE_NUMBER}-p${pdfPage}`,
    sourceUrl: source.url,
    validationStatus: 'pending',
    extractionMethod: 'pdftotext',
    extractedAt: '2026-11-09',
  };
}

const LABELS_2018 = {
  unit: 'Delhi UT',
  category: 'Crime against Women (IPC + SLL) - 2016-2018',
};
const LABELS_2022 = {
  unit: 'Delhi',
  category: 'Crime against Women (IPC+SLL) - 2020-2022',
};
const LABELS_2023 = {
  unit: 'Delhi',
  category: 'Crime against Women (IPC+SLL) - 2021-2023',
};
const LABELS_2024 = {
  unit: 'Delhi',
  category: 'Crime against Women (IPC+SLL) - 2022-2024',
};

// Each year uses the latest edition read that prints it.
export const delhiUtStatistics = [
  statistic({ year: 2016, originalValue: '15310', source: SOURCES.CII2018, pdfPage: 241, labels: LABELS_2018 }),
  statistic({ year: 2017, originalValue: '13076', source: SOURCES.CII2018, pdfPage: 241, labels: LABELS_2018 }),
  statistic({ year: 2018, originalValue: '13640', source: SOURCES.CII2018, pdfPage: 241, labels: LABELS_2018 }),
  statistic({ year: 2020, originalValue: '10093', source: SOURCES.CII2022, pdfPage: 259, labels: LABELS_2022 }),
  statistic({ year: 2021, originalValue: '14277', source: SOURCES.CII2023, pdfPage: 259, labels: LABELS_2023 }),
  statistic({ year: 2022, originalValue: '14247', source: SOURCES.CII2024, pdfPage: 329, labels: LABELS_2024 }),
  statistic({ year: 2023, originalValue: '13439', source: SOURCES.CII2024, pdfPage: 329, labels: LABELS_2024 }),
  statistic({ year: 2024, originalValue: '13396', source: SOURCES.CII2024, pdfPage: 329, labels: LABELS_2024 }),
];

export const delhiUtCoverage = [
  {
    year: 2019,
    status: 'missing_pending_source',
    reason: 'The English Crime in India 2021 edition has not been obtained yet.',
    expectedSource: 'Crime in India 2021, Table 3A.1',
  },
];
