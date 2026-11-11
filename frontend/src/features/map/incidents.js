// Rules a future incident record must meet before it may appear as a marker.
// SafeHer currently holds no incident-level records, so nothing is eligible.
export const PRECISION_LEVELS = ['exact', 'street', 'neighbourhood'];
export const PUBLIC_STATUS = 'approved_for_public_display';

const isCoordinate = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

export function incidentProblems(record) {
  const problems = [];
  if (!record || typeof record !== 'object') return ['not a record'];
  const coords = record.location?.coordinates;
  if (record.location?.type !== 'Point' || !Array.isArray(coords) || !isCoordinate(coords[0], -180, 180) || !isCoordinate(coords[1], -90, 90)) problems.push('no valid [longitude, latitude] point');
  if (record.location?.verified !== true) problems.push('coordinate not verified');
  if (!PRECISION_LEVELS.includes(record.location?.precision)) problems.push('geographic precision not classified');
  if (!record.sourceReference) problems.push('no source reference');
  if (!record.categoryLabelOriginal) problems.push('no documented crime category');
  if (record.publicationReview?.status !== PUBLIC_STATUS) problems.push('publication and privacy review not approved');
  if (record.date && Number.isNaN(Date.parse(record.date))) problems.push('date is not a valid date');
  // Records must never carry people's identities.
  if (['name', 'accusedName', 'victimName', 'phone', 'address', 'photoUrl'].some((key) => key in record)) problems.push('contains personal data');
  return problems;
}

export const isEligibleIncident = (record) => incidentProblems(record).length === 0;
export const eligibleIncidents = (records = []) => records.filter(isEligibleIncident);

// No approved incident collection exists. When one does, this is the single place to connect it.
export function useIncidentRecords() {
  return { status: 'unavailable', records: [] };
}
