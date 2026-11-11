# SafeHer

SafeHer is a BTech CSE final-year project: a Delhi-focused website about officially registered crimes against women. It opens on a full-screen interactive map of Delhi.

**What it shows:**
- National Crime Records Bureau (NCRB) figures, each with its source, year, reporting unit and checking status;
- what the data cannot show.

**What it never does:**
- calculate safety or risk scores, or label any place safe or unsafe;
- plot invented incidents;
- divide totals among streets or wards.

> **Status:** a working local application with a read-only API, not deployed publicly. Public deployment waits on decisions only the project owner can make: NCRB reuse permission, police-district boundary permission, the database import, a tile provider and hosting. See [docs/deployment.md](docs/deployment.md) and [docs/handover.md](docs/handover.md).

## Contents

1. [Problem and objectives](#problem-and-objectives)
2. [Features](#features)
3. [Data and precision](#data-and-precision)
4. [Architecture](#architecture)
5. [Repository structure](#repository-structure)
6. [Getting started](#getting-started)
7. [Environment variables](#environment-variables)
8. [Testing](#testing)
9. [API](#api)
10. [Database](#database)
11. [Licensing and publication restrictions](#licensing-and-publication-restrictions)
12. [Limitations and known issues](#limitations-and-known-issues)
13. [Future scope](#future-scope)
14. [Further documentation](#further-documentation)

## Problem and objectives

Public discussion of crimes against women in Delhi often uses figures without their source, their unit or their caveats. Maps of "unsafe areas" are common, but they are usually built on data that cannot support them.

SafeHer's objectives:
1. Present verified NCRB figures for Delhi with provenance on every number.
2. Make geographic precision explicit: Delhi as a whole, or a police district, never a street.
3. Distinguish missing data from a printed zero, and registered cases from actual prevalence.
4. Offer an interactive map without fabricated markers, heatmaps or risk scores.
5. Document every source, licence and limitation so the work can be checked.

## Features

| Area | What it does | Status |
|---|---|---|
| **Crime Map** (homepage) | Full-screen OpenStreetMap map with location search at the top (submit only, no autocomplete) and a location panel after selection. Police-district figures: year (2020–2022) and category controls, a district panel with figure, comparison, source and limits, a key, and a table. The sidebar hides by default. | Working. District shapes are **not** drawn publicly, because no licensed boundary exists; the district table is the public view. |
| **Crime Trends** | Delhi UT annual totals 2016–2024: range filters, summary, year-to-year change, sources | Working |
| **Data & Sources** | Source catalogue, validation records and licensing | Working |
| **Methodology** | Measures, precision, missing data, colours, notices and rights | Working |
| Overview, Crime Categories, Metro Comparison | Secondary pages, reachable by URL | Working; category and metro figures not approved |
| Read-only REST API | 14 GET endpoints with validation, rate limits and security headers | Working |
| Not built, by design | Incident markers, heatmaps, community reports, offender data, accounts | — |

## Data and precision

| Dataset | Years | Precision | Source |
|---|---|---|---|
| Total crime against women (registered cases) | 2016–2024 | Delhi UT as a whole | NCRB *Crime in India* Table 3A.1; 2019 from NCRB's 2014–2019 spreadsheet |
| Total crime against women by police unit | 2020–2022 | 16 police districts + 7 non-geographic units | NCRB *District-wise Crime against Women* |
| 20 headline categories by police unit | 2022 only | Same | Same; each matched against Table 3A.2 |

**Rules applied everywhere:**
- **Registered cases are not prevalence.** They are not victims and not proven offences. NCRB applies the Principal Offence Rule.
- **Missing is never zero.** A year or category without a validated figure is "Not available"; a printed zero is shown as 0.
- **Non-geographic units are never mapped.** Crime Branch, EOW, Metro, RAILWAY, SPUWAC, Special Cell and Vigilance appear only in the table.
- **No combining:** Delhi UT and Delhi City are never combined, and IPC and BNS categories are not merged.
- **Reconciliation:** for each year 2020–2022, the 23 police units sum exactly to Delhi's total (10,093; 14,277; 14,247).

**Data pipeline:**
- The official NCRB files are read by Python scripts in [docs/research/ncrb-research-pipeline/](docs/research/ncrb-research-pipeline/README.md).
- The scripts check formulas and reconciliation, and write `backend/data/ncrb/delhi-police-district-caw.json`. The build is byte-reproducible.
- Delhi-wide totals live in `frontend/src/data/ncrbDelhiUt.js`.
- Seed and import scripts load both into MongoDB, inserting missing documents only.

Details: [data specification](docs/research/safeher-data-specification.md), [data checklist](docs/research/ncrb-publication-data-checklist.md), [data quality report](docs/research/safeher-data-quality-report.md).

## Architecture

```
Browser (React 19 + Vite, Leaflet)
   │  GET /api/*  (same origin, or VITE_API_BASE_URL)
   ▼
Express 5 API  ── helmet, CORS allow-list, rate limits, zod validation, read-only
   │                    └── /api/places/* → Nominatim (1 req/1.1 s, 24 h cache)
   ▼
MongoDB (Atlas in production; in-memory for development and tests), via Mongoose 9
```

- **Frontend:** React 19, Vite 8, React Router 7, Chart.js, Leaflet and react-leaflet, CSS Modules with design tokens, DM Sans and Source Sans 3. Pages other than the map are lazy-loaded.
- **Backend:** Node.js 20.19+, Express 5, Mongoose 9, Zod 4, helmet, express-rate-limit.
- **Database:** MongoDB, with GeoJSON and 2dsphere indexes for boundaries.
- **Tests:** Vitest, Testing Library, axe-core, Supertest, mongodb-memory-server.

Design notes: [docs/architecture/](docs/architecture/).

## Repository structure

```
backend/
  data/ncrb/          Printed NCRB police-district values (generated, reproducible)
  data/geography/     Verified OpenStreetMap Delhi outline (ODbL)
  scripts/            In-memory dev server, boundary refresh, metadata migration
  src/config/         Environment validation, database connection
  src/controllers/    Route handlers and serializers
  src/middleware/     Errors, validation, caching, security (headers, rate limits)
  src/models/         Mongoose schemas and constants
  src/routes/         API routes
  src/seed/           Seed and import commands (insert-only)
  src/validators/     Zod query schemas
  tests/              API, security, import and schema tests
frontend/
  src/app/            Routes and navigation
  src/features/       Map, districts, geography, trends, overview
  src/pages/          Route pages and page tests
  src/layout/         App shell, sidebar, page header
  src/data/           API client and approved Delhi-wide NCRB metadata
docs/
  deployment.md       Deployment architecture, procedure, rollback, checks
  handover.md         Project handover: system, decisions, open gates
  architecture/       Design notes
  research/           Sources, validation, licensing, open issues, permission drafts
```

`docs/source-reports/` (NCRB files, the GSDL review copy) and `docs/research/table-3a2-review/` stay local and are Git-ignored.

## Getting started

**Prerequisites:** Node.js 20.19 or newer, and npm. MongoDB is optional for local work.

```bash
# API with a temporary in-memory database (imports all approved data automatically)
cd backend
npm install
npm run dev:memory          # http://localhost:4000 (first run downloads a ~780 MB MongoDB binary)

# Website, in a second terminal
cd frontend
npm install
npm run dev                 # http://localhost:5173, forwards /api to port 4000
```

With your own MongoDB, copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI`, then run:

```bash
npm run seed              # Delhi-wide totals
npm run geo:import        # Delhi outline
npm run import:police-districts:check      # validate district data, no database contact
node src/seed/policeDistricts.js --approved   # only with the owner's approval (see below)
npm run dev
```

**Local review of district shapes:** set `SAFEHER_REVIEW_DISTRICT_BOUNDARIES` to the Git-ignored GSDL copy before `npm run dev:memory`. This draws the shapes locally with a "not licensed" label. It is refused in production, and a production frontend build never draws review shapes.

## Environment variables

**Backend** (`backend/.env`; never commit it):

| Variable | Default | Purpose |
|---|---|---|
| `MONGODB_URI` | required | MongoDB connection string. Never printed |
| `PORT` | 4000 | API port |
| `NODE_ENV` | development | `production` enables the production checks |
| `CORS_ORIGINS` | localhost dev ports | Exact frontend origins, comma-separated. No `*`; https only in production |
| `TRUST_PROXY` | 0 | Reverse-proxy hops in front of the API (often 1 on a host), so rate limits see client IPs |
| `RATE_LIMIT_API` | 600 | Requests per client per 15 minutes, all routes except health |
| `RATE_LIMIT_PLACES` | 20 | Place searches per client per minute |
| `GEOCODER_URL` | Nominatim | Geocoder base URL (switchable, as Nominatim's policy requires) |
| `GEOCODER_CONTACT` | unset | Contact URL or email added to the geocoder User-Agent. Set this for any public deployment |
| `SAFEHER_REVIEW_DISTRICT_BOUNDARIES` | unset | Development only. The server refuses to start in production if it is set |

**Frontend**, at build time (`frontend/.env.example`). These are public by nature: never put secrets or database credentials here.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | empty (same origin) | API origin when it is not served under the site's `/api` |
| `VITE_TILE_URL` | OSM public tiles | Tile URL template for a production provider or self-hosted tiles |
| `VITE_TILE_ATTRIBUTION` | OSM credit | Required with a custom provider |
| `VITE_TILE_MAX_ZOOM` | 19 | Provider's maximum zoom |

## Testing

```bash
cd backend  && npm test && npm run lint
cd frontend && npm test && npm run lint && npm run build
cd backend  && npm run import:police-districts:check
```

- **Backend tests** use an isolated in-memory MongoDB and never read `MONGODB_URI`. They cover the API, validation, security headers, rate limits, database-down behaviour, boundary licensing, the import tools and data reconciliation.
- **Frontend tests** mock the API, map and chart. They include axe accessibility checks.
- **Browser checks:** the scripts used in development are described in [docs/handover.md](docs/handover.md#testing).

## API

All routes are `GET`, return JSON, and reject unknown query parameters (400). Other methods get 405, and request bodies get 413.

| Route | Purpose |
|---|---|
| `/api/health` | API and database status (never rate-limited, never cached) |
| `/api/crimes`, `/summary`, `/trends` | Delhi-wide annual records, availability and series with gaps |
| `/api/crimes/categories` | Original NCRB labels |
| `/api/data-sources`, `/api/validation` | Sources and validation results |
| `/api/geography`, `/api/geography/:id` | Verified boundaries (the Delhi outline) |
| `/api/places/search`, `/api/places/reverse` | Delhi-bounded place search through the rate-limited Nominatim proxy |
| `/api/police-districts/meta`, `/statistics`, `/boundaries` | District years, categories, units, sources; printed values; licensed boundaries only |

- **Query parameters:** see [backend/README.md](backend/README.md#api).
- **Errors:** always `{ "error": { "code", "message", "details?" } }`, with no stack traces. 503 while the database is unavailable; 429 when a rate limit is reached.

## Database

| Collection | Holds |
|---|---|
| `dataSources` | One document per publication edition and table, with file hashes |
| `crimeCategories` | Original NCRB labels per publication |
| `crimeRecords` | Printed annual counts, with source reference, validation status and checks |
| `coverageRecords` | Known gaps, with no numeric field so a gap can never read as zero |
| `validationRecords` | Every check and its result |
| `geographicalUnits` | Verified boundaries; never crime values |

- **Duplicates:** unique indexes on every natural key prevent them.
- **Imports:** insert missing documents only, never update or delete, and report conflicts.
- **District import:** [readiness and rollback](docs/research/safeher-atlas-import-readiness.md).

## Licensing and publication restrictions

| Material | Status |
|---|---|
| NCRB figures (Delhi-wide and district) | **Permission required.** NCRB's copyright statement asks for prior permission to reproduce its material. No open licence covers these files. Not cleared for public publication |
| Police-district boundaries (GSDL) | **Permission required.** "All Rights Reserved"; used only in local review mode |
| OpenStreetMap outline and Nominatim results | ODbL 1.0 with attribution "© OpenStreetMap contributors" |
| OSM map tiles | Usage policy: best-effort, no SLA. A public launch needs a provider decision |

Full matrix: [docs/research/safeher-publication-rights-matrix.md](docs/research/safeher-publication-rights-matrix.md).

**Draft permission requests (unsent):** [docs/research/permission-requests/](docs/research/permission-requests/).

## Limitations and known issues

- **What registered cases measure:** NCRB counts registered cases under the Principal Offence Rule, and under-reporting is unknown. More registered cases do not mean a place is less safe.
- **Pre-2020 district data:** district figures exist for 2020–2022 only. 2014–2016 used a 12-district system and does not reconcile.
- **District categories:** for 2020–2021, only the total is validated.
- **Discontinuities:** 2020 was a COVID-19 year, and new criminal laws (BNS) took effect in July 2024.
- **Unexplained totals:** Delhi UT and Delhi City totals are identical for 2024. The TOT-4 cross-check is pending for all nine annual totals.
- **District shapes:** not drawn publicly (no licensed boundary). Place search cannot name the containing police district without one.
- **Dev tooling:** four moderate npm audit findings remain in the ESLint toolchain. Runtime dependencies have none.

All open questions: [docs/research/open-research-issues.md](docs/research/open-research-issues.md).

## Future scope

- Draw the 16 police districts once GSDL permission or an openly licensed boundary exists (the importer is ready).
- Add district figures for further years and categories as they are validated against state tables.
- Add police-station-level or incident-level data only from a licensed, privacy-reviewed source. The incident gate in `features/map/incidents.js` already defines the checks.
- Host tiles on a provider whose terms cover the traffic, or self-host them.

## Further documentation

- [docs/handover.md](docs/handover.md): project handover and technical decisions.
- [docs/deployment.md](docs/deployment.md): hosting architecture, deployment, rollback and checks.
- [backend/README.md](backend/README.md): API parameters, import behaviour, production safeguards.
- [docs/research/](docs/research/): sources, validation, licensing, boundary search, open issues.
