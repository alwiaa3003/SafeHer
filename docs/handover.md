# SafeHer: project handover

- **Prepared:** 10 November 2026
- **For:** the project owner, supervisor and examiners, and anyone continuing the work.
- **Purpose:** this document explains what SafeHer is, how it is built, why the main technical decisions were made, how it was tested, and what remains blocked on decisions outside the code.

## 1. What SafeHer is

A Delhi-focused crime-information website for crimes against women.

**On the homepage:**
- a full-screen map with search at the top;
- the visitor can search for a place or select a point;
- the visitor can explore NCRB police-district figures by year (2020–2022) and category (2022);
- every figure states its measure, year, reporting unit, source and limits.

**Other pages:**
- **Crime Trends:** the Delhi-wide series, 2016–2024.
- **Data & Sources** and **Methodology:** explain provenance, validation and licensing.

The project's central design constraint is honesty about precision. NCRB publishes registered-case counts for Delhi as a whole and for 23 police units. SafeHer shows those figures at exactly that precision:
- no point is invented;
- no total is spread over streets;
- no place is scored or labelled safe or unsafe.

## 2. System overview

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19, Vite 8, React Router 7, Leaflet/react-leaflet, Chart.js, CSS Modules | Map page eager; other pages lazy-loaded (main bundle 367 kB / 116 kB gzip) |
| API | Express 5, Zod 4, helmet, express-rate-limit | 14 read-only GET routes; strict query validation |
| Data access | Mongoose 9 | Insert-only seed and import commands; unique indexes on natural keys |
| Database | MongoDB (Atlas in production) | 6 collections; 2dsphere indexes for boundaries |
| Geocoding | Nominatim, through the API proxy | One request at a time, at least 1.1 s apart; 24 h cache; Delhi-bounded; submit-only |
| Tiles | OSM by default; any raster provider via `VITE_TILE_*` | Attribution always visible |
| Data pipeline | Python (standard library) in `docs/research/ncrb-research-pipeline/` | Reads official NCRB files; checks formulas and reconciliation; byte-reproducible output |

Key paths:

| What | Where |
|---|---|
| Crime Map page | `frontend/src/pages/GeographicExplorerPage.jsx` |
| District features | `frontend/src/features/districts/` |
| District API | `backend/src/controllers/policeDistrictsController.js` |
| Security middleware | `backend/src/middleware/security.js` |
| District import | `backend/src/seed/importPoliceDistricts.js`, with the command in `policeDistricts.js` |
| Boundary importers | `backend/src/seed/importPoliceDistrictBoundaries.js` |

## 3. Technical decisions and why

1. **Registered cases only, at their printed precision.** NCRB's figures are counts of FIRs registered, by reporting unit. Anything finer, such as hotspots or street-level markers, would be fabricated.
   - The incident-marker gate (`features/map/incidents.js`) exists but admits nothing. It requires verified coordinates, classified precision, a source, and an approved publication and privacy review, and it rejects personal fields.
2. **Missing is not zero.**
   - Gaps live in `coverageRecords`, which has no numeric field.
   - District category-years that were not validated are absent from the data, and the map renders them grey as "Not available".
   - A printed 0 has its own lightest fill.
3. **Join by code, never by name.**
   - District figures carry `reportingUnitCode` and boundaries carry `unitCode`.
   - Boundary importers match the 16 names exactly (after hyphen and space normalisation) and reject unknown, duplicate or missing districts.
   - The 7 non-geographic units have no boundary code and can never be drawn.
4. **Insert-only imports.** Seeding never updates or deletes. A difference from approved data is reported as a conflict, and the command exits with an error. Data corrections go through the pipeline, never through manual database edits.
5. **Defence in depth for unlicensed geometry.** The GSDL layer is "All Rights Reserved". There are six independent layers:
   1. the configuration check;
   2. the app factory;
   3. the review importer refusing production;
   4. the public query filter, which requires a verified, licensed unit and excludes GSDL without recorded permission;
   5. a second per-document check;
   6. the production frontend build discarding any non-published collection.

   Tests cover a GSDL unit wrongly marked verified.
6. **The table is the public district view.** Without a licensed boundary, the district figures are still useful and honest as a table. The map explains why no shapes are drawn.
7. **Colour scale.**
   - One hue, light terracotta to dark red, in quantile classes for the selected year and category.
   - A darker shade means more registered cases, and the key says this is not higher risk.
   - There are no rankings; the table is alphabetical.
8. **Security proportional to a read-only public API:**
   - helmet headers (CSP `default-src 'none'`, HSTS, nosniff, no referrer);
   - an exact-origin CORS allow-list, with https only in production;
   - per-client rate limits, tighter for place search;
   - 405 for write methods and 413 for request bodies;
   - Zod strict queries, with Express 5's simple query parser preventing `$`-operator objects;
   - generic 500s, masked connection strings in logs, and request timeouts.
9. **Caching:**
   - public data: `public, max-age=300` (district data `3600`);
   - errors, health, place search and review responses: `no-store`.
10. **One API instance.** The Nominatim rate limit and cache live in the process, which keeps SafeHer within Nominatim's limit of one request per second.

## 4. Data, validation and rights

**Validated data** ([checklist](research/ncrb-publication-data-checklist.md)):
- Delhi UT totals 2016–2024.
- Police-district totals 2020–2022:
  - the 23 units reconcile exactly to 10,093 / 14,277 / 14,247;
  - 2022 categories match Table 3A.2 on all 52 columns, and formula checks show 0 failures.
- Rebuilding the dataset is byte-identical, and the research-pipeline checks pass.

**Known, documented exceptions:**
- 2014–2016 district data uses 12 districts and does not reconcile (not used).
- The Kidnapping section label differs (336 vs 363) (category excluded, OR-06).
- 2024 Delhi UT equals Delhi City (unexplained).
- TOT-4 is pending for the annual totals.

**Rights** ([matrix](research/safeher-publication-rights-matrix.md)):
- NCRB's copyright statement asks for prior permission before reproduction. This applies to **all** displayed NCRB figures, including the Delhi-wide ones.
- GSDL boundaries are "All Rights Reserved".
- OSM data is ODbL with attribution.
- None of the NCRB figures is cleared for public publication.

## 5. Testing

| Suite | Result (10 November 2026) |
|---|---|
| Backend (Vitest, Supertest, in-memory MongoDB) | 174 tests, 11 files: all pass |
| Frontend (Vitest, Testing Library, axe-core) | 202 tests, 12 files: all pass |
| Lint | Both packages clean |
| Production build | Succeeds, no size warning |
| Import validation | `npm run import:police-districts:check` passes |
| Browser (headless Edge over DevTools protocol, scripts outside the repository) | See the final completion report |

**Browser-check limitations:**
- OSM tile requests are deliberately blocked, to respect the tile policy, so map backgrounds are blank in automated runs.
- One real Nominatim search is made per run.
- The scripts start their own in-memory API (no Atlas) and a production build. They live in the session's scratch area because they hard-code local paths, the Edge location and the Git-ignored GSDL review file.

## 6. Decision gates (owner only)

| Gate | Decision | If not approved | Recommendation |
|---|---|---|---|
| A. NCRB permission | Send the [request](research/permission-requests/ncrb-data-reuse-clarification.md), or get legal advice | No public deployment of any NCRB figure; local and supervised demonstrations remain fine | Send the request through the supervisor or institution |
| B. GSDL permission | Send the [request](research/permission-requests/gsdl-boundary-permission-request.md) | The public map keeps the district table; shapes only in local review | Send it; the licensed importer is ready |
| C. Atlas import | Approve `--dry-run`, `--approved`, then `--verify` | District figures exist only in development databases | Approve the dry run first; import after Gate A |
| D. Tile provider | Choose and create an account (e.g. CARTO or Stadia, non-commercial) | OSM public tiles: development and low traffic only | CARTO light raster or Stadia, domain-restricted key |
| E. Hosting | Choose a static host and a Node host; deploy | Not deployed | Split static and API hosting ([deployment guide](deployment.md)), after A |
| F. Git | Review, then commit and push yourself | Changes remain local | Review the diff by area (see the completion report) |

## 7. Continuing the work

- **When GSDL permission or a licensed boundary exists:**
  1. Record the permission in `provenance.licence.permissionReference`.
  2. Call `importLicensedPoliceDistricts` (see the [backend README](../backend/README.md)).
  3. The map draws the districts and credits the licence in the key.
- **New validated district years or categories:**
  1. Extend `build_district_map_dataset.py`, which stops on any mismatch.
  2. Rebuild, then run `--check`, `--dry-run` and the import.
- **Never:** invent coordinates, split totals, combine IPC and BNS without a documented crosswalk, or add a risk score.
