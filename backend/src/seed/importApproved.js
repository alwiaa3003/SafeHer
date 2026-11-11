import { isDeepStrictEqual } from 'node:util';
import {
  CoverageRecord,
  CrimeCategory,
  CrimeRecord,
  DataSource,
  ensureIndexes,
  ValidationRecord,
} from '../models/index.js';

const APPROVED_STATUSES = new Set(['verified', 'verified_with_note']);
const TOTALS_DATASET = 'delhi_ut_annual_total_crime_against_women';
const CHECK_RESULTS = { passed: 'PASS', pending: 'PENDING', failed: 'FAIL' };
const AUTHORITATIVE_FILE = new URL('../../../frontend/src/data/ncrbDelhiUt.js', import.meta.url).href;

export async function loadApprovedInputs() {
  const { delhiUtStatistics, delhiUtCoverage } = await import(/* @vite-ignore */ AUTHORITATIVE_FILE);
  return { statistics: delhiUtStatistics, coverage: delhiUtCoverage };
}

const valueAt = (object, path) => path.split('.').reduce((current, key) => current?.[key], object);

// Inserts when absent. An existing document is compared and is never changed.
// With { dryRun: true } nothing is written: a missing document is validated against its schema
// and counted as an insert it would make, so a dry run reports exactly what a real run would do.
export async function insertIfAbsent(Model, filter, doc, compareFields, report, label, { dryRun = false } = {}) {
  const existing = await Model.findOne(filter).lean();
  if (!existing && dryRun) {
    const draft = new Model(doc);
    const invalid = draft.validateSync();
    if (invalid) throw invalid;
    report.inserted[label] = (report.inserted[label] ?? 0) + 1;
    return draft.toObject();
  }
  if (!existing) {
    const created = await Model.create(doc);
    report.inserted[label] = (report.inserted[label] ?? 0) + 1;
    return created;
  }
  report.unchanged[label] = (report.unchanged[label] ?? 0) + 1;
  const differences = compareFields.filter(
    (field) => !isDeepStrictEqual(valueAt(existing, field), valueAt(doc, field)),
  );
  if (differences.length > 0) {
    report.conflicts.push({ collection: Model.collection.name, filter, fields: differences });
  }
  return existing;
}

function reportingPeriodFrom(title) {
  const match = title.match(/(\d{4})-(\d{4})\s*$/);
  return match ? { from: Number(match[1]), to: Number(match[2]) } : undefined;
}

function dataSourceFrom(statistic) {
  return {
    sourceKey: statistic.sourceKey ?? statistic.sourceReference.replace(/-p\d+$/, ''),
    sourceType: 'crime_statistics',
    sourceName: statistic.edition,
    publisher: 'National Crime Records Bureau',
    publicationYear: Number(statistic.edition.match(/\d{4}/)[0]),
    volume: statistic.volume,
    tableReference: statistic.tableNumber,
    tableTitle: statistic.categoryLabelOriginal,
    sourceUrl: statistic.sourceUrl,
    reportingPeriod: reportingPeriodFrom(statistic.categoryLabelOriginal),
    editionBasis: statistic.editionBasis,
    notes: statistic.sourceNotes,
    extract: {
      fileName: statistic.evidence.fileName,
      sha256: statistic.evidence.sha256,
      extractPage: statistic.evidence.extractPage,
    },
  };
}

function checksFrom(statistic) {
  return Object.entries(statistic.validationChecks).map(([rule, check]) => {
    const result = CHECK_RESULTS[check.status];
    if (!result) throw new Error(`Unknown validation check status: ${check.status}`);
    return { rule, result, scope: check.scope };
  });
}

function assertApprovable(statistic) {
  if (statistic.year === undefined || !/^\d+$/.test(String(statistic.originalValue))) {
    throw new Error('Approved statistics must have a year and a printed value');
  }
  if (statistic.numericValue !== Number(statistic.originalValue)) {
    throw new Error(`Printed and numeric values differ for ${statistic.year}`);
  }
}

export async function importApprovedAnnualTotals(inputs) {
  const { statistics, coverage } = inputs ?? (await loadApprovedInputs());
  await ensureIndexes();

  const report = { inserted: {}, unchanged: {}, skippedUnapproved: 0, conflicts: [] };
  const approved = statistics.filter((statistic) => {
    const isApproved = APPROVED_STATUSES.has(statistic.validationStatus);
    if (!isApproved) report.skippedUnapproved += 1;
    return isApproved;
  });
  approved.forEach(assertApprovable);

  for (const statistic of approved) {
    const sourceDoc = dataSourceFrom(statistic);
    const source = await insertIfAbsent(
      DataSource,
      { sourceKey: sourceDoc.sourceKey },
      sourceDoc,
      ['sourceUrl', 'extract.sha256'],
      report,
      'dataSources',
    );

    const categoryDoc = {
      originalCategoryName: statistic.categoryLabelOriginal,
      normalizedCategoryName: statistic.crimeCategory,
      reportingYear: sourceDoc.publicationYear,
      legalReference: statistic.categoryLabelOriginal,
      legalFramework: statistic.legalRegime,
      source: source._id,
      comparabilityStatus: 'not_assessed',
    };
    const category = await insertIfAbsent(
      CrimeCategory,
      {
        originalCategoryName: categoryDoc.originalCategoryName,
        reportingYear: categoryDoc.reportingYear,
        legalFramework: categoryDoc.legalFramework,
        source: source._id,
      },
      categoryDoc,
      [],
      report,
      'crimeCategories',
    );

    const unit = {
      year: statistic.year,
      reportingUnit: statistic.reportingUnit,
      reportingUnitType: statistic.reportingUnitType,
    };
    const checks = checksFrom(statistic);
    const recordDoc = {
      ...unit,
      reportingUnitLabelOriginal: statistic.reportingUnitLabelOriginal,
      crimeCategory: statistic.crimeCategory,
      category: category._id,
      categoryLabelOriginal: statistic.categoryLabelOriginal,
      legalRegime: statistic.legalRegime,
      ageGroup: statistic.ageGroup,
      registeredCases: statistic.numericValue,
      originalValue: statistic.originalValue,
      source: source._id,
      sourceReference: statistic.sourceReference,
      pdfPage: statistic.pdfPage,
      pdfPageStatus: statistic.pdfPageStatus,
      evidence: {
        fileName: statistic.evidence.fileName,
        sha256: statistic.evidence.sha256,
        extractPage: statistic.evidence.extractPage,
        alsoFoundIn: statistic.evidence.alsoFoundIn,
      },
      sourceHistory: statistic.sourceHistory,
      validationStatus: statistic.validationStatus,
      validationChecks: checks,
      validationNotes: statistic.validationNotes,
      isCurrent: true,
      extractionMethod: statistic.extractionMethod,
      extractedAt: new Date(statistic.extractedAt),
      checkedAgainstExtractAt: new Date(statistic.checkedAgainstExtractAt),
    };
    await insertIfAbsent(
      CrimeRecord,
      {
        ...unit,
        crimeCategory: statistic.crimeCategory,
        legalRegime: statistic.legalRegime,
        ageGroup: statistic.ageGroup,
        isCurrent: true,
      },
      recordDoc,
      ['registeredCases', 'originalValue', 'reportingUnitLabelOriginal', 'validationStatus'],
      report,
      'crimeRecords',
    );

    for (const check of checks) {
      await insertIfAbsent(
        ValidationRecord,
        {
          source: source._id,
          checkName: check.rule,
          reportingYear: unit.year,
          reportingUnit: unit.reportingUnit,
          reportingUnitType: unit.reportingUnitType,
        },
        {
          source: source._id,
          checkName: check.rule,
          reportingYear: unit.year,
          reportingUnit: unit.reportingUnit,
          reportingUnitType: unit.reportingUnitType,
          result: check.result,
          explanation: check.scope,
          checkedAt: check.result === 'PENDING' ? undefined : new Date(statistic.checkedAgainstExtractAt),
        },
        ['result'],
        report,
        'validationRecords',
      );
    }
  }

  for (const gap of coverage) {
    const filter = {
      dataset: TOTALS_DATASET,
      year: gap.year,
      reportingUnit: 'Delhi UT',
      reportingUnitType: 'state_ut',
    };
    await insertIfAbsent(
      CoverageRecord,
      filter,
      {
        ...filter,
        status: gap.status,
        reason: gap.reason,
        expectedSource: gap.expectedSource,
        resolvedBy: gap.resolvedBy,
        resolvedAt: gap.resolvedAt ? new Date(gap.resolvedAt) : undefined,
      },
      ['status'],
      report,
      'coverageRecords',
    );
  }

  return report;
}
