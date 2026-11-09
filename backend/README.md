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

`coverageRecords` is an addition to the original design. Keeping gaps out of `crimeRecords` lets `registeredCases` always be a real printed number.

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

Errors use `{ "error": { "code", "message", "details" } }`. If the database is unavailable, data routes return 503.
