# Public police-district boundary source assessment

- **Date:** 10 November 2026
- **Question:** is there a boundary dataset for Delhi's 16 police districts that SafeHer may publish on a public web map?
- **Answer:** no. No candidate meets the acceptance rules. The public map keeps the district-table fallback.

The candidate comparison is in [public-police-boundary-candidate-comparison.csv](public-police-boundary-candidate-comparison.csv).

## Acceptance rules

A source is accepted only if all six hold:

1. Its provenance is traceable to the original publisher.
2. Its licence permits public web-map display.
3. Its licence permits the modification and redistribution SafeHer needs: reprojection, dropping Z/M values, sliver repair, and serving GeoJSON.
4. It represents police districts, not revenue districts, municipal zones, constituencies or wards.
5. Its 16 units match NCRB's 16 geographic reporting units one to one.
6. Its geometry passes validation.

## Previously investigated (not new)

| Source | Finding |
|---|---|
| GSDL ArcGIS `Delhi_Police/MapServer/0` | Complete, matching 16-district layer. GSDL states "© All Rights Reserved by GeoSpatial Delhi Limited" and publishes no licence. Fails rules 2 and 3. Local review only. |
| DataMeet threads and GitHub gists (e.g. Vonter) | Re-scrapes of the GSDL layer. A copy cannot carry more rights than its source. Rejected. |
| OpenCity "Police Jurisdiction Maps for Major Cities" | Rechecked 10 November 2026. The dataset lists only Mumbai, Bengaluru and Hyderabad KML. Delhi's resource is gone, although the description still names Delhi. |
| OpenStreetMap | Rechecked 10 November 2026: Overpass `relation["boundary"="police"]` inside `ISO3166-2=IN-DL` returns 0 elements. OSM holds only the state outline (relation 1942586, ODbL), which is not a police geography. |

## Investigated in this round

| # | Source | Result |
|---|---|---|
| 1 | **india-geodata** (github.com/yashveeeeeeer/india-geodata), "Police Station Jurisdictions" | **New candidate, rejected.** The metadata labels the layer CC0-1.0 with source "State GIS Portals via Bharatmaps". Its README credits the Delhi layer to "Geospatial Delhi Limited". A third party cannot relicense GSDL material as CC0 (rule 1 fails on the licence chain). The layer is also police-station level: turning it into districts would be a derived work of the same restricted source. Not downloaded, since it would only be another GSDL copy. |
| 2 | **india-geodata** "Police Station Locations" | Points, not polygons, with licence "Unspecified". Unusable for districts (rule 4). |
| 3 | **data.gov.in** and **delhi.data.gov.in** | No police-boundary resource found. The Delhi results are police-station resource counts (BPR&D) and case tables. |
| 4 | **Survey of India** WMS on delhi.data.gov.in | Topographic sheets. Not a police geography (rule 4). |
| 5 | **Census of India and Election Commission** | These publish revenue districts, sub-districts, wards and constituencies, none of which are police districts (rule 4). Using them would mislabel NCRB figures. |
| 6 | **Bharatmaps (NIC)** | A national viewer that re-serves state layers. The Delhi police layer it exposes is GSDL's, so GSDL's rights apply. No redistribution licence found. |
| 7 | **Zenodo, Figshare, Mendeley Data** | Searched for Delhi police district or jurisdiction polygons. No deposit found. |
| 8 | **Academic papers** | Delhi crime papers found use NCRB tables or revenue districts. None deposits police-district polygons with a licence. |
| 9 | **GitHub and GitLab** searches for district names (Shahdara, Outer North, IGI Airport) with geojson | Only GSDL re-scrapes and revenue-district repositories (e.g. guneetnarula/indian-district-boundaries, datta07/INDIAN-SHAPEFILES). |
| 10 | **Commercial** (GISMAPS.in, GeoPostcodes) | Ward, postcode and tehsil products. Not police districts, and paid or restricted licences. |

## Best candidate

GSDL's own `Delhi_Police/MapServer/0` layer remains the only complete, correct match for the 16 NCRB districts.
- **Geometry:** the local copy is 16 polygons with the expected names. It needed Z/M values removed and three 2–3 vertex sliver loops repaired.
- **Licence:** it fails only on licence (rules 2 and 3).
- **What it would take:** written permission from GSDL with an effective date. The request is drafted at [permission-requests/gsdl-boundary-permission-request.md](permission-requests/gsdl-boundary-permission-request.md) and has not been sent.

## Decision

- No boundary is integrated. The public endpoint returns an empty collection and the map shows the district table.
- If permission arrives:
  - record it in `provenance.licence.permissionReference`;
  - import with `importLicensedPoliceDistricts` (see [backend README](../../backend/README.md));
  - the map will then draw the 16 districts with the attribution the permission requires.
- **Never done:** centroids, fabricated polygons, Voronoi approximations, or dissolving station layers from a GSDL copy.
