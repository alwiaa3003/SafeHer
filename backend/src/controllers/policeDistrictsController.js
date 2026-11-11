import { ApiError } from '../middleware/index.js';
import { CrimeCategory, CrimeRecord, DataSource, GeographicalUnit, ValidationRecord } from '../models/index.js';
import { publicSource } from './serializers.js';

const DISTRICT = 'police_district';
const NON_GEOGRAPHIC = 'police_unit_non_geographic';
const PUBLISHABLE = ['verified', 'verified_with_note'];

export const DISTRICT_NOTICES = [
  'Registered cases, not proven offences.',
  'District-level statistics do not identify individual incident locations.',
  'Not a safety score.',
];
const CAVEATS = ['REGISTERED_CASES_ONLY', 'POLICE_DISTRICT_PRECISION', 'NOT_A_MEASURE_OF_SAFETY'];

const BOUNDARY_UNAVAILABLE = {
  status: 'unavailable',
  reason:
    'The only complete map of Delhi\'s 16 police districts is published by GeoSpatial Delhi Limited (GSDL), which states "All Rights Reserved" and offers no licence for reuse. SafeHer will draw the districts once written permission or an openly licensed map is available.',
};

const recordFilter = (extra = {}) => ({
  reportingUnitType: { $in: [DISTRICT, NON_GEOGRAPHIC] },
  isCurrent: true,
  validationStatus: { $in: PUBLISHABLE },
  ...extra,
});

// Providers that publish no open licence. Their geometry is never public, even if a unit were
// marked verified by mistake, unless its licence records written permission (permissionReference).
export const RESTRICTED_BOUNDARY_PROVIDERS = ['GSDL'];

// Public data is static between imports; review responses are never cached.
const PUBLIC_CACHE = 'public, max-age=3600';
const setCache = (req, res) => res.set('Cache-Control', req.app.locals.reviewBoundaries ? 'no-store' : PUBLIC_CACHE);

// Only verified, licensed boundaries are public. The development server may opt in to
// unverified review copies; those are labelled as review-only in every response.
function boundaryFilter(req) {
  const base = { geographyType: DISTRICT, isCurrent: true, geometry: { $exists: true }, unitCode: { $exists: true } };
  if (req.app.locals.reviewBoundaries) return { ...base, verificationStatus: { $in: ['verified', 'unverified'] } };
  return {
    ...base,
    verificationStatus: 'verified',
    'provenance.licence.name': { $exists: true },
    $or: [
      { 'provenance.provider': { $nin: RESTRICTED_BOUNDARY_PROVIDERS } },
      { 'provenance.licence.permissionReference': { $exists: true, $ne: '' } },
    ],
  };
}

// A second check on the documents themselves, so a filter mistake cannot leak geometry.
export function isPublishableBoundary(unit) {
  if (unit.verificationStatus !== 'verified' || !unit.provenance?.licence?.name) return false;
  return !RESTRICTED_BOUNDARY_PROVIDERS.includes(unit.provenance.provider) || Boolean(unit.provenance.licence.permissionReference);
}

async function findBoundaries(req, projection) {
  const query = GeographicalUnit.find(boundaryFilter(req)).sort({ unitCode: 1 });
  if (projection) query.select(projection);
  const units = await query.lean();
  return req.app.locals.reviewBoundaries ? units : units.filter(isPublishableBoundary);
}

function boundarySummary(units) {
  if (units.length === 0) return BOUNDARY_UNAVAILABLE;
  const first = units[0];
  const reviewOnly = units.some((unit) => unit.verificationStatus !== 'verified');
  return {
    status: reviewOnly ? 'review_only' : 'published',
    reviewOnly,
    provider: first.provenance?.provider ?? null,
    sourceUrl: first.provenance?.sourceUrl ?? null,
    licence: first.provenance?.licence ?? null,
    boundaryVersion: first.boundaryVersion,
    districtCount: units.length,
    reason: reviewOnly
      ? 'Local review copy of the GSDL police-district layer. GSDL states "All Rights Reserved": it must not be published or redistributed.'
      : null,
  };
}

function categoryList(records, categories) {
  const labels = new Map(categories.map((c) => [String(c._id), c]));
  const byKey = new Map();
  for (const record of records) {
    const entry = byKey.get(record.crimeCategory) ?? {
      key: record.crimeCategory,
      label: labels.get(String(record.category))?.normalizedCategoryName ?? record.categoryLabelOriginal,
      labelOriginal: record.categoryLabelOriginal,
      legalRegime: record.legalRegime,
      years: new Set(),
    };
    entry.years.add(record.year);
    byKey.set(record.crimeCategory, entry);
  }
  const list = [...byKey.values()].map((c) => ({ ...c, years: [...c.years].sort((a, b) => a - b) }));
  // The overall total first, then categories in the order NCRB prints them.
  return list.sort((a, b) => (a.key === 'total' ? -1 : b.key === 'total' ? 1 : 0));
}

function unitList(records, type) {
  const units = new Map();
  for (const r of records) {
    if (r.reportingUnitType === type) units.set(r.reportingUnitCode, { code: r.reportingUnitCode, label: r.reportingUnit, labelOriginal: r.reportingUnitLabelOriginal });
  }
  return [...units.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export async function districtMeta(req, res) {
  const [records, sources, checks, boundaries] = await Promise.all([
    CrimeRecord.find(recordFilter()).select('year reportingUnit reportingUnitLabelOriginal reportingUnitType reportingUnitCode crimeCategory categoryLabelOriginal legalRegime category').sort({ _id: 1 }).lean(),
    DataSource.find({ reportingLevel: DISTRICT }).sort({ publicationYear: 1 }).lean(),
    ValidationRecord.find({ checkName: 'DIST-REC', reportingUnitType: DISTRICT }).sort({ reportingYear: 1 }).lean(),
    findBoundaries(req, '-geometry'),
  ]);
  const categories = await CrimeCategory.find({ _id: { $in: [...new Set(records.map((r) => String(r.category)))] } }).lean();
  const years = [...new Set(records.filter((r) => r.crimeCategory === 'total').map((r) => r.year))].sort((a, b) => a - b);

  setCache(req, res);
  res.json({
    data: {
      measure: 'registered_cases',
      geographicPrecision: 'Police district',
      years,
      categories: categoryList(records, categories),
      districts: unitList(records, DISTRICT),
      nonGeographicUnits: unitList(records, NON_GEOGRAPHIC),
      sources: sources.map((source) => ({
        ...publicSource(source),
        reconciliation: checks.find((c) => String(c.source) === String(source._id))?.explanation ?? null,
      })),
      boundary: boundarySummary(boundaries),
      notices: DISTRICT_NOTICES,
    },
    meta: { caveats: CAVEATS },
  });
}

export async function districtStatistics(req, res) {
  const { category, year } = req.validatedQuery;
  const filter = recordFilter({ crimeCategory: category });
  if (year !== undefined) filter.year = year;
  const records = await CrimeRecord.find(filter).sort({ year: 1, reportingUnit: 1 }).populate('source').lean();
  if (records.length === 0) {
    const known = await CrimeRecord.exists(recordFilter({ crimeCategory: category }));
    if (!known) throw new ApiError(404, 'CATEGORY_NOT_AVAILABLE', 'No validated police-district figures exist for this category.');
  }

  const rows = (type) => {
    const units = new Map();
    for (const r of records.filter((record) => record.reportingUnitType === type)) {
      const unit = units.get(r.reportingUnitCode) ?? { code: r.reportingUnitCode, label: r.reportingUnit, labelOriginal: r.reportingUnitLabelOriginal, values: [] };
      unit.values.push({
        year: r.year,
        registeredCases: r.registeredCases,
        originalValue: r.originalValue,
        sourceKey: r.source?.sourceKey ?? null,
        sourceName: r.source?.sourceName ?? null,
        sourceUrl: r.source?.sourceUrl ?? null,
        sourceReference: r.sourceReference,
        validationStatus: r.validationStatus,
      });
      units.set(r.reportingUnitCode, unit);
    }
    return [...units.values()];
  };
  const first = records[0];
  setCache(req, res);
  res.json({
    data: {
      category: first ? { key: category, labelOriginal: first.categoryLabelOriginal, legalRegime: first.legalRegime } : { key: category },
      years: [...new Set(records.map((r) => r.year))].sort((a, b) => a - b),
      districts: rows(DISTRICT),
      nonGeographicUnits: rows(NON_GEOGRAPHIC),
    },
    meta: { caveats: CAVEATS, notices: DISTRICT_NOTICES },
  });
}

export async function districtBoundaries(req, res) {
  const units = await findBoundaries(req);
  setCache(req, res);
  res.json({
    type: 'FeatureCollection',
    features: units.map((unit) => ({
      type: 'Feature',
      properties: { code: unit.unitCode, name: unit.geographyName, boundaryVersion: unit.boundaryVersion },
      geometry: unit.geometry,
    })),
    meta: { boundary: boundarySummary(units) },
  });
}
