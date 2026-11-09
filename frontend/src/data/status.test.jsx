import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusLabel } from '../components/StatusLabel/StatusLabel';
import { seriesStatusDisplay, STATUS_KIND, statusDisplayFor, TABLE_TOTALS_CHECKED_LABEL } from './status';

const row = (validationStatus) => ({ statistic: { validationStatus } });

describe('statusDisplayFor', () => {
  it.each([
    ['verified', STATUS_KIND.VERIFIED, 'Verified'],
    ['verified_with_note', STATUS_KIND.VERIFIED_WITH_NOTE, TABLE_TOTALS_CHECKED_LABEL],
    ['pending', STATUS_KIND.INCOMPLETE, 'Pending – validation not complete'],
    ['passed_automatic', STATUS_KIND.INCOMPLETE, 'Automatic checks passed – manual check pending'],
    ['conflict', STATUS_KIND.INCOMPLETE, 'Conflict – needs review'],
    ['failed', STATUS_KIND.INCOMPLETE, 'Failed validation'],
  ])('labels %s', (status, kind, label) => {
    expect(statusDisplayFor(status)).toEqual({ kind, label });
  });

  it.each([undefined, null, '', 'approved', 'constructor', '__proto__'])(
    'never treats %s as verified',
    (status) => {
      const display = statusDisplayFor(status);
      expect(display.kind).toBe(STATUS_KIND.UNAVAILABLE);
      expect(display.label).toMatch(/unknown/i);
      expect(display.label).not.toMatch(/verified/i);
    },
  );
});

describe('seriesStatusDisplay', () => {
  it('uses the shared status when every year agrees', () => {
    expect(seriesStatusDisplay([row('pending'), row('pending')]).label).toMatch(/Pending/);
  });

  it('does not present mixed years as the best status', () => {
    const display = seriesStatusDisplay([row('verified'), row('failed')]);
    expect(display.kind).toBe(STATUS_KIND.INCOMPLETE);
    expect(display.label).toMatch(/Mixed/);
  });

  it('ignores gap years and handles a series with no figures', () => {
    expect(seriesStatusDisplay([row('failed'), { statistic: null }]).label).toBe('Failed validation');
    expect(seriesStatusDisplay([{ statistic: null }]).label).toBe('No figures loaded');
  });

  it('does not confirm a missing status', () => {
    expect(seriesStatusDisplay([row(undefined)]).kind).toBe(STATUS_KIND.UNAVAILABLE);
  });
});

describe('StatusLabel', () => {
  it.each([undefined, null, 'not-a-kind', 'constructor'])('falls back to unavailable for %s', (kind) => {
    const { container } = render(<StatusLabel kind={kind} />);
    expect(container.querySelector('[data-status="unavailable"]')).toHaveTextContent('Unavailable');
  });
});
