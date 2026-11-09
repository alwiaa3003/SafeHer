// The states shown to readers, and how specification statuses map to them.
export const STATUS_KIND = {
  VERIFIED: 'verified',
  VERIFIED_WITH_NOTE: 'verified_with_note',
  INCOMPLETE: 'incomplete',
  UNAVAILABLE: 'unavailable',
};

export const TABLE_TOTALS_CHECKED_LABEL =
  'Verified with note – Table 3A.1 totals checked; further validation pending';

const DISPLAY_BY_VALIDATION_STATUS = {
  verified: { kind: STATUS_KIND.VERIFIED, label: 'Verified' },
  verified_with_note: { kind: STATUS_KIND.VERIFIED_WITH_NOTE, label: TABLE_TOTALS_CHECKED_LABEL },
  pending: { kind: STATUS_KIND.INCOMPLETE, label: 'Pending – validation not complete' },
  passed_automatic: { kind: STATUS_KIND.INCOMPLETE, label: 'Automatic checks passed – manual check pending' },
  conflict: { kind: STATUS_KIND.INCOMPLETE, label: 'Conflict – needs review' },
  failed: { kind: STATUS_KIND.INCOMPLETE, label: 'Failed validation' },
};

// A status this page does not recognise must never read as checked.
const UNKNOWN_STATUS = { kind: STATUS_KIND.UNAVAILABLE, label: 'Status unknown – not confirmed' };
const NO_FIGURES = { kind: STATUS_KIND.UNAVAILABLE, label: 'No figures loaded' };
const MIXED_STATUSES = { kind: STATUS_KIND.INCOMPLETE, label: 'Mixed validation status – see each year in the table' };

export function statusDisplayFor(validationStatus) {
  return Object.hasOwn(DISPLAY_BY_VALIDATION_STATUS, validationStatus ?? '')
    ? DISPLAY_BY_VALIDATION_STATUS[validationStatus]
    : UNKNOWN_STATUS;
}

export const statusKindFor = (validationStatus) => statusDisplayFor(validationStatus).kind;

// One status for a whole series. Differing years are never summarised as the best of them.
export function seriesStatusDisplay(series) {
  const statuses = new Set(series.filter((row) => row.statistic).map((row) => row.statistic.validationStatus));
  if (statuses.size === 0) return NO_FIGURES;
  if (statuses.size > 1) return MIXED_STATUSES;
  return statusDisplayFor([...statuses][0]);
}
