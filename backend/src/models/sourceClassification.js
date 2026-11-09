// Classifies dataSources documents, including those stored before sourceType existed.
export const NCRB_PUBLISHER = 'National Crime Records Bureau';
export const LEGACY_OSM_KEY = /^OSM-RELATION-(\d+)-V(\d+)$/;
const LEGACY_OSM_TABLE_REFERENCE = /^relation\/(\d+)\/v(\d+)$/;

export function sourceTypeOf(source) {
  if (source.sourceType) return source.sourceType;
  if (source.publisher === NCRB_PUBLISHER) return 'crime_statistics';
  if (LEGACY_OSM_KEY.test(source.sourceKey)) return 'geographic_boundary';
  return 'unclassified';
}

// Reads the relation identity out of the older tableReference. Returns null unless
// the key and the reference name the same relation and version.
export function legacyBoundaryReference(source) {
  const key = source.sourceKey?.match(LEGACY_OSM_KEY);
  const reference = source.tableReference?.match(LEGACY_OSM_TABLE_REFERENCE);
  if (!key || !reference || key[1] !== reference[1] || key[2] !== reference[2]) return null;
  return {
    provider: 'OpenStreetMap',
    elementType: 'relation',
    elementId: Number(key[1]),
    version: Number(key[2]),
    ...(source.publicationYear ? { lastEditedYear: source.publicationYear } : {}),
  };
}

export function sourceTypeFilter(sourceType) {
  const legacy =
    sourceType === 'crime_statistics'
      ? { publisher: NCRB_PUBLISHER }
      : { sourceKey: LEGACY_OSM_KEY };
  return { $or: [{ sourceType }, { sourceType: null, ...legacy }] };
}
