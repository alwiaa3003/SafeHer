# SafeHer

SafeHer is a BTech final-year research project and web application about officially registered crimes against women in Delhi. It presents verified National Crime Records Bureau (NCRB) figures with the source and checking status of each one, and states plainly what the data cannot show.

SafeHer does not calculate safety or risk scores, does not map crime below Delhi level, and does not describe any place as safe or unsafe.

## Scope and limitations

- Figures are **registered cases** for **Delhi UT as a whole**. They do not measure how often crime occurs, and they are not individual probabilities.
- **2019 is missing** because its source has not been obtained. It is shown as a gap, never estimated or zero.
- The eight annual totals are `verified_with_note`. The **TOT-4 comparison remains pending for all eight**.
- **Table 3A.2** category data is research-only and is not in production.
- Delhi UT and Delhi City are separate reporting units and are never combined.
- Delhi-wide totals are never divided among districts, wards, police stations or streets.

See [the data specification](docs/research/safeher-data-specification.md) and [the open research issues](docs/research/open-research-issues.md).

## Implemented features

| Area | Status |
|---|---|
| Overview: annual trend with a real 2019 gap, source table, status per record | Implemented, served by the API |
| Geographic Explorer: one contextual Delhi outline, no crime values | Implemented |
| Methodology | Implemented |
| Read-only REST API | Implemented |
| Crime Trends, Crime Categories, Metro Comparison, Data Sources pages | Placeholders, not built yet |
| District maps, hotspots, incident mapping, deployment, accounts | Not implemented |

## Architecture and stack

```
React frontend  →  Express REST API  →  MongoDB Atlas
(charts, map)      (read-only GET)      (figures, sources, validation, boundary)
```

- **Frontend:** React 19, Vite, React Router, Chart.js, Leaflet with react-leaflet, CSS Modules
- **Backend:** Node.js, Express 5, Mongoose, Zod
- **Database:** MongoDB Atlas, using GeoJSON and a `2dsphere` index for the boundary
- **Tests:** Vitest, Testing Library, axe-core, Supertest, mongodb-memory-server

## Repository structure

```
backend/
  data/geography/   Verified OpenStreetMap boundary snapshot
  scripts/          Boundary refresh, in-memory dev server, metadata migration
  src/              App, config, models, controllers, routes, validators, seed
  tests/
frontend/
  src/app/          Routes and navigation
  src/charts/       Chart components
  src/components/   Shared interface components
  src/data/         API client, status labels, approved NCRB metadata
  src/features/     Overview and geography features
  src/layout/       Page layout
  src/pages/        Route pages
docs/
  architecture/     Design notes
  research/         Specification, open issues, geospatial assessment
```

NCRB PDFs (`docs/source-reports/`) and the Table 3A.2 review files (`docs/research/table-3a2-review/`) are kept local and excluded from Git.

## Prerequisites

- Node.js 20.19 or newer, and npm
- A MongoDB Atlas cluster, or the temporary in-memory option below

## Backend setup

```
cd backend
npm install
```

**Option A, temporary in-memory database.** No configuration is needed, and data is discarded when stopped. The first run downloads a MongoDB binary of about 780 MB.

```
npm run dev:memory
```

**Option B, MongoDB Atlas.** Configure the environment as described below, then:

```
npm run seed
npm run geo:import
npm run dev
```

The API runs at `http://localhost:4000`.

## Frontend setup

```
cd frontend
npm install
npm run dev
```

The site runs at `http://localhost:5173` and forwards `/api` to port 4000.

## Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your own values. `.env` is ignored by Git. Never commit real credentials.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Connection string: `mongodb+srv://<username>:<password>@<cluster-host>/<database>` |
| `PORT` | API port, default 4000 |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `NODE_ENV` | `development` or `production` |

## MongoDB Atlas configuration

1. Create a cluster and a database user with access only to the SafeHer database.
2. Add your current IP address under Network Access.
3. Copy the driver connection string into `MONGODB_URI` in `backend/.env`, and name the database.

## Seeding approved data

`npm run seed` imports only records marked `verified` or `verified_with_note` from `frontend/src/data/ncrbDelhiUt.js`. It adds missing documents and never overwrites, drops or deletes. A difference from approved data is reported and left unchanged. Table 3A.2 is not imported.

## Importing the boundary

`npm run geo:import` adds the OpenStreetMap outline from `backend/data/geography/delhi-boundary.geojson` and is safe to re-run. See [the boundary source notes](docs/research/geographic-explorer-source.md) before refreshing it.

## Tests, lint and build

```
cd backend
npm test
npm run lint

cd ../frontend
npm test
npm run lint
npm run build
```

Backend tests use an isolated in-memory MongoDB and never read `MONGODB_URI`. Frontend tests mock the API, map and chart.

## API overview

All routes are `GET` and return JSON.

| Route | Purpose |
|---|---|
| `/api/health` | API and database status |
| `/api/crimes` | Annual records with provenance |
| `/api/crimes/summary` | Availability summary for one reporting unit |
| `/api/crimes/trends` | Year-by-year series including gaps |
| `/api/crimes/categories` | Original NCRB labels, publication year and reporting period |
| `/api/data-sources` | Sources, classified by `sourceType` |
| `/api/validation` | Validation checks and results |
| `/api/geography` | Boundary list |
| `/api/geography/:id` | One boundary with geometry |

Query parameters are listed in [backend/README.md](backend/README.md).

## Data provenance and attribution

- **Crime figures:** National Crime Records Bureau, *Crime in India*, Table 3A.1 (2018, 2022 and 2024 editions). No explicit NCRB reuse licence has been found, so source PDFs are not redistributed here.
- **Boundary:** © OpenStreetMap contributors, relation 1942586, under the Open Database License (ODbL) 1.0. It is contextual only and has not been shown to match NCRB reporting units.
- **Map tiles:** OpenStreetMap, subject to its tile usage policy.

## Important research limitations

- NCRB counts registered cases and applies the Principal Offence Rule. Under-reporting is unknown.
- NCRB cautions that more registered crime does not indicate a place is comparatively unsafe.
- 2020 was a COVID-19 year, and new criminal laws took effect in July 2024.
- Delhi UT and Delhi City totals are identical for 2024, and this is unexplained.
- IPC and BNS categories are not assumed to be comparable.
- Official NCRB district data has not been retrieved and validated, and permission to use GSDL boundaries has not been established.

## Development status

Active academic project. The Overview, Geographic Explorer, Methodology page and read-only API are working. The remaining pages await validated data. SafeHer is not deployed publicly and does not yet have the hardening a public service needs, such as rate limiting.
