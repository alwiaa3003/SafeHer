import { ApiError } from '../middleware/index.js';
import { GAP_STATUSES } from '../models/CoverageRecord.js';
import { DELHI_WIDE_UNIT_TYPES, DISTRICT_UNIT_TYPES } from '../models/constants.js';
import { CoverageRecord, CrimeCategory, CrimeRecord, DataSource } from '../models/index.js';
import { pageMeta, paging, publicCategory, publicCoverage, publicStatistic } from './serializers.js';

const REPORTED_CAVEATS = [
  'REGISTERED_CASES_ONLY',
  'NOT_A_MEASURE_OF_SAFETY',
];

function yearRange({ fromYear, toYear }) {
  const range = {};
  if (fromYear !== undefined) range.$gte = fromYear;
  if (toYear !== undefined) range.$lte = toYear;
  return Object.keys(range).length > 0 ? range : undefined;
}

export async function listCrimes(req, res) {
  const query = req.validatedQuery;
  const filter = { isCurrent: true };
  const range = yearRange(query);
  if (query.year !== undefined) filter.year = query.year;
  else if (range) filter.year = range;
  if (query.reportingUnit) filter.reportingUnit = query.reportingUnit;
  filter.reportingUnitType = query.reportingUnitType ?? { $in: DELHI_WIDE_UNIT_TYPES };
  if (query.validationStatus) filter.validationStatus = query.validationStatus;

  const pager = paging(query);
  const [records, total] = await Promise.all([
    CrimeRecord.find(filter)
      .sort({ year: 1, reportingUnit: 1 })
      .skip(pager.skip)
      .limit(pager.limit)
      .populate('source')
      .lean(),
    CrimeRecord.countDocuments(filter),
  ]);

  res.json({ data: records.map(publicStatistic), meta: { ...pageMeta(pager, total), caveats: REPORTED_CAVEATS } });
}

// One series covers one reporting unit, so unlike units are never joined.
async function loadSeriesInputs(query) {
  // A series is one annual total per year, so district units (several categories per year)
  // are served by /api/police-districts/statistics instead.
  if (DISTRICT_UNIT_TYPES.includes(query.reportingUnitType)) {
    throw new ApiError(400, 'USE_DISTRICT_ENDPOINT', 'Police-district figures are served by /api/police-districts/statistics.');
  }
  const filter = { reportingUnit: query.reportingUnit, reportingUnitType: query.reportingUnitType ?? { $in: DELHI_WIDE_UNIT_TYPES } };
  const range = yearRange(query);
  if (range) filter.year = range;

  const [records, gaps] = await Promise.all([
    CrimeRecord.find({ ...filter, isCurrent: true }).sort({ year: 1 }).populate('source').lean(),
    // Resolved gaps are history, not missing years.
    CoverageRecord.find({ ...filter, status: { $in: GAP_STATUSES } }).sort({ year: 1 }).lean(),
  ]);

  const unitTypes = new Set([...records, ...gaps].map((item) => item.reportingUnitType));
  if (unitTypes.size > 1) {
    throw new ApiError(
      409,
      'AMBIGUOUS_REPORTING_UNIT',
      'This reporting unit name has more than one type. Specify reportingUnitType.',
    );
  }
  return { records, gaps, reportingUnitType: [...unitTypes][0] ?? query.reportingUnitType ?? null };
}

export async function trends(req, res) {
  const query = req.validatedQuery;
  const { records, gaps, reportingUnitType } = await loadSeriesInputs(query);
  const years = [...records, ...gaps].map((item) => item.year);
  const series = [];

  if (years.length > 0) {
    const byYear = new Map(records.map((record) => [record.year, record]));
    const gapByYear = new Map(gaps.map((gap) => [gap.year, gap]));
    const first = Math.min(...years);
    const last = Math.max(...years);
    for (let year = first; year <= last; year += 1) {
      const record = byYear.get(year);
      const gap = gapByYear.get(year);
      series.push({
        year,
        availability: record ? 'available' : gap ? 'missing' : 'not_recorded',
        statistic: record ? publicStatistic(record) : null,
        coverage: gap ? publicCoverage(gap) : null,
      });
    }
  }

  res.json({
    data: { reportingUnit: query.reportingUnit, reportingUnitType, measure: 'registeredCases', series },
    meta: { points: series.length, caveats: REPORTED_CAVEATS },
  });
}

export async function summary(req, res) {
  const query = req.validatedQuery;
  const { records, gaps, reportingUnitType } = await loadSeriesInputs(query);
  const latest = records[records.length - 1];
  const validationStatusCounts = {};
  records.forEach((record) => {
    validationStatusCounts[record.validationStatus] =
      (validationStatusCounts[record.validationStatus] ?? 0) + 1;
  });

  res.json({
    data: {
      reportingUnit: query.reportingUnit,
      reportingUnitType,
      measure: 'registeredCases',
      availableYears: records.map((record) => record.year),
      missingYears: gaps.map(publicCoverage),
      latest: latest
        ? {
            year: latest.year,
            registeredCases: latest.registeredCases,
            validationStatus: latest.validationStatus,
            edition: latest.source?.sourceName ?? null,
          }
        : null,
      validationStatusCounts,
    },
    meta: { caveats: REPORTED_CAVEATS },
  });
}

export async function categories(req, res) {
  const query = req.validatedQuery;
  const filter = {};
  // The stored reportingYear field holds the publication year. See CrimeCategory.
  if (query.publicationYear !== undefined) filter.reportingYear = query.publicationYear;
  if (query.reportingYear !== undefined) {
    const covering = await DataSource.find({
      'reportingPeriod.from': { $lte: query.reportingYear },
      'reportingPeriod.to': { $gte: query.reportingYear },
    })
      .select('_id')
      .lean();
    filter.source = { $in: covering.map((source) => source._id) };
  }
  if (query.legalFramework) filter.legalFramework = query.legalFramework;
  // District-file labels belong to the Crime Map, not to the Delhi-wide category list.
  const districtSources = await DataSource.find({ reportingLevel: 'police_district' }).select('_id').lean();
  if (districtSources.length > 0) {
    const excluded = districtSources.map((source) => source._id);
    filter.source = filter.source ? { $in: filter.source.$in, $nin: excluded } : { $nin: excluded };
  }

  const pager = paging(query);
  const [rows, total] = await Promise.all([
    CrimeCategory.find(filter)
      .sort({ reportingYear: 1, originalCategoryName: 1 })
      .skip(pager.skip)
      .limit(pager.limit)
      .populate('source')
      .lean(),
    CrimeCategory.countDocuments(filter),
  ]);

  res.json({ data: rows.map(publicCategory), meta: pageMeta(pager, total) });
}
