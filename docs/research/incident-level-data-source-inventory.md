# Incident-Level Crime Data: Source Inventory

**Status:** Research only, recorded 10 November 2026. Nothing was imported, and there was no Atlas connection, account registration, contact or RTI request.

**Companion files:**
- [Candidate comparison (CSV)](incident-level-data-candidate-comparison.csv): one row per candidate, 32 rows
- [Feasibility](incident-level-data-feasibility.md)
- [Acquisition plan](incident-level-data-acquisition-plan.md)
- [Map integration recommendations](incident-level-map-integration-recommendations.md)
- [Progress](incident-level-data-research-progress.md)

**Builds on:**
- [Alternative data source assessment](alternative-data-source-assessment.md)
- [Geospatial data assessment](geospatial-data-assessment.md), candidates C01–C19
- [Convicted-offender data assessment](convicted-offender-data-assessment.md), §6

Prior IDs are kept in the CSV's `prior_id` column so that earlier rejections can be traced.

## 1. How each source was checked

| Level | Meaning |
|---|---|
| **Inspected** | Files downloaded and read. A SHA-256 hash was recorded, and the files are kept in `docs/source-reports/incident-data-2026-11-10/`, which Git ignores |
| **Metadata** | The publisher's own metadata was read (Kaggle public API, Zenodo and Dataverse APIs, GitHub API, portal pages), but not the records |
| **Listing** | Only a landing page or search result was seen. These are marked as such and not relied on for contents |

**Coordinates.** Coordinates were treated as meaningless until the source said what they represent. Three verified examples show why:
- **I21:** the coordinates are geocoded police stations.
- **I23:** they are geocoded review zones.
- **I24:** they are police stations with Voronoi cells.

## 2. Government and official sources

| ID | Source | Finding | Class | Status |
|---|---|---|---|---|
| I01 | NCRB Table 3A.1 | Delhi UT annual totals 2016–2024, already in SafeHer | AGGREGATED_CITY_STATISTICS | In use; aggregate |
| I02 | NCRB district tables 2020–2022 | 16 Delhi police-district units × 52 categories, held and validated | AGGREGATED_DISTRICT_STATISTICS | Research only; best area-level source |
| I03 | data.gov.in NCRB resources | **Licence finding:** data.gov.in states that content is "licensed under the Government Open Data License-India". GODL (Gazette No. 42, 13 Feb 2017) grants a "worldwide, royalty-free, non-exclusive license to use, adapt, publish ... for all lawful commercial and non-commercial purposes", with attribution (s.4–5). It excludes personal information, sensitive data and RTI s.8 material (s.6). **The only district crimes-against-women resource found is for 2013**, not SafeHer's 2020–2022 years. The resource's data loads by script or keyed API and was not inspected. The page showed a "sandbox environment" banner on 10 Nov 2026 | AGGREGATED_DISTRICT_STATISTICS | Licensed route for aggregates only |
| I04–I06 | OpenCity, India Data Portal, Dataful | Third-party mirrors of NCRB tables | Aggregated | Context only |
| I10 | Delhi Statistical Handbook | Delhi Government tables citing Delhi Police | AGGREGATED_CITY_STATISTICS | Separate series |
| I11 | **Delhi Police press releases** (`https://delhipolice.gov.in/press-releases.html`) | Lists individual releases with district, police station, category and date, for example narcotics, snatching and arms recoveries. These are **arrest announcements** that name accused people, without coordinates | INCIDENT_POLICE_DISTRICT | Rejected: allegations, personal data |
| I12 | **Delhi Police View FIR** (`https://cctns.delhipolice.gov.in/citizen/firSearch.htm`) | A lookup by district, police station, year and FIR number. Not a dataset. Sexual-offence FIRs are kept out of the public domain (*Nipun Saxena* direction 3) | INCIDENT_POLICE_DISTRICT | Excluded |
| — | Delhi Police site, other | No crime-statistics or open-data section. Traffic statistics link to a road-crash report, which is out of scope. The "Security of Women & Children" link goes to the SPUWAC site | — | Nothing usable |
| I13 | Delhi Police PCR call data (raw) | Used by Sriram, Sinha and Choudhary. Per the paper, "The data used in this study is not publicly available, and was procured following due process with permission from the Delhi police department." Coordinates are the location "entered in the system by the PCR call attendant", or geocoded from the text address | INCIDENT_EXACT_COORDINATE (reported, unverified) | Restricted |
| I31 | NDAP (NITI Aayog) | No crime dataset at police-station or incident level found | UNKNOWN | Not found |
| I32 | GSDL police-station boundaries and locations | Station buildings and jurisdictions, not incidents. All Rights Reserved (OR-04) | NOT_INCIDENT_LEVEL | Permission required |

**MHA:** publishes crime statistics only through NCRB. CCTNS and CMAPS are internal police systems with no public data release found.

## 3. Academic and research datasets

**Repository searches on 10 Nov 2026,** using public APIs with no account:

| Repository | Searches | Result |
|---|---|---|
| Zenodo | Title "Delhi" with crime, police, harassment, rape, violence, safety or FIR (52 hits); "India" with crime and district, police or FIR (15 hits) | No Delhi incident dataset. Hits were articles, such as I29 (PDF only), and NCRB-derived state panels |
| Harvard Dataverse | Title "Delhi" with crime terms (2 hits); "India" with FIR or police station (3 hits) | No Delhi crime data. Found I21 (Bihar, UP, Haryana) and a Madhya Pradesh policing experiment |
| GitHub | Delhi crime repositories via search and API | I18, I23, I24, all inspected through the GitHub API |
| Kaggle | Public metadata API, no login | I14 and I22: metadata only. Downloads need an account, which was not created |
| Mendeley Data | Landing pages | I07 (held earlier); I08 lists no files |
| Figshare, IEEE Xplore, ACM, ScienceDirect, SpringerLink, Google Scholar, ResearchGate | Web search only | Only aggregate-based studies found. A Delhi rape-hotspot study (I30) states that micro-level data was not available. A 2024 Frontiers district-level study uses NCRB district files. **No supplementary incident file for Delhi was found** |

**Key datasets:**
- **I14, masked Delhi PCR street-crime records (Kaggle `ankurzing/spatio-temporal-crime-incidents`).**
  - **From the Kaggle API metadata:** licence "Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)"; one file, `crime_prediction_dataset.csv`, 2,100,830 bytes; described as "anonymized street-crime incident records".
  - **From the paper:** the dataset "has been masked without any loss of integrity", with no method given, and covers street crime (snatching and robbery) from Oct 2019 to Mar 2021.
  - **Not inspected:** download needs a Kaggle account.
  - **Assessment:**
    - **Not about crimes against women.**
    - **NoDerivatives** forbids sharing adapted material, which includes derived map markers.
    - **Masked coordinates** cannot be verified incident locations.
- **I21, Jassal FIR replication data (Dataverse `doi:10.7910/DVN/VRH8ND`, CC0).**
  - **Inspected:** `instruct.txt` and three small files.
  - **Coverage:** FIR data for **Bihar, Uttar Pradesh and Haryana** only. The instructions say data "have been scrubbed free of all information that can be attributed to a particular individual".
  - **Coordinates:** `data1_1.tab` has 582 district coordinates for all-women police stations across 27 states, none of them Delhi. `data3_2.tab` has 1,420 geocoded police-station coordinates for UP cases, including a few transfers to New Delhi stations; 2 lack coordinates.
  - **Assessment:** coordinates are police stations, not incidents, and the data is not Delhi. The same dataset is mirrored by JusticeHub and AIKosh (C18).
- **I18, SafeCity research splits (`swkarlekar/safecity`).**
  - **Inspected:** the README and the multi-label dev split.
  - **Contents:** 990 records with 4 columns: story text and three labels (commenting, ogling, groping). **There are no location or date fields.** There are 50 duplicate texts.
  - **Terms:** no licence file. The README says "This data is for research purposes only" and asks users to contact Safecity moderators for permission.
- **I22, "Indian Crimes Dataset" (Kaggle, CC0).** Metadata only. The subtitle says 2023 while the description says "2020 to 2024", and no source is given. It cannot be treated as real police records.
- **I24, Delhi-Crime-Map (GitHub).** The README says crime statistics "by police stations" for 2014, geocoded to stations and spread over Voronoi cells. The raw data is not in the repository, and there is no licence.
- **I26–I27, court datasets.** These are located by court, not by incident; see the convicted-offender assessment.

## 4. Civic, NGO and community sources

| ID | Source | Finding | Class |
|---|---|---|---|
| I17 | Safecity (Red Dot Foundation) | Crowdsourced, moderated reports. No public licence or data-request process found; one Safecity page mentions an API for police partners. Permission required (OR-14) | COMMUNITY_PERCEPTION_DATA |
| I19 | Safetipin | Safety-perception audits, not crime | COMMUNITY_PERCEPTION_DATA |
| I23 | Safeit "SafeMap" | Generated from negative Google Maps reviews, LLM-classified and geocoded to 20 named zones. No licence. The pull request adding the Delhi file was closed unmerged | COMMUNITY_PERCEPTION_DATA |
| I28 | CHRI victimisation survey, Delhi and Mumbai, 2015 | A survey report. No microdata found | NOT_INCIDENT_LEVEL |
| I16 | Praja Foundation | RTI-derived aggregates by police district | AGGREGATED_DISTRICT_STATISTICS |

**Community and perception data are never registered crime.** They must never be added to NCRB counts.

## 5. Earlier rejections re-examined

| Prior ID | Earlier status | New evidence | Status now |
|---|---|---|---|
| C11 (I14) | Unverified: Kaggle login, licence unknown | Licence confirmed as CC BY-NC-ND 4.0; one CSV file; "anonymized", masked | **Rejected for SafeHer.** Still uninspected, but the licence alone bars derived public markers. It could change only with written permission from the dataset owners and Delhi Police |
| C12 (I13) | Restricted | The paper confirms that data was obtained by permission, and that coordinates are call-attendant or geocoded locations | Restricted. Reported call locations are not verified incidents |
| C15 (I17) | Permission required | The research splits (I18) contain no locations | Unchanged |
| C18 (I21) | FIR-level, CC BY 4.0 via mirror | Dataverse original is CC0; covers **Bihar, UP and Haryana only**; coordinates are police stations | **Rejected for Delhi** |
| C19 (I22) | Provenance unknown | Metadata shows inconsistent period and no source | Rejected |
| C04 (I02) | No explicit licence | GODL covers NCRB data **published on data.gov.in**, but no 2020–2022 district resource was found there | Unchanged (OR-12) |
| C10 (I12) | Not established | Confirmed as a per-FIR lookup | Excluded |

## 6. Inaccessible or unverified

| Attempted URL | Limitation |
|---|---|
| `https://aikosh.indiaai.gov.in/home/datasets/details/the_first_information_report_dataset_from_years_2015_2019.html` | Connection timed out; content inferred only via the Dataverse original (I21) |
| `https://www.kaggle.com/datasets/ankurzing/spatio-temporal-crime-incidents` (file) | Account required; not registered |
| `https://www.kaggle.com/datasets/sudhanvahg/indian-crimes-dataset` (file) | Account required |
| `https://baselight.ai/u/kaggle/dataset/...` | The mirror service has shut down |
| data.gov.in resource data | Loaded by script, or needs an API key (not obtained) |
| NDAP | Not reached |
| ResearchGate full texts | Login required |

## 7. Downloaded files and hashes

All are in `docs/source-reports/incident-data-2026-11-10/` (ignored by Git), unless noted.

| File | SHA-256 |
|---|---|
| `safecity-karlekar/README.md` | `3dc2339da4f8b13d2159552cac482d233e3862b39a01c59d61f852672e67daa8` |
| `safecity-karlekar/dev.csv.zip` | `83b56195237d5c89f3dabe9e40eae73b1abaa18e4d31ac2b6708b55967795f14` |
| `dataverse-VRH8ND/instruct.txt` | `4af997ebf1ae08d925c715e03611ba1597f4afbd60c7396cdd2e77ae613f465f` |
| `dataverse-VRH8ND/data1_1.tab` | `8786d245a1d284e712cd7566219341c84910c382e2064a729de6d8f4358eca8a` |
| `dataverse-VRH8ND/data3_2.tab` | `0f13b8c20fada332066cdb3aacee3f07d19fe43c95e32eb744b607cfbb0b0f80` |
| `dataverse-VRH8ND/data5_2.tab` | `46ee63ac0a59330328be4bb2ecba09a09c3be54786343beeeadf982a061b657c` |
| GODL Gazette PDF (session scratchpad) | `b338e0cfacc9cdc83a40950feaaf5ac9d2396b43d3105f99f7d494921c7e3ebe` |

No downloaded file contains names. Story texts and station names were not copied into any deliverable.
