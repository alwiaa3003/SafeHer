# SafeHer Incident Data Architecture: Recommendation

**Status:** Design only, 10 November 2026. Nothing was implemented, and nothing was written to MongoDB. This extends the [incident-level map integration recommendations](incident-level-map-integration-recommendations.md).

## 1. Principles

- **Independent of source.** Any custodian (police extract, researcher aggregates, NCW, NCRB) fits through the same pipeline.
- **Two tiers:**
  - restricted **source data** stays outside the public database, encrypted, and is never served;
  - **public records** are generated only after review.
- **Location source is mandatory.** Every record states how its location was derived. The Narayan (2024) findings show this distinguishes a real incident site from a caller location or a police station.
- **Areas by default.** Points are possible only under the strict rules in §4.
- **Labels kept separate.** Original labels are never merged across IPC and BNS, and complaints, FIRs and perception data are never added together.

## 2. Collections

```
dataSources            existing; add licenceStatus, permissionRef, populationType
                       (registered_fir | complaint | call | perception | court_case)

publicIncidentAreas    the default public layer
  areaType             police_district | ward | grid_1km | police_station
  areaId, period { start, end, precision }
  categoryOriginal, legalFramework
  count | null, suppressed: boolean (count withheld below threshold)
  populationType, sourceId, sourceReference
  locationSource       fir_place_of_occurrence | caller_location | police_station | manual_plot | aggregate_published
  verificationStatus, privacyReviewId, publicationEligible

publicIncidents        points; empty unless every point rule passes
  incidentId (anonymised), categoryOriginal, legalFramework, standardCategory (reviewed mapping)
  date, datePrecision
  location (GeoJSON Point) | gridId
  precision            EXACT_INCIDENT | NAMED_STREET | LOCALITY | GRID | POLICE_DISTRICT
  locationSource, placeType, victimLinked
  policeDistrict, policeStation?, sourceId, sourceReference, licenceStatus
  verificationStatus, privacyReviewId, publicationEligible

reviews                append-only: entity, scope (licence | location | privacy | publication), decision,
                       reviewer, at, expiresAt, notes

restrictedSourceStore  outside Atlas public collections. Encrypted; access-logged; never joined by the API
```

## 3. Server-side publication checks

The API returns a record only if all of the following hold:
1. `publicationEligible` is true.
2. The latest unexpired reviews for licence, location, privacy and publication all approve.
3. `locationSource` is not `caller_location` or `police_station`.
4. The count is not below the suppression threshold.
5. The category is not withheld (sexual offences and POCSO only as suppressed area counts).
6. No personal field exists.

The current browser check (`incidents.js`) remains as a second layer. Its precision rules should be tightened first (OR-31).

## 4. Point rules

A point requires all of:
- `precision = EXACT_INCIDENT`;
- `locationSource = fir_place_of_occurrence` or another documented incident-site source;
- `placeType = public_place` and `victimLinked = false`;
- a category outside the protected sexual-offence list;
- explicit licence coverage.

With all known sources, **no record qualifies today**.

## 5. Map behaviour

| Layer | Shows | Notice |
|---|---|---|
| Area layer (default) | Counts for the selected category and period, with a precision badge and source | "Registered FIRs or complaints, not proven offences, and not a safety score" |
| Point layer | Hidden unless eligible records exist | |
| Location panel | Area counts for the containing unit when available; otherwise the current "no incident data" statement | |
