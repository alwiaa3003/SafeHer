# District Map Production Recommendations

10 November 2026. The full decision table (5,518 rows: year × reporting unit × measure × category) is in local `data/district-map-production-recommendations.csv`, built by `build_district_decisions.py`. No row is `APPROVED_FOR_PRODUCTION`.

## Eligibility

| Requirement | Overall counts, 2020–2022 | Categories, 2022 | Categories, 2020–2021 |
|---|---|---|---|
| 1. Official source verified | Yes | Yes | Yes |
| 2. Values extracted accurately | Yes | Yes | Yes |
| 3. Unit is geographic | 16 of 23 | 16 of 23 | 16 of 23 |
| 4. Unit matches an approved boundary | **No:** compatible but not approved | **No** | **No** |
| 5. Arithmetic and validation pass | Yes, exact | Yes; 52 of 52 match Table 3A.2 | Internal checks only |
| 6. Reuse permission adequate | **No:** GSDL rights reserved; NCRB terms not established | **No** | **No** |
| 7. Provenance retained | Yes | Yes | Yes |
| Category linkage and definitions | — | Linkage yes; comparability not assessed | Not checked against a state table |

## Decisions

| Scope | Decision | Rows |
|---|---|---:|
| 2020–2022, 16 geographic units, total | RESEARCH_ONLY | 48 |
| 2022, 16 geographic units, 52 categories | RESEARCH_ONLY | 816 |
| 2020–2021, 16 geographic units, 52 categories | CANDIDATE_UNVERIFIED | 1,632 |
| Any year, 7 non-geographic units | REJECTED for the map | — |
| 2014–2016, all units | REJECTED for the map: 12-district system with no matching boundary; 2014 and 2015 do not reconcile | — |
| 2017–2019, 2023–2024 | NOT_AVAILABLE | 5 |
| Victims by district | NOT_AVAILABLE | 6 |

## Feature readiness

| Feature | Status |
|---|---|
| A. District choropleth of overall counts | Blocked by boundary permission and date |
| B. Year selector | Would offer 2020–2022 only |
| C, D. District click and details panel | Blocked with A |
| E, F. Category selector and choropleth | Blocked by A, and by category comparability |
| G. Clear unavailable state | Can be built now, with no figures |
| H. Source and caveats | Can be built now |

Per the milestone rules, implementation stops here. The data side is ready; the boundary and reuse sides are not.

## Smallest reliable architecture, once approved

- **No new database technology:** MongoDB Atlas and the existing 2dsphere index are enough for 16 polygons.
- **Boundaries:** add the approved boundary as `geographicalUnits` documents with `geographyType: 'police_district'`, which already exists in `GEOGRAPHY_TYPES`, plus an approved boundary source.
- **Crime records:** add district `crimeRecords` with `reportingUnitType: 'police_district'`. This needs a one-value enum extension, which must be approved first. Non-geographic units would be stored as `police_unit_non_geographic` and never joined to polygons.
- **Categories:** each category value becomes its own record, with its printed label, and `crimeCategories` labels stay per source.
- **API:** `/api/geography?geographyType=police_district` plus `/api/crimes?reportingUnitType=police_district&year=`, joined in the client by a stored unit identifier, never by name at runtime.
- **Map:** react-leaflet `GeoJSON` with a neutral single-hue sequential scale, a legend of registered counts, and no red ramp or safety wording.

## Addendum: implementation (10 November 2026)

The map is now built, following the architecture above. The decisions table is unchanged. Nothing was written to Atlas.

**Data**
- 2020–2022 overall counts for the 16 geographic units, plus 2022 headline categories (20, with no age sub-columns and no Kidnapping & Abduction group while OR-06 is open).
- Values are copied from the official files into `backend/data/ncrb/delhi-police-district-caw.json` by `ncrb-research-pipeline/build_district_map_dataset.py`.
- The 7 non-geographic units are stored as `police_unit_non_geographic` and never joined to polygons.
- The 2020–2021 category columns (CANDIDATE_UNVERIFIED) are not exported.

**API**
- `/api/police-districts/meta`
- `/api/police-districts/statistics`
- `/api/police-districts/boundaries`

The join uses stored unit codes.

**Map**
- Police-district choropleth, year and category controls, district panel, key and table view.
- Missing figures are grey and labelled as not zero.

**Still blocked for publication**
- Requirement 4 (approved boundary) and requirement 6 (reuse permission).
- The boundary endpoint serves no geometry, so the public map shows the figures as a table. GSDL polygons are used only in a local review mode, labelled on screen, from the Git-ignored copy.
- Importing the district records into Atlas needs the owner's approval (`npm run import:police-districts -- --approved`).

## Production-readiness addendum (10 November 2026)

This milestone found:

- **No licensed boundary:** a targeted search covered government portals, Census/ECI, OSM, academic repositories, GitHub, Zenodo, Figshare and Mendeley. See [public-police-boundary-source-assessment.md](public-police-boundary-source-assessment.md).
- **NCRB permission needed:** NCRB's copyright statement asks for prior permission to reproduce its material. See [ncrb-publication-rights-assessment.md](ncrb-publication-rights-assessment.md).

Earlier findings above are unchanged.

The implementation now has:
- production guards against review geometry;
- a licensed-layer importer;
- cache headers;
- a configurable tile provider;
- a database-free `--check` for the importer.

Status and owner decisions: [safeher-district-map-production-readiness.md](safeher-district-map-production-readiness.md).
