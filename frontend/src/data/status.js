// The three states shown to readers, and how specification statuses map to them.
export const STATUS_KIND = {
  VERIFIED: 'verified',
  VERIFIED_WITH_NOTE: 'verified_with_note',
  INCOMPLETE: 'incomplete',
  UNAVAILABLE: 'unavailable',
};

export const TABLE_TOTALS_CHECKED_LABEL =
  'Verified with note – Table 3A.1 totals checked; further validation pending';

const KIND_BY_VALIDATION_STATUS = {
  verified: STATUS_KIND.VERIFIED,
  verified_with_note: STATUS_KIND.VERIFIED_WITH_NOTE,
  pending: STATUS_KIND.INCOMPLETE,
  passed_automatic: STATUS_KIND.INCOMPLETE,
  conflict: STATUS_KIND.INCOMPLETE,
};

export function statusKindFor(validationStatus) {
  return KIND_BY_VALIDATION_STATUS[validationStatus] ?? null;
}
