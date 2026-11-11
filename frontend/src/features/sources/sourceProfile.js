// Describes a source using only fields the API returns. Nothing is inferred about
// authenticity or licensing; a missing field is reported as not recorded.
export const TYPE_LABEL = {
  crime_statistics: 'Crime statistics',
  geographic_boundary: 'Geographic boundary',
  unclassified: 'Unclassified',
};

export const typeLabel = (type) => TYPE_LABEL[type] ?? `Unrecognised type (${type})`;

export function sourceForm(source) {
  if (source.sourceType === 'geographic_boundary') {
    const ref = source.boundaryReference;
    return ref ? `${ref.provider} ${ref.elementType} ${ref.elementId}, version ${ref.version}` : 'Boundary reference not recorded';
  }
  if (source.volume === 'Additional tables') {
    const spreadsheet = /\.xlsx?$/i.test(source.extract?.fileName ?? '');
    return `NCRB additional-tables ${spreadsheet ? 'spreadsheet' : 'file'}, not a printed report page`;
  }
  if (source.extract?.extractPage) return 'Report table, checked against a one-page extract';
  return 'Form not recorded';
}

export const periodText = (p) => (p ? (p.from === p.to ? String(p.from) : `${p.from}–${p.to}`) : null);

// What production data refers to this source, from validation records and boundary provenance.
export function productionUse(source, checks, units) {
  const years = [...new Set(checks.filter((c) => c.source?.id === source.id).map((c) => c.reportingYear))].sort((a, b) => a - b);
  const ref = source.boundaryReference;
  const boundaries = ref
    ? units.filter((u) => u.provenance?.osm?.elementId === ref.elementId && u.provenance?.osm?.version === ref.version)
    : [];
  return { years, boundaries };
}

export function sourceResults(source, checks) {
  return [...new Set(checks.filter((c) => c.source?.id === source.id).map((c) => c.result))];
}
