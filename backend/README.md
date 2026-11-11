# SafeHer backend

Read-only Express and Mongoose API for verified NCRB figures.

## Setup

Node 20.19 or newer is required.

```
cd backend
npm install
```

### Option A: temporary in-memory MongoDB (quickest)

Needs no MongoDB installation. Data is imported automatically and discarded when stopped.

```
npm run dev:memory
```

The first run downloads a MongoDB binary of about 780 MB into your user cache folder.

### Option B: a persistent MongoDB

Install [MongoDB Community Server](https://www.mongodb.com/try/download/community), or create a MongoDB Atlas cluster.

```
copy .env.example .env
```

Set `MONGODB_URI` in `.env`, then:

```
npm run seed
npm run dev
```

`.env` is ignored by Git. Never commit real credentials.

### Start the frontend

```
cd frontend
npm run dev
```

Vite forwards `/api` to `http://localhost:4000`. For a different API address, set `VITE_API_BASE_URL` and add that frontend's origin to `CORS_ORIGINS`.

## Tests and lint

```
npm test
npm run lint
```

Tests use an isolated in-memory MongoDB and never read `MONGODB_URI`.

## Collections

| Collection | Purpose |
|---|---|
| `dataSources` | One entry per publication edition and table |
| `crimeCategories` | Original NCRB labels per publication. Comparability defaults to `not_assessed` |
| `crimeRecords` | Published annual counts. Registered cases and victims are separate fields |
| `coverageRecords` | Known gaps. Has no numeric field, so a gap cannot read as zero |
| `validationRecords` | Each validation check and its result, including pending and failed checks |
| `geographicalUnits` | Verified boundaries for geographic context. Never holds crime values |

`coverageRecords` is an addition to the original design. Keeping gaps out of `crimeRecords` lets `registeredCases` always be a real printed number. A gap later filled by a verified source keeps its document with status `resolved` and the resolving source, and the API no longer reports it as missing.

## Duplicate prevention

| Collection | Unique on |
|---|---|
| `dataSources` | `sourceKey` |
| `crimeCategories` | `originalCategoryName`, `reportingYear`, `legalFramework`, `source` |
| `crimeRecords` | year, unit, unit type, category, legal regime, age group, source |
| `crimeRecords` (where `isCurrent`) | year, unit, unit type, crime category, legal regime, age group |
| `coverageRecords` | dataset, year, unit, unit type |
| `validationRecords` | source, check, year, unit, unit type |
| `geographicalUnits` | name, type, boundary version, source |
| `geographicalUnits` (where `isCurrent`) | name, type |

## Import behaviour

`npm run seed` reads `frontend/src/data/ncrbDelhiUt.js` and imports only records marked `verified` or `verified_with_note`.

The import only adds missing documents. It never updates, drops or deletes. If an existing document differs from approved data, it is left unchanged, the difference is reported, and the command exits with an error.

Table 3A.2 research files are not imported.

## Delhi boundary

`npm run geo:import` adds the verified OpenStreetMap outline from `data/geography/delhi-boundary.geojson`. It is safe to re-run. `dev:memory` imports it automatically.

To refresh the boundary, follow `docs/research/geographic-explorer-source.md`. The design is in `docs/architecture/geographic-explorer.md`.

## Source metadata migration

`npm run migrate:sources` adds `sourceType` to `dataSources` documents created before that field existed. It moves the OSM relation identity from `tableReference` to `boundaryReference`. Nothing else is touched.

It is a dry run by default and writes only with `-- --apply`. The API classifies older documents correctly until the migration is applied, so it can wait for review.

## Category years

`crimeCategories.reportingYear` is a historical field name: it stores the publication year of the source. The API returns it as `publicationYear` and adds the source's `reportingPeriod`. The `reportingYear` query matches any year inside that period.

## Security and request handling

- **Headers:** helmet, with CSP `default-src 'none'; frame-ancestors 'none'`, HSTS, `nosniff`, no referrer, CORP `same-site`. `x-powered-by` is off.
- **CORS:** exact origins from `CORS_ORIGINS`. A wildcard is rejected at startup, and production accepts only https (plus localhost).
- **Rate limits** (per client, standard `RateLimit` headers, JSON 429 `RATE_LIMITED`):
  - all routes except `/api/health`: `RATE_LIMIT_API` per 15 minutes (default 600);
  - `/api/places/*`: `RATE_LIMIT_PLACES` per minute (default 20), on top of the app-wide Nominatim throttle.
  - Set `TRUST_PROXY` to the number of proxies in front of the API so limits see client addresses.
- **Read-only:** other methods get 405 with `Allow: GET, HEAD, OPTIONS`, and a request body gets 413.
- **Input:** Zod strict query schemas. Express 5's simple query parser yields strings only, so `?a[$ne]=` cannot become an operator.
- **Errors:** `{ error: { code, message, details? } }`. Unexpected errors return a generic 500, and the log shows only the message, with connection strings masked. Every error is `no-store`.
- **Caching:** public data `public, max-age=300`, district data `3600`, and health and place search `no-store`.
- **Timeouts:** the server sets `requestTimeout` to 30 s and `headersTimeout` to 20 s.

## API

All routes are `GET` and return JSON. Unknown query parameters return 400.

| Route | Query parameters |
|---|---|
| `/api/health` | none |
| `/api/crimes` | `year`, `fromYear`, `toYear`, `reportingUnit`, `reportingUnitType`, `validationStatus`, `page`, `limit` |
| `/api/crimes/summary` | `reportingUnit` (required), `reportingUnitType`, `fromYear`, `toYear` |
| `/api/crimes/trends` | `reportingUnit` (required), `reportingUnitType`, `fromYear`, `toYear` |
| `/api/crimes/categories` | `reportingYear` (any year the source table covers), `publicationYear`, `legalFramework`, `page`, `limit` |
| `/api/data-sources` | `sourceType` (`crime_statistics` or `geographic_boundary`), `publicationYear`, `tableReference`, `page`, `limit` |
| `/api/validation` | `year`, `reportingUnit`, `result`, `checkName`, `page`, `limit` |
| `/api/geography` | `geographyType`, `page`, `limit` |
| `/api/geography/:id` | none |
| `/api/places/search` | `q` (2–120 characters) |
| `/api/places/reverse` | `lat`, `lon` (within the Delhi region) |
| `/api/police-districts/meta` | none |
| `/api/police-districts/statistics` | `category` (required, a key from `meta`), `year` |
| `/api/police-districts/boundaries` | none (an empty collection until a licensed layer is imported) |

`/api/crimes` and `/api/crimes/categories` return Delhi-wide records and labels (`state_ut`, `metro_city`) unless `reportingUnitType=police_district` (or `police_unit_non_geographic`) is given. The series routes refuse district units: use `/api/police-districts/statistics`.

## Police-district map data

- **Source:** NCRB *District-wise Crime against Women* spreadsheets, 2020–2022.
  - `data/ncrb/delhi-police-district-caw.json` holds the printed values.
  - It is built from the Git-ignored official files by `docs/research/ncrb-research-pipeline/build_district_map_dataset.py`, which stops on any mismatch.
- **Scope:**
  - the overall total for 2020–2022;
  - 20 headline categories for 2022 only.

  For each year, the 23 Delhi units sum exactly to the printed district total and to the Delhi UT total. The 16 geographic districts and the 7 non-geographic units are stored with different `reportingUnitType`s and joined to boundaries by `reportingUnitCode`, never by name.
- **Import:** `importPoliceDistrictStatistics()` inserts missing documents and never changes existing ones.
  - `npm run dev:memory` runs it against the temporary database.
  - `node src/seed/policeDistricts.js <mode>`, with exactly one mode. The npm scripts below work in every shell; in PowerShell, `npm run x -- --flag` drops the flag.

    | Mode | npm script | Database | What it does |
    |---|---|---|---|
    | `--check` | `import:police-districts:check` | none (never reads `MONGODB_URI`) | Validates the dataset and prints the expected record counts |
    | `--dry-run` | `import:police-districts:dry-run` | read-only | Reports what an import would insert, leave unchanged or flag as a conflict. Writes nothing, not even indexes |
    | `--verify` | `import:police-districts:verify` | read-only | Post-import checks: counts, file hashes, statuses, printed values, 16 + 7 units, yearly reconciliation, no duplicates |
    | `--approved` | none, by design: run `node src/seed/policeDistricts.js --approved` | writes (insert-only) | Refuses if duplicate identities already exist; exits 1 on any conflict |

    Any mode that connects to Atlas, even a read-only one, needs the owner's approval first. Readiness: [docs/research/safeher-atlas-import-readiness.md](../docs/research/safeher-atlas-import-readiness.md).
- **Boundaries:** none are published.
  - The only police-district layer found (GSDL) states "All Rights Reserved", so `/api/police-districts/boundaries` returns an empty collection and the map shows a table instead.
  - For local review only, set `SAFEHER_REVIEW_DISTRICT_BOUNDARIES` to the Git-ignored GSDL copy when running `npm run dev:memory`. The units are stored as `unverified` and are served only by an app created with `reviewBoundaries`. The UI labels them as a review copy.
- **Production safeguards:** six independent layers keep review geometry out of a public deployment.
  1. `loadConfig` refuses to start when `NODE_ENV=production` and `SAFEHER_REVIEW_DISTRICT_BOUNDARIES` is set.
  2. `createApp({ reviewBoundaries })` and the review importer both refuse production.
  3. The public filter serves only `verified` units with a licence, and never a GSDL unit unless `provenance.licence.permissionReference` records written permission. This holds even if a unit is wrongly marked verified.
  4. A second check on the returned documents applies the same rule.
  5. A production frontend build discards any boundary collection that is not `published`.
  6. Public district responses send `Cache-Control: public, max-age=3600`; review responses send `no-store`.
- **Licensed boundaries:** `importLicensedPoliceDistricts(file, { provider, sourceUrl, sourceName, boundaryVersion, crs, retrievedAt, licence })` stores a licensed layer as `verified`.
  - It requires every field, matches the 16 districts by exact name (all present, no unknown, no duplicates), and refuses GSDL without `licence.permissionReference`.
  - MongoDB's 2dsphere index rejects invalid rings.
  - It has no command yet, because no licensed layer exists.

## Place search

`/api/places/*` proxies [Nominatim](https://nominatim.org/) and follows its [usage policy](https://operations.osmfoundation.org/policies/nominatim/):
- **Rate limit:** at most one upstream request every 1.1 seconds for the whole app, and a 429 when more than four are waiting.
- **Caching:** results are cached for 24 hours.
- **No autocomplete:** search runs only when a user submits.
- **Identification:** requests send an identifying User-Agent.
- **Switchable:** set `GEOCODER_URL` to change to another provider or a self-hosted instance.
- **Contact:** set `GEOCODER_CONTACT` to add your contact to the User-Agent.

Searches are bounded to Delhi. Responses omit house numbers and postcodes. These routes do not need MongoDB.

Errors use `{ "error": { "code", "message", "details" } }`. If the database is unavailable, data routes return 503.
