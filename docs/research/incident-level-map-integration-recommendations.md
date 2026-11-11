# Incident-Level Data: Map Integration Recommendations

**Status:** Future design only, 10 November 2026. Nothing has been implemented. The Crime Map shows no crime markers, and with current evidence it must continue not to.

## 1. Current implementation

| Part | File | Current behaviour |
|---|---|---|
| Eligibility contract | `frontend/src/features/map/incidents.js` | Point, verification, precision, source, category, review and no-personal-data checks. `useIncidentRecords()` returns `unavailable` |
| Marker layer | `frontend/src/features/map/IncidentMarkers.jsx` | Renders eligible records only (none today) |
| Layer and category panels | `LayerPanel.jsx`, `CategoryPanel.jsx` | Incident layer disabled; categories disabled, with research statuses |
| Location panel | `LocationPanel.jsx` | States that no incident records exist, and that this does not mean no crime or safety |
| Backend | Express routes, Mongoose models | No incident collection |

**Known gap (OR-31):** `PRECISION_LEVELS` accepts `exact`, `street` and `neighbourhood` as points. This must be tightened before any import.

## 2. Red marker eligibility

A record may be shown as a point only if **all** of the following hold:

1. **Traceable source:** `sourceId` plus a URL or DOI, an access date and a SHA-256.
2. **Documented category:** the original label as published, with its legal framework (IPC or BNS).
3. **Verified incident location:** the source documents that the coordinate is the incident site, not a police station, court, district centroid, review zone or geocoded address. Granularity must be `INCIDENT_EXACT_COORDINATE`.
4. **Lawful basis:** a written licence or permission that covers derived public display.
5. **Privacy review:** approved and unexpired.
   - `placeType` is a public place.
   - `victimLinked` is false.
   - No sexual-offence or POCSO record is ever a point.
6. **No prohibited data:** no names, addresses, phone numbers, photographs or free text.

**Fallbacks:**
- Coarser records (`INCIDENT_POLICE_DISTRICT`, `INCIDENT_LOCALITY`, `INCIDENT_DISTRICT_ONLY`) appear only as **area aggregates** with small-count suppression. They are never points on a street.
- If no record passes, **the map stays free of crime markers.** This is the case today.

## 3. Minimum record schema (future `incidents` collection)

```
incidentId            "SH-INC-<source>-<n>" (stable)
sourceId              -> sourceReferences
categoryOriginal      label exactly as published
legalFramework        IPC | BNS | SLL | not_stated
date                  ISO date | null
datePrecision         day | month | year | unknown
location              GeoJSON Point | null   only if granularity = INCIDENT_EXACT_COORDINATE and approved
granularity           INCIDENT_EXACT_COORDINATE | INCIDENT_NAMED_STREET | INCIDENT_LOCALITY |
                      INCIDENT_POLICE_DISTRICT | INCIDENT_DISTRICT_ONLY
reportingUnit         police district or locality name as published
placeType             public_place | home | school | workplace | transport | unknown
victimLinked          boolean
sourceReference       URL/DOI, page or row
licenceStatus         licensed | permission_granted | permission_pending | not_licensed
privacyReview         { status, reviewer, reviewedAt, expiresAt }
verificationStatus    verified | pending | failed
```

No identity fields. No link to any person or offender collection.

## 4. Architecture

- **MongoDB:**
  - **Collections:** an `incidents` collection with a 2dsphere index on `location`, a separate `incidentAggregates` collection (area, period, category, count, suppressed flag), and the existing `dataSources` extended with `licenceStatus`.
  - **Validation:** JSON-schema validation rejects personal-data fields.
- **Seed:** a dry-run-by-default importer, like the existing seed. It only adds records, reports differences and never overwrites.
- **Express:** read-only `GET /api/incidents?category=&from=&to=&bbox=`, returning only records that pass the eligibility rules on the server. It returns aggregates where points are not allowed, and never returns non-public fields.
- **React:**
  - **Data hook:** `useIncidentRecords()` calls the API.
  - **Eligibility:** the existing `incidentProblems` contract is kept as a second check in the browser.
  - **Category filters:** enabled only for categories with records.
  - **Date filters:** shown only when `datePrecision` allows.
  - **Marker popover:** category label, date or period, granularity badge, source and licence, and the link opening in a new tab.
  - **Area layer:** a choropleth for aggregates, labelled "registered cases" with a "not a safety score" notice.

## 5. Sequence (each step needs separate approval)

1. Obtain permissions (acquisition plan).
2. Tighten the eligibility contract (OR-31).
3. Build the aggregate layer first, using NCRB district counts once GSDL and the NCRB licence are cleared.
4. Build the point layer only if a dataset meets every condition in §2.
