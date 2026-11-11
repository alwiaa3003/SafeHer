import { readFile } from 'node:fs/promises';
import { CrimeCategory, CrimeRecord, DataSource, ensureIndexes, ValidationRecord } from '../models/index.js';
import { insertIfAbsent } from './importApproved.js';

// Printed NCRB district-wise values, built from the official files by
// docs/research/ncrb-research-pipeline/build_district_map_dataset.py.
const DATASET = new URL('../../data/ncrb/delhi-police-district-caw.json', import.meta.url);

export async function loadPoliceDistrictDataset() {
  return JSON.parse(await readFile(DATASET, 'utf8'));
}

const UNIT_TYPE = { police_district: 'police_district', non_geographic: 'police_unit_non_geographic' };
const MEASURE_NOTE_CODE = 'MEASURE_NOT_PRINTED';
const DISTRICT_BOUNDARY_NOTE = {
  code: 'DISTRICT_FIGURE_NOT_LOCATION',
  text: 'A police-district count does not identify where within the district any incident occurred.',
  display: true,
};

// Refuses a dataset that would put figures on the wrong units or invent values.
export function assertDatasetIsSound(dataset) {
  const units = new Map(dataset.units.map((unit) => [unit.labelOriginal, unit]));
  const geographic = dataset.units.filter((unit) => unit.kind === 'police_district');
  if (geographic.length !== 16) throw new Error(`Expected 16 police districts, found ${geographic.length}`);
  if (dataset.units.length !== 23) throw new Error(`Expected 23 reporting units, found ${dataset.units.length}`);
  const categories = new Map(dataset.categories.map((category) => [category.key, category]));
  const seen = new Set();
  for (const value of dataset.values) {
    if (!units.has(value.unit)) throw new Error(`Unknown reporting unit ${value.unit}`);
    const category = categories.get(value.category);
    if (!category) throw new Error(`Unknown category ${value.category}`);
    if (!category.years.includes(value.year)) throw new Error(`${value.category} is not validated for ${value.year}`);
    if (!/^\d+$/.test(value.originalValue)) throw new Error(`Non-numeric printed value for ${value.unit} ${value.year}`);
    const key = `${value.year}|${value.unit}|${value.category}`;
    if (seen.has(key)) throw new Error(`Duplicate value ${key}`);
    seen.add(key);
  }
  for (const source of dataset.sources) {
    const totals = dataset.values.filter((v) => v.year === source.year && v.category === 'total');
    const sum = totals.reduce((total, v) => total + Number(v.originalValue), 0);
    const { sumOf23Units, printedTotalDistricts, delhiUtProductionTotal } = source.reconciliation;
    if (totals.length !== 23 || sum !== sumOf23Units || sum !== printedTotalDistricts || sum !== delhiUtProductionTotal) {
      throw new Error(`District totals for ${source.year} do not reconcile`);
    }
  }
}

function sourceDocument(dataset, source) {
  return {
    sourceKey: source.sourceKey,
    sourceType: 'crime_statistics',
    sourceName: `NCRB District-wise Crime against Women ${source.year}`,
    publisher: 'National Crime Records Bureau',
    publicationYear: source.year,
    tableReference: 'District-wise Crime against Women',
    tableTitle: source.titlePrinted,
    reportingLevel: 'police_district',
    sourceUrl: source.sourceUrl,
    reportingPeriod: { from: source.year, to: source.year },
    editionBasis: `Official NCRB spreadsheet, worksheet "${source.worksheet}", section "${source.delhiSectionLabel}". Retrieved ${source.retrievedOn}.`,
    notes: `${dataset.measureNote} ${dataset.licence}`,
    extract: { fileName: source.fileName, sha256: source.sha256 },
  };
}

function validationChecks(category, year) {
  const checks = [{ rule: 'DIST-REC', result: 'PASS', scope: `${year}: 23 units sum to the printed district total and to the Delhi UT total` }];
  if (category.key !== 'total') checks.push({ rule: 'DIST-3A2', result: 'PASS', scope: category.validation });
  return checks;
}

// Inserts the district records when absent. Existing documents are compared, never changed.
// { dryRun: true } reads the target database but writes nothing, not even indexes.
export async function importPoliceDistrictStatistics(dataset, { dryRun = false } = {}) {
  const data = dataset ?? (await loadPoliceDistrictDataset());
  assertDatasetIsSound(data);
  if (!dryRun) await ensureIndexes();
  const options = { dryRun };

  const report = { dryRun, inserted: {}, unchanged: {}, conflicts: [] };
  const units = new Map(data.units.map((unit) => [unit.labelOriginal, unit]));
  const categories = new Map(data.categories.map((category) => [category.key, category]));
  const sources = new Map();
  const categoryDocs = new Map();

  for (const source of data.sources) {
    const doc = sourceDocument(data, source);
    const saved = await insertIfAbsent(DataSource, { sourceKey: doc.sourceKey }, doc, ['sourceUrl', 'extract.sha256'], report, 'dataSources', options);
    sources.set(source.year, { saved, source });
    await insertIfAbsent(
      ValidationRecord,
      { source: saved._id, checkName: 'DIST-REC', reportingYear: source.year, reportingUnit: 'Delhi police units', reportingUnitType: 'police_district' },
      {
        source: saved._id,
        checkName: 'DIST-REC',
        reportingYear: source.year,
        reportingUnit: 'Delhi police units',
        reportingUnitType: 'police_district',
        result: 'PASS',
        explanation: `The 23 Delhi police units sum to ${source.reconciliation.sumOf23Units}, equal to the printed district total and to the Delhi UT total in Table 3A.1.`,
        checkedAt: new Date(`${data.lastVerified}T00:00:00Z`),
      },
      ['result'],
      report,
      'validationRecords',
      options,
    );
  }

  for (const value of data.values) {
    const unit = units.get(value.unit);
    const category = categories.get(value.category);
    const { saved: source, source: meta } = sources.get(value.year);
    const categoryKey = `${value.category}|${value.year}`;
    if (!categoryDocs.has(categoryKey)) {
      const doc = {
        originalCategoryName: category.labelOriginal,
        normalizedCategoryName: category.label,
        reportingYear: value.year,
        legalReference: category.labelOriginal,
        legalFramework: category.legalRegime,
        source: source._id,
        comparabilityStatus: 'not_assessed',
      };
      categoryDocs.set(categoryKey, await insertIfAbsent(
        CrimeCategory,
        { originalCategoryName: doc.originalCategoryName, reportingYear: doc.reportingYear, legalFramework: doc.legalFramework, source: source._id },
        doc,
        [],
        report,
        'crimeCategories',
        options,
      ));
    }
    const record = {
      year: value.year,
      reportingUnit: unit.label,
      reportingUnitLabelOriginal: unit.labelOriginal,
      reportingUnitType: UNIT_TYPE[unit.kind],
      reportingUnitCode: unit.key,
      crimeCategory: category.key,
      category: categoryDocs.get(categoryKey)._id,
      categoryLabelOriginal: category.labelOriginal,
      legalRegime: category.legalRegime,
      ageGroup: 'all',
      registeredCases: Number(value.originalValue),
      originalValue: value.originalValue,
      source: source._id,
      sourceReference: `${meta.sourceKey}, Delhi section, row "${unit.labelOriginal}", column ${value.column}`,
      evidence: { fileName: meta.fileName, sha256: meta.sha256 },
      validationStatus: 'verified_with_note',
      validationChecks: validationChecks(category, value.year),
      validationNotes: [
        { code: MEASURE_NOTE_CODE, text: data.measureNote, display: false },
        DISTRICT_BOUNDARY_NOTE,
      ],
      isCurrent: true,
      extractionMethod: 'Printed spreadsheet cell copied by build_district_map_dataset.py',
    };
    await insertIfAbsent(
      CrimeRecord,
      { year: record.year, reportingUnit: record.reportingUnit, reportingUnitType: record.reportingUnitType, crimeCategory: record.crimeCategory, source: source._id },
      record,
      ['registeredCases', 'originalValue', 'reportingUnitCode'],
      report,
      'crimeRecords',
      options,
    );
  }
  return report;
}

const DISTRICT_UNIT_TYPES = ['police_district', 'police_unit_non_geographic'];

// Read-only. Current district records that share an identity (should be impossible while the
// unique indexes exist; this catches a database where they were never built).
export async function findDuplicateDistrictRecords() {
  return CrimeRecord.aggregate([
    { $match: { reportingUnitType: { $in: DISTRICT_UNIT_TYPES }, isCurrent: true } },
    { $group: { _id: { year: '$year', unit: '$reportingUnitCode', type: '$reportingUnitType', category: '$crimeCategory' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
}

// Read-only post-import check: every count, reconciliation and status the import promises.
export async function verifyPoliceDistrictImport(dataset) {
  const data = dataset ?? (await loadPoliceDistrictDataset());
  const checks = [];
  const check = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail });

  const sources = await DataSource.find({ sourceKey: { $in: data.sources.map((s) => s.sourceKey) } }).lean();
  check('3 NCRB district sources', sources.length === data.sources.length, `${sources.length} found`);
  const sourceIds = sources.map((s) => s._id);
  for (const s of data.sources) {
    const saved = sources.find((x) => x.sourceKey === s.sourceKey);
    check(`${s.sourceKey} file hash`, saved?.extract?.sha256 === s.sha256, saved?.extract?.sha256 ?? 'missing');
  }
  const records = await CrimeRecord.find({ source: { $in: sourceIds } }).select('year reportingUnitType reportingUnitCode crimeCategory registeredCases originalValue validationStatus isCurrent').lean();
  check('record count', records.length === data.values.length, `${records.length} of ${data.values.length}`);
  check('all records current and verified_with_note', records.every((r) => r.isCurrent && r.validationStatus === 'verified_with_note'), '');
  check('every value equals the printed value', records.every((r) => String(r.registeredCases) === r.originalValue), '');
  const units = (type) => new Set(records.filter((r) => r.reportingUnitType === type).map((r) => r.reportingUnitCode)).size;
  check('16 geographic districts', units('police_district') === 16, String(units('police_district')));
  check('7 non-geographic units', units('police_unit_non_geographic') === 7, String(units('police_unit_non_geographic')));
  for (const s of data.sources) {
    const sum = records.filter((r) => r.year === s.year && r.crimeCategory === 'total').reduce((t, r) => t + r.registeredCases, 0);
    check(`${s.year} total reconciles to ${s.reconciliation.delhiUtProductionTotal}`, sum === s.reconciliation.delhiUtProductionTotal, String(sum));
  }
  const expectedCategories = data.categories.reduce((n, c) => n + c.years.length, 0);
  const categories = await CrimeCategory.countDocuments({ source: { $in: sourceIds } });
  check('category documents', categories === expectedCategories, `${categories} of ${expectedCategories}`);
  const validations = await ValidationRecord.countDocuments({ source: { $in: sourceIds }, checkName: 'DIST-REC', result: 'PASS' });
  check('DIST-REC validation per year', validations === data.sources.length, String(validations));
  const duplicates = await findDuplicateDistrictRecords();
  check('no duplicate current records', duplicates.length === 0, `${duplicates.length} duplicate identities`);
  return { pass: checks.every((c) => c.pass), checks };
}
