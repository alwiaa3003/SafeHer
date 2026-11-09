// The three states shown to readers, and how specification statuses map to them.
export const STATUS_KIND = {
  VERIFIED: 'verified',
  INCOMPLETE: 'incomplete',
  UNAVAILABLE: 'unavailable',
};

export const PENDING_PDF_LABEL =
  'Incomplete – Pending manual PDF verification';

const KIND_BY_VALIDATION_STATUS = {
  verified: STATUS_KIND.VERIFIED,
  verified_with_note: STATUS_KIND.VERIFIED,
  pending: STATUS_KIND.INCOMPLETE,
  passed_automatic: STATUS_KIND.INCOMPLETE,
  conflict: STATUS_KIND.INCOMPLETE,
};

export function statusKindFor(validationStatus) {
  return KIND_BY_VALIDATION_STATUS[validationStatus] ?? null;
}
