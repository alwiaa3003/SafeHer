import { describe, expect, it } from 'vitest';
import { eligibleIncidents, incidentProblems, isEligibleIncident, useIncidentRecords } from './incidents';

// Test-only records. They exist only in this file and are never served or rendered by the app.
const complete = {
  id: 'test-only',
  location: { type: 'Point', coordinates: [77.2, 28.6], verified: true, precision: 'street' },
  sourceReference: 'TEST-SOURCE',
  categoryLabelOriginal: 'Test category',
  publicationReview: { status: 'approved_for_public_display' },
  date: '2022-01-01',
};

describe('incident marker eligibility', () => {
  it('accepts only a record that meets every rule', () => {
    expect(isEligibleIncident(complete)).toBe(true);
  });

  it.each([
    ['no coordinates', { location: { ...complete.location, coordinates: undefined } }, 'no valid [longitude, latitude] point'],
    ['out-of-range coordinates', { location: { ...complete.location, coordinates: [200, 28.6] } }, 'no valid [longitude, latitude] point'],
    ['unverified coordinate', { location: { ...complete.location, verified: false } }, 'coordinate not verified'],
    ['district centroid precision', { location: { ...complete.location, precision: 'district_centroid' } }, 'geographic precision not classified'],
    ['no source', { sourceReference: '' }, 'no source reference'],
    ['no category', { categoryLabelOriginal: undefined }, 'no documented crime category'],
    ['review pending', { publicationReview: { status: 'pending' } }, 'publication and privacy review not approved'],
    ['bad date', { date: 'yesterday' }, 'date is not a valid date'],
    ['personal data', { accusedName: 'x' }, 'contains personal data'],
  ])('rejects a record with %s', (_label, change, problem) => {
    const record = { ...complete, ...change };
    expect(isEligibleIncident(record)).toBe(false);
    expect(incidentProblems(record)).toContain(problem);
  });

  it('filters a mixed list and handles nothing', () => {
    expect(eligibleIncidents([complete, { ...complete, sourceReference: null }, null]).map((r) => r.id)).toEqual(['test-only']);
    expect(eligibleIncidents()).toEqual([]);
  });

  it('has no incident records connected in the application', () => {
    expect(useIncidentRecords()).toEqual({ status: 'unavailable', records: [] });
  });
});
