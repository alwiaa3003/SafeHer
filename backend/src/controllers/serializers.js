import { legacyBoundaryReference, sourceTypeOf } from '../models/sourceClassification.js';

// Public shapes. Database internals are left out on purpose.
export function publicSource(source) {
  if (!source) return null;
  const sourceType = sourceTypeOf(source);
  const isBoundary = sourceType === 'geographic_boundary';
  return {
    id: String(source._id),
    sourceKey: source.sourceKey,
    sourceType,
    sourceName: source.sourceName,
    publisher: source.publisher,
    publicationYear: isBoundary ? null : (source.publicationYear ?? null),
    volume: source.volume ?? null,
    tableReference: isBoundary ? null : (source.tableReference ?? null),
    boundaryReference: isBoundary ? (source.boundaryReference ?? legacyBoundaryReference(source)) : null,
    tableTitle: source.tableTitle ?? null,
    reportingLevel: source.reportingLevel ?? null,
    sourceUrl: source.sourceUrl,
    reportingPeriod: source.reportingPeriod ?? null,
    editionBasis: source.editionBasis ?? null,
    extract: source.extract ?? null,
    notes: source.notes ?? null,
  };
}

export function publicStatistic(record) {
  return {
    id: String(record._id),
    year: record.year,
    reportingUnit: record.reportingUnit,
    reportingUnitLabelOriginal: record.reportingUnitLabelOriginal,
    reportingUnitType: record.reportingUnitType,
    crimeCategory: record.crimeCategory,
    categoryLabelOriginal: record.categoryLabelOriginal,
    legalRegime: record.legalRegime,
    ageGroup: record.ageGroup,
    registeredCases: record.registeredCases,
    victims: record.victims ?? null,
    originalValue: record.originalValue,
    edition: record.source?.sourceName ?? null,
    volume: record.source?.volume ?? null,
    tableNumber: record.source?.tableReference ?? null,
    sourceUrl: record.source?.sourceUrl ?? null,
    sourceReference: record.sourceReference,
    pdfPage: record.pdfPage ?? null,
    pdfPageStatus: record.pdfPageStatus ?? null,
    evidence: record.evidence ?? null,
    sourceHistory: record.sourceHistory ?? [],
    validationStatus: record.validationStatus,
    validationChecks: record.validationChecks ?? [],
    validationNotes: record.validationNotes ?? [],
  };
}

export function publicCoverage(gap) {
  return {
    year: gap.year,
    status: gap.status,
    reason: gap.reason,
    expectedSource: gap.expectedSource ?? null,
  };
}

export function publicCategory(category) {
  return {
    id: String(category._id),
    originalCategoryName: category.originalCategoryName,
    normalizedCategoryName: category.normalizedCategoryName ?? null,
    // Stored as reportingYear, but it is the publication year of the source.
    publicationYear: category.reportingYear,
    reportingPeriod: category.source?.reportingPeriod ?? null,
    legalReference: category.legalReference ?? null,
    legalFramework: category.legalFramework,
    definition: category.definition ?? null,
    comparabilityStatus: category.comparabilityStatus,
    source: publicSource(category.source),
  };
}

export function publicValidation(check) {
  return {
    id: String(check._id),
    checkName: check.checkName,
    reportingYear: check.reportingYear,
    reportingUnit: check.reportingUnit,
    reportingUnitType: check.reportingUnitType,
    result: check.result,
    explanation: check.explanation,
    checkedAt: check.checkedAt ?? null,
    source: publicSource(check.source),
  };
}

export function publicGeography(unit, { includeGeometry = false } = {}) {
  const provenance = unit.provenance ?? {};
  return {
    id: String(unit._id),
    geographyName: unit.geographyName,
    geographyType: unit.geographyType,
    adminLevel: unit.adminLevel ?? null,
    boundaryVersion: unit.boundaryVersion,
    verificationStatus: unit.verificationStatus,
    contextOnly: unit.contextOnly,
    geometryType: unit.geometry?.type ?? null,
    provenance: {
      provider: provenance.provider ?? null,
      sourceUrl: provenance.sourceUrl ?? null,
      osm: provenance.osm ?? null,
      retrievedAt: provenance.retrievedAt ?? null,
      licence: provenance.licence ?? null,
      crs: provenance.crs ?? null,
    },
    notes: unit.notes ?? null,
    ...(includeGeometry ? { geometry: unit.geometry } : {}),
  };
}

export function paging(query) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  return { page, limit, skip: (page - 1) * limit };
}

export const pageMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
