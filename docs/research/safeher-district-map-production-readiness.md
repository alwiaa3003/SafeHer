# SafeHer police-district map: production readiness

- **Date:** 10 November 2026
- **Conclusion:** **BLOCKED_BY_MULTIPLE_ISSUES**
  - **Boundary licence:** no publishable police-district geometry exists.
  - **NCRB reuse terms:** NCRB's copyright statement requires prior permission to reproduce its material.

  The code is deployable with the table fallback, but public display of the figures has not been cleared.

## 1. Evidence for the status

| Blocker | Evidence | Details |
|---|---|---|
| Boundary licence | GSDL is the only complete layer, and it states "All Rights Reserved". 13 candidates were checked; none passes. | [boundary assessment](public-police-boundary-source-assessment.md), [CSV](public-police-boundary-candidate-comparison.csv) |
| NCRB reuse | ncrb.gov.in/copyright-statement: material "should not be copied/reproduced, in part or in full, without the prior permission of the Bureau". No GODL resource covers 2020–2022 district files. | [rights assessment](ncrb-publication-rights-assessment.md) |

**If only the boundary were blocked**, the status would be READY_WITH_DOCUMENTED_LIMITATIONS. The table fallback is complete and tested.

**The NCRB condition also applies** to the Delhi-wide totals already on other pages. It is not specific to the map.

## 2. Public behaviour (verified)

| Requirement | State |
|---|---|
| Only licensed boundaries in production | The public filter requires `verified` units with a licence, and excludes GSDL unless written permission is recorded. A second check runs on the returned documents. Tested, including a GSDL unit wrongly marked verified. |
| Review geometry never in production | There are six layers; see the [backend README](../../backend/README.md#police-district-map-data). Browser pass C confirmed that a production build pointed at a review server draws no polygons and says so. |
| Dev-only variables cannot enable review mode | `loadConfig` throws if `SAFEHER_REVIEW_DISTRICT_BOUNDARIES` is set with `NODE_ENV=production`. `npm start` runs `server.js`, which never enables review. |
| No restricted files in build assets | `dist/` scanned: no GeoJSON, xlsx or PDF; no `gsdl.org.in`, `SAFEHER_REVIEW` or `retrieved-2026` strings; no long coordinate arrays. The GSDL copy is under Git-ignored `docs/source-reports/`. |
| Table fallback | All 16 districts, plus the 7 off-map units listed separately. A district can be chosen from the table. |
| Polygons explained | The boundary notice gives the licence reason. |
| No fake shapes or incident markers | None. |
| Precision label | "Police district" on every panel and in the meta response. |

## 3. Changes made in this milestone

### Backend
- `config/env.js`: refuses a review-boundary path in production.
- `seed/importPoliceDistrictBoundaries.js`:
  - the review importer refuses production;
  - new `importLicensedPoliceDistricts`, which requires full provenance, a licence and a retrieval date, and refuses GSDL without `permissionReference`;
  - district names are matched exactly after hyphen and space normalisation, with an IGI Airport alias.
- `models/GeographicalUnit.js`: `licence.permissionReference`.
- `controllers/policeDistrictsController.js`:
  - excludes restricted providers;
  - adds `isPublishableBoundary` as a second check;
  - sets `Cache-Control` (public `max-age=3600`, review `no-store`).
- `seed/policeDistricts.js`: `--check` validates the dataset without any database connection.
- `.env.example`: documents the review variable as development-only.

### Frontend
- `features/geography/tiles.js`: tile provider set by `VITE_TILE_URL`, `VITE_TILE_ATTRIBUTION` and `VITE_TILE_MAX_ZOOM`. The default is OSM.
- `data/index.js`: `publicBoundaryCollection`, which makes a production build discard non-published boundaries.
- `DistrictLegend.jsx`: credits a published boundary's provider and licence.
- Methodology and Data & Sources: NCRB reuse text updated with the copyright statement.
- `frontend/.env.example`: new.

### API (contract unchanged)
- New `Cache-Control` headers.
- `/boundaries` stays an empty FeatureCollection until a licensed import.
- Validation is unchanged:
  - strict queries;
  - category slug pattern;
  - four-digit year;
  - 404 `CATEGORY_NOT_AVAILABLE`;
  - 503 when the database is down.
- **Query limits:** none needed. Each response is bounded: at most 23 units × 3 years, or 16 features.
- Delhi-wide endpoints still exclude district records (tested).

## 4. Map tiles

- **Default provider:** `tile.openstreetmap.org`, with attribution "© OpenStreetMap contributors" linked to the copyright page, at bottom right.
  - The referrer policy `strict-origin-when-cross-origin` sends the origin, as the policy requires.
  - Only viewport tiles are requested, with no prefetching.
- **OSM tile policy, checked 10 November 2026:**
  - "Availability is best-effort: there is no SLA or guarantee."
  - Heavy use may be blocked without notice.
  - Commercial or donation-seeking services should expect access to be "withdrawn at any point".
  - It points heavy users to other providers or self-hosting.
- **Assessment:** suitable for development and a small academic preview. A public launch should set `VITE_TILE_URL` to:
  - a hosted provider whose terms cover the expected traffic (most need an account and API key, which SafeHer has not registered); or
  - a self-hosted tile server or vector tiles (switch2osm).

  Either way, show both the provider's attribution and OpenStreetMap's.

## 5. Deployment checklist

| Item | State |
|---|---|
| Frontend build | `npm run build` succeeds. There is a warning that one 596 kB chunk (191 kB gzip) exceeds 500 kB; this predates the milestone and is not blocking. |
| Static paths | Vite `base` is `/`. The host must rewrite unknown paths to `index.html` (SPA routes such as `/methodology`). |
| API URL | Same-origin `/api` by default, or `VITE_API_BASE_URL` at build time. Add the frontend origin to `CORS_ORIGINS`. |
| Backend config | `MONGODB_URI` (required, never printed), `PORT`, `CORS_ORIGINS`, `NODE_ENV=production`, `GEOCODER_URL`, `GEOCODER_CONTACT`. Unset `SAFEHER_REVIEW_DISTRICT_BOUNDARIES`. |
| Health check | `GET /api/health`. The API starts without MongoDB and returns 503 on data routes until it connects. |
| Error handling | Errors use `{ error: { code, message } }`. 500s return a generic message and log only the message, with no stack trace in responses. |
| Security | Read-only GET routes; CORS allow-list; `x-powered-by` disabled; strict query validation; geocoder rate limit and cache. **Missing:** a general API rate limit and security headers (e.g. via a reverse proxy). Add these before a public launch. |
| Attribution | NCRB source and cell reference on panels; OSM ODbL for the outline; tile credit; boundary credit when published. |
| Data in production DB | Not imported. Needs owner approval ([import readiness](safeher-atlas-import-readiness.md)). |

## 6. Tests and checks (this milestone)

- **Backend:** 156 of 156 tests pass. The district file has 24 tests: 6 are new, and an existing test gained a category-count assertion. Lint is clean.
- **Frontend:** 202 of 202 tests pass (3 new). Lint is clean. The production build succeeds.
- **Browser:** 113 of 113 checks pass in headless Edge at 1440, 1024, 768 and 390 px.
  - **Pass A** (dev server, local review shapes): drawing, hover, selection, year and category changes, missing versus zero, layout, axe and console checks.
  - **Pass C** (new): the production build withholds review shapes.
  - **Pass B:** the public no-boundary table, plus cache headers.
  - **Also checked:** the other pages and the health check.
- **Tiles:** OSM tile requests (262) were deliberately blocked during automated tests, per the tile policy. This is a test setting, not an application failure.

## 7. Decisions for the owner

1. Whether to send the drafted NCRB clarification request, or obtain legal advice, before any public deployment.
2. Whether to send the drafted GSDL permission request.
3. Whether to approve the Atlas import of the district statistics.
4. Which tile provider (and account) to use for a public launch, or whether to self-host.

## Update (10 November 2026, project-completion round)

Superseded items from section 5:

- **Security:** the general API rate limit and security headers are now implemented (helmet, express-rate-limit). The API also gained:
  - 405 for write methods and 413 for request bodies;
  - CORS origin validation (no wildcard; https in production);
  - masked error logs, request timeouts, and `no-store` on errors.
- **Bundle:** pages other than the map are lazy-loaded. The main chunk is now 367 kB (116 kB gzip), and the size warning is gone.
- **Import tooling:** `:dry-run`, `:verify` and duplicate detection were added ([import readiness](safeher-atlas-import-readiness.md)).
- **Rights:** the Delhi-wide figures fall under the same NCRB condition ([rights matrix](safeher-publication-rights-matrix.md)).

**Current deployment guide:** [../deployment.md](../deployment.md).
