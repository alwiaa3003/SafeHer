# District Boundary Compatibility

10 November 2026. Reproduce with `ncrb-research-pipeline/validate_district_boundaries.py`.

Data (local): `data/district-boundary-validation.csv` and `data/district-boundary-summary.json`. The GSDL responses are stored for validation only in the Git-ignored `docs/source-reports/retrieved-2026-11-10/gsdl-police-districts/`. They are not redistributed.

## Conclusion

**GSDL's Delhi Police district layer is technically compatible with NCRB's 16 geographic units for 2020–2022, but it is not approved for use.**
- GSDL publishes no open licence, and its website states "© All Rights Reserved".
- The layer has no date.

No openly licensed alternative with the 16 police districts was found.

## GSDL `DP_DISTRICT_BOUNDARY`

| Check | Result |
|---|---|
| Source | `https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/0`, public ArcGIS REST, read-only queries |
| Native CRS | EPSG:32643, requested as EPSG:4326 |
| Fields | FID, Shape, DISTRICT, RANGE, AREA__SQKM; no date field |
| Metadata | Service and layer description, copyright text and document info are all empty |
| Polygons | 16 single-part polygons, all rings closed |
| Unit type | Police districts, grouped into police ranges; not revenue districts or wards |
| Area | Sum 1,487.9 km², against 1,487.3 km² for the verified OSM outline; each district within 0.7% of its printed area |
| Coverage, 0.01° grid | 1,368 of 1,372 points inside the OSM outline fall in exactly one district; 4 in none, 0 in two, 11 just outside the outline |
| Placement | Every vertex centroid lies inside the OSM Delhi outline |
| Names | All 16 match NCRB 2020–2022 geographic units after normalisation, with IGI Airport = AIRPORT |
| Licence | None stated on the layer; the website footer reads "© All Rights Reserved by GeoSpatial Delhi Limited" |
| Disclaimer | GSDL "shall not be held liable for improper or incorrect use of the data" |
| Boundary date | Not stated |

The full per-district results are in `district-boundary-validation.csv`.

### How units were related

1. Normalised name matching (lower case, punctuation removed, IGI Airport = AIRPORT) paired all 16 units one to one.
2. Each polygon's area, its position inside Delhi and the full coverage of Delhi were then checked, so the join does not rest on names alone.

Neither step proves that GSDL's polygons are the jurisdictions NCRB used in a given year. That needs a dated boundary or Delhi Police confirmation.

## Alternatives

| Candidate | Finding |
|---|---|
| OSM relation 1942586 | Delhi outline only; no police districts |
| OSM level-5 areas | Revenue districts (prior research); not police units |
| OSM police features | Stations, not jurisdictions (prior research) |
| GSDL revenue and ward layers | Different unit systems |
| DataMeet Delhi boundaries | Wards and outline, scraped origin (prior research) |
| OpenCity "Delhi Police Jurisdictions Map" | Resource URL returned 404; its "public domain" label would not establish upstream rights |
| DataMeet discussion of GSDL layer | Points to the same GSDL service, with age and licence unknown |

## What would resolve it

1. Written permission from GSDL to display the layer in a public academic application, with attribution terms.
2. GSDL or Delhi Police confirmation of the boundary date, and that it represents the 16 districts in force during 2020–2022.
3. Then a stored, hashed snapshot, imported as a separate geography version with `contextOnly: false` only for that approved use.
