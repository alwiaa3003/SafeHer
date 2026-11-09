# SafeHer Geospatial Data Assessment

Research conducted 9 November 2026. Companion files: `geospatial-dataset-comparison.csv` and `geospatial-feature-feasibility.csv`.

## 1. Executive summary

SafeHer can present credible Delhi-wide analysis today. It cannot yet support a crime map below Delhi level.

- **Boundaries are not the main barrier.** GSDL publishes queryable police, revenue and ward layers. The obstacle for those layers is reuse permission, because GSDL states no open licence.
- **Crime detail is the barrier.** The NCRB tables held by the project are Delhi-wide. They cannot be divided among districts, wards or police stations.
- **District-level data probably exists.** NCRB's website lists "District Wise Reports" among its additional tables, and third-party compilations use police-district units. Direct retrieval of the official tables has not been achieved.
- **Police districts are the only credible sub-Delhi unit.** Revenue districts, census districts and wards are different systems.
- **No open incident-level dataset of crimes against women was found.** A masked Delhi police dataset may support general street-crime analysis, but it is unverified and is not about crimes against women.

A recorded count must never be presented as showing that an area is safe or unsafe.

## 2. Research methodology

- Repository, NCRB holdings, validation decisions and `.gitignore` were inspected.
- Service metadata and feature counts were read from primary services where possible. No large boundary files were downloaded. Small files checked were the DataMeet Delhi wards GeoJSON (about 735 KB) and the 3 MB Delhi Statistical Handbook.
- Attribute lists were read from ArcGIS service metadata. Police district names were compared with the units in the Mendeley file.
- "Not inspected", "Not stated" and "Not read" mean that the information was not confirmed. Nothing has been assumed.

**Access limits:** Survey of India and Delhi Police pages failed automatically because of certificate problems. India Data Portal blocked automated access. Kaggle requires a login. The NCRB additional-table page loads results dynamically.

## 3. Geographical dataset inventory

All twelve required attributes appear below and in the CSV.

| Id | Dataset name | Publisher | Source type | Source url | Geographic coverage | Granularity | Attributes identifiers | Format | Crs | Date | Licence reuse | Limitations | Suitability |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| G01 | Delhi Police district boundaries (DP_DISTRICT_BOUNDARY) | Geospatial Delhi Limited (GSDL) | Official government service | https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/0 | Delhi | Police district (16 polygons) | DISTRICT, RANGE, AREA__SQKM | ArcGIS REST MapServer, queryable | EPSG:32643 (service metadata) | Undated | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Vintage unknown. GSDL disclaims accuracy and says not to use its data for legal or boundary disputes. | CONDITIONAL: closest match to NCRB police units; needs written permission and vintage |
| G02 | Delhi Police sub-divisions (Delhi_Police_Sub_Divisions) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/1 | Delhi | Police sub-division (67 polygons) | SUB_DIVISI, DISTRICT, RANGE | ArcGIS REST MapServer | EPSG:32643 (service metadata) | Undated | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | No crime dataset found at this unit. | UNSUITABLE NOW: no matching crime data |
| G03 | Delhi Police ranges (DP_RANGE_BOUNDARY) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/3 | Delhi | Police range (7 polygons) | RANGE | ArcGIS REST MapServer | EPSG:32643 (service metadata) | Undated | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | No crime dataset found at this unit. | UNSUITABLE NOW: no matching crime data |
| G04 | Police station jurisdictions (PS_BOUNDARY) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/2 | Delhi | Police station jurisdiction (180 polygons) | POL_STN_NM, DIST_NM, AREA, SUB_DIVISI, RANGE | ArcGIS REST MapServer | EPSG:32643 (service metadata) | Undated | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Handbook 2023 reports 209 to 225 police stations in recent years, so 180 may be incomplete or older. No public station-level crime data found. | CONDITIONAL: reference only; no crime data to join |
| G05 | Police station locations (PS_LOCATION) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/4 | Delhi | Point (224) | NAME, DISTRICT, X, Y | ArcGIS REST MapServer | EPSG:32643 (service metadata) | Undated | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Locations of stations are not crime locations. | CONDITIONAL: context layer only after permission |
| G06 | Revenue districts 2019 (Updated_District_Boundary_18-7-2019_DD) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/Revenue/Revenue_District_Boundary_2019/MapServer/0 | Delhi | Revenue district (count not queried) | DIST_NM, NM, DIST_CEN_C | ArcGIS REST MapServer | Not read | Layer name indicates 18 Jul 2019 | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Superseded by the December 2025 reorganisation. Revenue districts are not police districts. | UNSUITABLE for NCRB units; historical reference only |
| G07 | Revenue districts and sub-divisions 2020 (Updated_District_15-5-2020) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/Revenue/Updated_District_Boundary15052020/MapServer | Delhi | Revenue district, sub-division | DIST_NM, SUB_DIV | ArcGIS REST MapServer | Not read | Layer name indicates 15 May 2020 | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Superseded. Revenue, not police, geography. | UNSUITABLE for NCRB units |
| G08 | Revenue districts/sub-divisions (bound_new) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/Administrative_Boundary/bound_new/MapServer | Delhi | District, sub-division, village | Dist_Name, SD_Name, MVB_VIL_NM | ArcGIS REST MapServer | Layer name mentions WGS84; not read | Undated | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Unclear whether it reflects the 13-district scheme. Purpose undocumented. | UNVERIFIED: needs GSDL clarification |
| G09 | MCD wards 2022 (MCD_Ward_Zone_2022, layer MCDWARD) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/MCD/MCD_Ward_Zone_2022/MapServer/1 | MCD area of Delhi (excludes NDMC and Cantonment unless shown otherwise) | Municipal ward | WNo_SEC, AC_No, AC_Name, Ward_No, WardName, TotalPop, SC_Pop, NW2022 | ArcGIS REST MapServer | Not read | Layer name indicates 2022 delimitation | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | No ward-level crime data found. | UNSUITABLE for crime mapping; possible reference layer after permission |
| G10 | MCD zones 2022 (MCD_Ward_Zone_2022, layer MCDZone) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/MCD/MCD_Ward_Zone_2022/MapServer/0 | MCD area | Municipal zone | WARD_2017_, LB | ArcGIS REST MapServer | Not read | Layer name indicates 2022 | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Field names are ambiguous. No zone-level crime data found. | UNSUITABLE for crime mapping |
| G11 | MCD wards 2017 (NDMC/MCD_Ward_2017) | GSDL | Official government service | https://gsdl.org.in/arcgis/rest/services/NDMC/MCD_Ward_2017/MapServer/0 | MCD area | Municipal ward, pre-2022 delimitation | AC_NO, AC_NM, WARD_NO, WARD_NAME, TOT_POP, SC_POP, LB | ArcGIS REST MapServer | Not read | Layer name indicates 2017 | None stated on the service. GSDL website footer: All Rights Reserved. Reuse permission required. | Superseded by 250-ward 2022 delimitation. | UNSUITABLE: historical reference only |
| G12 | Delhi wards (Delhi_Wards) | DataMeet community | Community / third party | https://github.com/datameet/Municipal_Spatial_Data/tree/master/Delhi | Delhi | Ward or census charge (290 features) | Ward_Name, Ward_No | GeoJSON, Shapefile | CRS84 (file metadata) | Repository last updated Feb 2024; data age not stated | CC BY-SA 2.5 India (folder readme) | Readme says scraped from an ArcGIS Online map, so original rights are unclear. Labels such as DELHI CANTT CHARGE 1 suggest older census geography. | UNSUITABLE for current wards; provenance weak |
| G13 | Delhi outer boundary (Delhi_Boundary) | DataMeet community | Community / third party | https://github.com/datameet/Municipal_Spatial_Data/tree/master/Delhi | Delhi | Single outline | Not inspected | GeoJSON, Shapefile | Not inspected | Not stated | CC BY-SA 2.5 India (folder readme) | Same scraped provenance as G12. | CONDITIONAL: usable outline if provenance is accepted |
| G14 | India districts, Census 2001 and 2011 (Districts) | DataMeet community | Community / third party | https://github.com/datameet/maps/tree/master/Districts | India | Census district | Not inspected | Shapefile/GeoJSON per project site | WGS84 per project site | Repository last updated May 2022 | README: CC BY 4.0 unless stated; LICENSE file: MIT. The two should be reconciled. | Census districts differ from police districts and current revenue districts. | UNSUITABLE for NCRB police units |
| G15 | geoBoundaries India ADM2 | geoBoundaries (William & Mary) | Third-party academic | https://www.geoboundaries.org/api/current/gbOpen/IND/ADM2/ | India | District (736 units nationally; Delhi not inspected) | Not inspected | GeoJSON, Shapefile per API | Not read | Represents 2021; source updated Jan 2023; built Dec 2023 | Record states ODbL 1.0. Project website describes CC BY 4.0; dataset record should take priority. | Pre-dates Delhi's 13-district scheme. Revenue-type units. Source is Pathways Data/LGD. | UNSUITABLE for NCRB police units |
| G16 | geoBoundaries India ADM3 | geoBoundaries (William & Mary) | Third-party academic | https://www.geoboundaries.org/api/current/gbOpen/IND/ADM3/ | India | Sub-district (6836 units nationally) | Not inspected | GeoJSON, Shapefile per API | Not read | Represents 2018; built Dec 2023 | Record states ODbL 1.0 | Older than ADM2 and not police geography. | UNSUITABLE |
| G17 | OpenStreetMap Delhi administrative boundaries | OpenStreetMap contributors | Community / open data | https://www.openstreetmap.org/copyright | Delhi | admin_level 5: 13 districts; 8: 4; 9: 72; 10: 1039; 11: 19 relations | name, official_name, admin_level, wikidata (varies) | OSM relations; Overpass or extracts | WGS84 (OSM standard) | Continuously edited; individual dates not inspected | ODbL 1.0: attribution and share-alike | Volunteer data, no official status. The 13 level-5 names match the new revenue scheme, not NCRB police districts. No relation is named as a ward. | SUITABLE as first context layer; UNSUITABLE for joining NCRB data |
| G18 | OpenStreetMap police features | OpenStreetMap contributors | Community / open data | https://www.openstreetmap.org/copyright | Delhi | 206 police-tagged objects (132 nodes, 70 ways, 4 relations) | Tags vary | OSM features | WGS84 (OSM standard) | Continuously edited | ODbL 1.0: attribution and share-alike | Mostly station features, not a jurisdiction set. Only 4 relations against 180 GSDL jurisdictions. | UNSUITABLE as police boundaries |
| G19 | OpenCity police jurisdiction maps | OpenCity | Third-party catalogue | https://data.opencity.in/dataset/police-jurisdiction-maps-for-major-cities-of-india | Listed cities | Police jurisdiction | Not inspected | KML | Not read | Catalogue updated Nov 2025 | Catalogue says Other (Public Domain), which is OpenCity's label | Delhi appears in the description but not in the current resources returned by the API (Mumbai, Bengaluru, Hyderabad). | UNSUITABLE: Delhi file not found |
| G20 | OpenCity Delhi wards information (2022 ward and zone maps) | OpenCity, reported as sourced from GSDL | Third-party catalogue | https://groups.google.com/g/datameet/c/Dm9ESRDAP8A/m/VBsOV7SBCgAJ | Delhi | Ward, zone | Not inspected | KML per forum post | Not read | 2022 delimitation per forum post | Not established; upstream GSDL rights apply | The referenced catalogue page returned 404 on 9 Nov 2026. | UNSUITABLE: page unavailable and rights unclear |
| G21 | OpenCity Delhi Census 2011 data | OpenCity, Census of India data | Third-party catalogue | https://data.opencity.in/dataset/delhi-census-2011-data | Delhi | Ward-wise population (table, not a map) | Not inspected | CSV | Not applicable | Census 2011 | Catalogue says Other (Public Domain), which is OpenCity's label | Attribute table only; ward units are 2011 and do not match 2022 wards. | UNSUITABLE for current boundaries |
| G22 | GADM India administrative areas | GADM | Third-party academic | https://gadm.org/license.html | India | Administrative levels | Not inspected | Multiple per project | Not inspected | Not inspected | Free for academic and non-commercial use; redistribution requires permission | Redistribution restriction conflicts with a public project. | UNSUITABLE for a public site without permission |
| G23 | Survey of India administrative boundary products | Survey of India | Official government portal | https://onlinemaps.surveyofindia.gov.in/AboutPortal.aspx | India | State, district, taluk, village reported in search results; wards not shown | Not inspected | Shapefile reported for 1:1M district data | Not inspected | Not inspected | Reported to require agreeing to Geospatial Data Guidelines 2021 and NGP 2022; terms not read directly | Portal could not be opened automatically (certificate error). Delhi-specific usefulness unconfirmed. | UNVERIFIED: requires manual review of terms and products |
| G24 | Local Government Directory (LGD) | Ministry of Panchayati Raj | Official government directory | https://lgdirectory.gov.in/ | India | Administrative codes | Not inspected | Directory; polygons not confirmed | Not inspected | Not inspected | Not inspected | Not inspected. Useful as a code reference only if confirmed. | UNVERIFIED: possible identifier reference |

## 4. Crime data source inventory

Official statistics, third-party compilations, research data and community reports are separate evidence classes and must not be treated as equivalent.

| Id | Source | Source class | Record type | Geographic unit | Coordinates or location | Timestamps | Women specific | Publicly accessible | Reuse for research | Privacy quality concerns | Url |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C01 | NCRB Table 3A.1 (held) | Official statistics | Aggregated annual | Delhi UT / Delhi (State/UT table) | No | Year only | Yes | Yes | No explicit reuse licence found | Registered cases only; Principal Offence Rule; 2019 not yet sourced | https://www.ncrb.mha.gov.in/uploads/files/11CrimeinIndia2024-VolumeI.pdf |
| C02 | NCRB Table 3A.2 (held; research only) | Official statistics | Aggregated annual by category | Delhi UT / Delhi (State/UT table) | No | Year only | Yes | Yes | No explicit reuse licence found | IPC/BNS comparability not assessed; kidnapping formula issue | https://www.ncrb.mha.gov.in/uploads/files/11CrimeinIndia2024-VolumeI.pdf |
| C03 | NCRB Tables 3B.1 and 3B.2 | Official statistics | Aggregated annual | Delhi City (metropolitan table) | No | Year only | Yes | Yes | No explicit reuse licence found | Not equivalent to Delhi UT | https://www.ncrb.mha.gov.in/uploads/files/11CrimeinIndia2024-VolumeI.pdf |
| C04 | NCRB Additional Tables, District Wise Reports | Official statistics | Aggregated (reported) | District-wise (Delhi units not confirmed) | No evidence | Year selector | To be confirmed | Page is public; results load dynamically and were not retrieved | No explicit reuse licence found | Needs manual browser check | https://www.ncrb.gov.in/crime-in-india-additional-table.html |
| C05 | Mendeley women crime dataset | Third-party research compilation of NCRB data | Aggregated annual | NCRB district units; Delhi rows for 2019 and 2020 | No | Year only | Yes | Yes | CC BY 4.0 | Quarantined until validated; includes non-geographic units | https://data.mendeley.com/datasets/whrdh8c5zb/1 |
| C06 | Dataful NCRB District Wise Crime Data | Third-party compilation of NCRB data | Aggregated annual by crime head | Crime reporting unit, LGD code, unit type; 2001-2024 | No | Year only | Yes | Listed with downloads; access terms unclear | Not stated on page; terms not reviewed | Delhi coverage not confirmed from preview. Dataset notes a source inconsistency in 2024 stalking | https://distcrimes.dataful.in/datasets/2/ |
| C07 | India Data Portal crime statistics | Third-party compilation of NCRB data | Aggregated annual | District | No | Year only | Yes | Automated access blocked (403) | None listed on the resource seen earlier | Must be reconciled to NCRB | https://indiadataportal.com/p/crime-statistics |
| C08 | Esri India NCRB District Wise Crime Against Women (2024) | Third-party layer of NCRB data | Aggregated annual | District, with LGD and Census codes | Polygons in layer | Year only | Yes | ArcGIS account required | Esri India terms; export not permitted | Cannot be used as an offline source | https://www.arcgis.com/home/item.html?id=15807229ed3342939bfabd8c9606f25e |
| C09 | Delhi Statistical Handbook 2023, Table 15.2 | Official statistics (Delhi Govt, citing Delhi Police) | Aggregated annual | Delhi-wide | No | Year only | Selected heads | Yes | Terms not reviewed | Different source and classifications from NCRB; must not be merged | https://des.delhi.gov.in/sites/default/files/DES/generic_multiple_files/statistical_hand_book_2023.pdf |
| C10 | Delhi Police website | Official (source of FIR services) | Not established | Not established | Not established | Not established | Not established | Could not be opened automatically (certificate expired) | Not established | Needs manual review | https://www.delhipolice.gov.in/ |
| C11 | Delhi Police PCR street-crime data, masked (Kaggle) | Third-party research release of police data | Individual events | Masked; usability unconfirmed | Masked; method not stated | Date and time in raw data; masked release unconfirmed | No: snatching and robbery | Kaggle login required; not inspected | Licence unverified | Must not be presented as crimes against women; COVID period; calls, not FIRs | https://www.kaggle.com/datasets/ankurzing/spatio-temporal-crime-incidents |
| C12 | Delhi Police PCR data, raw (IIMA study) | Restricted official data | Individual events | Coordinates for about 60%, others geocoded | Yes, restricted | Yes | No: snatching and robbery | No | By police permission only | Sensitive location data | https://arxiv.org/html/2602.23750 |
| C13 | Garg study, Delhi FIR data 2016-2019 | Researcher-assembled official data | Reported at police station and day | Police station | Station level | Day | Includes harassment | No public release found | Unknown | Would require researcher permission | https://extranet.sioe.org/uploads/sioe2025/garg-2025-01-14_2192.pdf |
| C14 | Praja Foundation white papers | NGO reports from RTI data | Aggregated | District in some reports | No | Year | Selected heads | Yes (PDF) | Terms not reviewed | RTI-derived; coverage varies | https://praja.org/praja_docs/praja_downloads/Report%20on%20State%20of%20Policing%20and%20Law%20and%20Order%20in%20Delhi,%202022_Final.pdf |
| C15 | Safecity (Red Dot Foundation) | Community reports | Individual reports | Locations; exact precision unknown | Yes in a historic file | Yes in a historic file | Yes: harassment and abuse | Dashboards; no open dataset found | Written permission required | Self-reported, not representative, not official; high privacy risk | https://en.wikipedia.org/wiki/Safecity |
| C16 | Safetipin audits | Community/perception audits | Audit points | Point (not openly downloadable) | Audit locations | Audit period | Perception of safety, not crime | On request | Not published | Not crime data; must not be treated as incidents | https://safetipin.com/data-for-change-delhi-old/ |
| C17 | eCourtsIndia Delhi FIR PDFs | Third-party scraped legal records | Individual FIR documents | Police station | No coordinates listed | Registration details | Mixed | Public website | Not established | EXCLUDE: may name people; sexual-offence FIRs exempt from mandatory upload | https://ecourtsindia.com/CrimeReports/Delhi |
| C18 | JusticeHub FIR dataset 2015-2019 | Third-party research dataset | FIR-level | Haryana, not Delhi | Not applicable | Yes | Mixed | Yes | CC BY 4.0 | Outside Delhi; methods reference only | https://justicehub.in/dataset/the-first-information-report-dataset-from-years-2015-2019 |
| C19 | Kaggle Indian Crimes Dataset | Unverified upload | Records, provenance unknown | City | No | Yes | Mixed | Yes | Unknown | EXCLUDE: provenance undocumented | https://www.kaggle.com/datasets/sudhanvahg/indian-crimes-dataset |

## 5. Geographical compatibility matrix

| Crime dataset | Geographic unit | Candidate boundary layer | Compatible | Reason |
|---|---|---|---|---|
| NCRB 3A.1/3A.2 (C01, C02) | Delhi UT as a whole | Delhi outline (G17 or G13) | YES, as a single-unit view | One reporting unit, one outline; suitable for context, not a choropleth |
| NCRB 3A.1/3A.2 | Delhi UT as a whole | Police districts (G01) | NO | Delhi-wide totals cannot be split among districts |
| NCRB 3A.1/3A.2 | Delhi UT as a whole | Revenue districts (G06, G07, G17 level 5) | NO | No sub-Delhi data, and revenue units are a different system |
| NCRB 3A.1/3A.2 | Delhi UT as a whole | Wards or zones (G09, G10, G12) | NO | No ward-level crime data exists in these tables |
| NCRB 3A.1/3A.2 | Delhi UT as a whole | Police stations (G04) | NO | No station-level figures |
| NCRB 3B (C03) | Delhi City | Any Delhi polygon | NO | Delhi City's extent is not defined by these layers, and it is not equivalent to Delhi UT |
| NCRB district tables (C04, C05, C06) | Police district units | Police districts (G01) | CONDITIONAL | 16 geographic unit names align by name with 2019-2020 units (with AIRPORT vs IGI Airport), but name matching is insufficient: boundary vintage, permission and official validation are required |
| NCRB district tables | Non-geographic units (Crime Branch, EOW, Metro, Railway, SPUWAC, Special Cell, Vigilance) | Any polygon | NO | These units have no matching polygon and must stay in a separate list |
| NCRB district tables | Police district units | Revenue districts (G06, G07, G17) | NO | Different administrative systems; similar names do not establish equal areas |
| NCRB district tables | Police district units | Census 2011 districts (G14) | NO | Different unit system; merging to parents would be an artificial allocation |
| NCRB district tables | Police district units | Wards (G09) | NO | No defensible crosswalk or ward-level source |
| Delhi Statistical Handbook (C09) | Delhi-wide | Delhi outline | YES, as a separate series | Separate source; not to be merged with NCRB |
| Masked PCR data (C11) | Masked events | Any boundary | UNVERIFIED | Depends on whether coordinates are real, shifted or abstract |
| Masked PCR data (C11) | Events, if coordinates valid | Grid or police districts (G01) | CONDITIONAL | Valid for general street crime only, never crimes against women |
| Safecity (C15) | Reported location, if permitted | Coarse areas | CONDITIONAL | Written permission, aggregation and separate labelling required |
| Garg FIR data (C13) | Police station, day | Police stations (G04) | NOT AVAILABLE | Data not publicly released |

### Unit-name evidence

GSDL's police district layer lists: AIRPORT, CENTRAL, DWARKA, EAST, NEW DELHI, NORTH, NORTH EAST, NORTH WEST, OUTER, OUTER NORTH, ROHINI, SHAHDARA, SOUTH, SOUTH EAST, SOUTH WEST, WEST.

The Mendeley 2019 and 2020 Delhi rows contain those names (with IGI Airport for AIRPORT) and also Crime Branch, EOW, Metro, Railway, SPUWAC, Special Cell and Vigilance. Similar names do not prove identical areas.

### Boundary changes over time

- **Police districts:** historic NCRB-derived rows show changing units, including Rohini, Shahdara and Dwarka in later years. Exact dates of change were not confirmed. Wikipedia describes 15 police districts, while GSDL has 16.
- **Revenue districts:** reorganised from 11 to 13 by notification dated 25 December 2025. GSDL also holds 2019 and 2020 versions. Sources: [The Week](https://www.theweek.in/wire-updates/national/2025/12/26/des55-dl-districts-notification.html), [The Federal](https://thefederal.com/category/states/north/delhi/delhi-revenue-districts-reorganisation-13-from-2026-222834).
- **Municipal wards:** reduced from 272 to 250 in the 2022 delimitation. Source: [ThePrint](https://theprint.in/india/mha-issues-final-gazette-notification-for-delimitation-of-delhi-wards-paving-way-for-civic-polls/1173710).

A multi-year map needs boundaries matched to each year or a documented, unchanged set of units.

## 6. Feature feasibility assessment

| Feature | Status | Required data | Explanation |
|---|---|---|---|
| Delhi-wide annual crime trends | FEASIBLE_NOW | NCRB Table 3A.1 (held) | Eight annual Delhi UT totals are held. 2019 stays a gap until sourced. |
| Crime category comparisons | FEASIBLE_NOW | NCRB Table 3A.2 for 2018 and 2022-2024 (research stage, not production) | Possible within a single edition after approval. Cross-year comparison requires a category-by-category comparability review, currently not assessed. |
| District-level choropleth maps | FEASIBLE_WITH_ADDITIONAL_DATA | Official NCRB district tables or validated equivalent; police district boundaries with permission and known vintage | Current NCRB holdings are Delhi-wide. Non-geographic units must stay off the map. Revenue or census districts must not be substituted. |
| Ward-level maps | NOT_FEASIBLE_WITH_CURRENT_DATA | A ward-level crime dataset, none found | Boundaries exist, but no public crime figures use wards. A ward map can show boundaries only. |
| Police-station-level analysis | NOT_FEASIBLE_WITH_CURRENT_DATA | Public station-level crime figures, none found | Station boundaries exist. The one station-level dataset found is not publicly released. |
| Incident-level mapping | NOT_FEASIBLE_WITH_CURRENT_DATA | Lawful incident-level data with coordinates and privacy controls | No official public incident data for crimes against women found. Mapping would also raise serious privacy risks. |
| Spatial hotspot detection | FEASIBLE_WITH_ADDITIONAL_DATA | Verified incident coordinates (masked PCR data if valid) | Possible only for general street crime if the masked data has usable coordinates. Not possible for crimes against women. |
| DBSCAN clustering | FEASIBLE_WITH_ADDITIONAL_DATA | Verified incident coordinates in a real coordinate system | Same condition as hotspots. It should be used only if the coordinates are valid and it answers a clear question. |
| Kernel Density Estimation | FEASIBLE_WITH_ADDITIONAL_DATA | Verified incident coordinates | Same condition. Density reflects recorded events and must not be presented as safe or unsafe areas. |
| Night-time versus daytime analysis | FEASIBLE_WITH_ADDITIONAL_DATA | Verified timestamps in incident-level data | NCRB is annual. Possible for general street crime only if masked timestamps are usable. |
| Geographical comparison of crime categories | FEASIBLE_WITH_ADDITIONAL_DATA | District-level category tables, validated; police district boundaries | Not possible with Delhi-wide tables. Cross-year use is limited by unassessed comparability. |
| Delhi geographic context map | FEASIBLE_NOW | OpenStreetMap, with attribution | Can show geography with no crime values attached. |

Machine learning is not recommended merely to add technical complexity. Clustering is appropriate only if verified coordinates exist and it answers a defined question.

## 7. Data quality and privacy considerations

- NCRB counts registered cases and applies the Principal Offence Rule. Under-reporting is unknown.
- NCRB totals must never be allocated to smaller areas.
- Population denominators must match the reporting unit and be documented.
- Incident locations for sexual offences carry a risk of identifying victims. Indian law restricts disclosure of the identity of victims of sexual offences (BNS Section 72).
- Community reports are self-selected and are not officially registered cases.
- FIR documents may name private individuals and are excluded.
- Crime Branch, Railway, Metro and similar units must not be placed on geographic polygons.

## 8. Licensing and attribution considerations

- **GSDL:** a queryable service does not grant a reuse licence. Its site says All Rights Reserved.
- **OpenStreetMap:** ODbL requires attribution, and derived databases can carry share-alike duties. Source: [OSM copyright](https://www.openstreetmap.org/copyright). Tile usage terms still need review.
- **DataMeet:** the Delhi folder is CC BY-SA 2.5 India, but it was scraped from another map. The maps repository has both a CC BY 4.0 README statement and an MIT LICENSE file.
- **geoBoundaries:** the API record says ODbL, while the project website describes CC BY 4.0. Use the record and confirm.
- **GADM:** redistribution requires permission. Source: [GADM licence](https://gadm.org/license.html).
- **NCRB:** no explicit reuse licence has been found. Source PDFs stay out of Git.
- **OpenCity:** its "public domain" label does not establish rights in upstream data.

## 9. Recommended geographical data source

- **First layer:** OpenStreetMap Delhi outline and context, with attribution and no crime values.
- **First candidate for crime mapping:** GSDL `DP_DISTRICT_BOUNDARY`, only after written permission and confirmation of its date.

## 10. Recommended next steps

1. Manually retrieve NCRB's District Wise Reports for Delhi and record what they contain.
2. Send the drafted GSDL permission request, adding the boundary date question.
3. Inspect the masked Kaggle dataset's licence, columns and coordinates.
4. Validate any district data against official NCRB publications, separating non-geographic units.
5. Add `docs/research/table-3a2-review/` to `.gitignore` if the review crops should not be committed.

## 11. Answers to the key questions

**1. Which geographical dataset should SafeHer use first?**
OpenStreetMap for the Delhi outline and context. GSDL police districts are the target for crime mapping once permission is obtained.

**2. Which unit is most appropriate for the first Geographic Explorer?**
Delhi UT as a single unit, shown as context with no sub-Delhi crime values.

**3. Can we perform district-level or ward-level crime analysis with current NCRB data?**
No. Current holdings are Delhi-wide. District analysis requires additional official tables and permissioned boundaries. No ward-level crime source was found.

**4. Is there a credible path to incident-level spatial analysis?**
For crimes against women, not through an open dataset. A conditional path exists for general street crime, if the masked data proves valid. Safecity would be a separate community layer requiring written permission.

**5. What additional data do we need?**
Official NCRB district tables; GSDL permission and date; the 2019 source; a 3A.2 comparability review; verification of the masked dataset; and, optionally, Safecity's written permission.

**6. Should database and backend work begin now?**
Begin the Delhi-wide NCRB database and API design when ready, because it does not depend on geography. Wait on geographic tables until the district-data and boundary decisions are made.

## 12. Recommended BTech final-year scope

**Core:** verified Delhi-wide NCRB dashboard; provenance and validation; category analysis within editions; metro comparison using Delhi City separately; Geographic Explorer with attributed context and a clear account of what cannot be mapped; documented methodology.

**Stretch if data clears:** police-district map for validated years, showing non-geographic units separately.

**Optional if verified:** clearly separated general street-crime hotspot analysis, with the limits stated.

## 13. Unresolved questions

- What do NCRB's District Wise Reports contain for Delhi, and in what format?
- What boundary date does GSDL's police layer represent, and may it be reused?
- Are GSDL's 180 station boundaries complete, given the police-station counts in the Delhi Statistical Handbook?
- Does the masked Kaggle dataset have usable real-world coordinates and a reuse licence?
- Which police district boundary changes occurred, and when?
- How should the OSM level-5 scheme be confirmed against the official Gazette?
- What are the Survey of India terms and the OSM tile usage terms?
- What reuse conditions apply to NCRB data?

## 14. Additional sources

- [GSDL services](https://gsdl.org.in/arcgis/rest/services), [GSDL website](https://gsdl.org.in/)
- [DataMeet Municipal Spatial Data](https://github.com/datameet/Municipal_Spatial_Data), [DataMeet maps](https://github.com/datameet/maps)
- [Crime against women district-level study](https://pmc.ncbi.nlm.nih.gov/articles/PMC11288248), which merged newer districts into parent districts, an approach SafeHer should not copy
- [Supreme Court FIR upload ruling summary](https://www.scconline.com/blog/?p=67531)
- [Delhi Police districts, secondary reference](https://en.wikipedia.org/wiki/Districts_of_Delhi_Police)
