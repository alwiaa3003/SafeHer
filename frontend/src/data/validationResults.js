import { STATUS_KIND } from './status';

// Display for validation check results. Pending and failed checks never read as passed.
const RESULTS = {
  PASS: { label: 'Pass', kind: STATUS_KIND.VERIFIED_WITH_NOTE },
  PASS_WITH_NOTE: { label: 'Pass with note', kind: STATUS_KIND.VERIFIED_WITH_NOTE },
  PENDING: { label: 'Pending', kind: STATUS_KIND.INCOMPLETE },
  FAIL: { label: 'Fail', kind: STATUS_KIND.INCOMPLETE },
  NOT_APPLICABLE: { label: 'Not applicable', kind: STATUS_KIND.UNAVAILABLE },
};

export function resultDisplay(result) {
  return Object.hasOwn(RESULTS, result ?? '') ? RESULTS[result] : { label: result ? `Unrecognised (${result})` : 'Not recorded', kind: STATUS_KIND.UNAVAILABLE };
}
