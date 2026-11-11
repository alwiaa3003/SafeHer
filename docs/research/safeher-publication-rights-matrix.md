# SafeHer publication-rights matrix

- **Date:** 10 November 2026
- **Scope:** every dataset the application uses or displays.
- **Status:** a research record, not legal advice. Uncertainty is never treated as permission.

## Classification

| # | Dataset | Source | Where it appears | Licence or permission | Status |
|---|---|---|---|---|---|
| 1 | Delhi UT annual totals of crime against women, 2016–2024 (9 records) | NCRB *Crime in India* Table 3A.1 (2018, 2022, 2024 editions); 2019 from NCRB's spreadsheet | Crime Trends (chart, table, change); Overview; Data & Sources; `/api/crimes`, `/summary`, `/trends` | No licence. NCRB's copyright statement: no reproduction "in part or in full" without prior permission | **REQUIRES_PERMISSION** |
| 2 | Delhi police-district totals, 2020–2022: 16 districts and 7 non-geographic units (69 values) | NCRB *District-wise Crime against Women* 2020–2022 | Crime Map panel, key, table; `/api/police-districts/*` | Same as 1 | **REQUIRES_PERMISSION** |
| 3 | Delhi police-district 2022 headline categories: 20 categories × 23 units (460 values) | Same as 2 | Crime Map category selector, panel, table | Same as 1 | **REQUIRES_PERMISSION** |
| 4 | NCRB category labels and table titles (labels only, no figures) | Table 3A.2 and the district files | Crime Categories page; `/api/crimes/categories`; district meta | Same statement. Short descriptive labels are unlikely to be protected, but this is not established | **REQUIRES_LEGAL_REVIEW** |
| 5 | 2020–2021 district category columns; age sub-columns; Kidnapping & Abduction group | Same as 2 | Not displayed; not in the dataset | Not validated (OR-06) | **NOT_APPROVED_FOR_PUBLICATION** |
| 6 | Table 3A.2 research extracts (2016–2024 category figures) | NCRB *Crime in India* | Not displayed; research files only | Not validated; same NCRB terms | **NOT_APPROVED_FOR_PUBLICATION** |
| 7 | Validation records and coverage gaps (SafeHer's own checks and notes) | SafeHer | Data & Sources; `/api/validation` | SafeHer's own work. Some records quote NCRB totals (see 1) | **APPROVED_FOR_PUBLICATION** for SafeHer's text; quoted figures follow row 1 |
| 8 | Delhi state outline | OpenStreetMap relation 1942586 | Crime Map outline; `/api/geography` | ODbL 1.0: attribution and share-alike | **APPROVED_FOR_PUBLICATION** with "© OpenStreetMap contributors" |
| 9 | Place search and reverse-lookup results | Nominatim (OSM data) | Crime Map search and location panel | ODbL 1.0 data; Nominatim usage policy (1 req/s, caching, identification, no autocomplete) | **APPROVED_FOR_PUBLICATION** under the usage policy; a public site may outgrow the free service |
| 10 | Base-map tiles | tile.openstreetmap.org by default; configurable | Crime Map | ODbL data. The tile service is best-effort with no SLA, and heavy use can be blocked | **APPROVED_FOR_PUBLICATION** for development and low traffic. A public launch needs a provider decision (Gate D) |
| 11 | Delhi police-district boundaries | GSDL `Delhi_Police/MapServer/0` | Local review mode only, never in production | "© All Rights Reserved"; no licence | **REQUIRES_PERMISSION**; not used publicly |
| 12 | india-geodata police-station layer | Aggregator relabelling of GSDL as CC0 | Not used | The licence chain is invalid | **NOT_APPROVED_FOR_PUBLICATION** |
| 13 | NCRB source files (xlsx, PDF) | NCRB | Not distributed; Git-ignored | Downloading is permitted by NCRB's statement; redistribution is not | **NOT_APPROVED_FOR_PUBLICATION** (local validation only) |
| 14 | SafeHer code, text and design | Project owner | Whole site | Owner's | Owner's decision |

**Result:** no NCRB figure displayed anywhere on the site is cleared for public publication. This includes the Delhi-wide totals that predate the district map.

## Facts versus tables

**What can and cannot be protected:**
- *Copyright Act 1957*, s. 2(o): a "literary work" includes "tables and compilations including computer databases". NCRB's printed tables can therefore be protected as compilations.
- Indian courts have held that facts themselves are not protected. A compilation is protected for the skill and judgment in its selection and arrangement (*Eastern Book Company v. D.B. Modak*, 2008).
- An individual registered-case count is a fact. Re-expressing a few counts in SafeHer's own layout copies less of NCRB's arrangement than reproducing a whole table.

**Why the question stays open:**
- NCRB's statement is a condition of using its website, and it asks for permission regardless of copyright subsistence.
- SafeHer reproduces complete rows: all 23 units, every validated category.
- The fair-dealing exception for private or personal use, including research (s. 52(1)(a)), is not clearly applicable to a public website.
- The exception for matter published in the Official Gazette (s. 52(1)(q)(i)) does not cover NCRB reports.
- These points need a lawyer, not more research (Gate A).

**What does not change the answer:**
- **Educational or non-commercial use:** NCRB's statement has no such exception.
- **Downloading:** NCRB's statement explicitly separates download (allowed) from reproduction (permission needed).
- **Attribution:** necessary, but not a substitute for permission.
- **GODL-India:** covers data.gov.in resources. None matches SafeHer's 2020–2022 district files or the cited Table 3A.1 editions.

## Implications of publishing without permission

- **NCRB's terms:** publication would contradict NCRB's stated terms. NCRB could ask for removal, and the project would have to comply.
- **Academic and reputational risk:** a project about responsible use of crime data would be acting against the publisher's terms.
- **Not affected:** private use, local development, supervisor review and examination demonstrations that are not public. These remain consistent with download-only use.

## How the application handles this

The site is not deployed, so nothing is published. The data stays in the repository for validation and controlled development. The NCRB files themselves are Git-ignored.

**No technical publication switch has been added.** Hiding the Delhi-wide figures would remove the core of the existing pages for a decision that belongs to the owner and NCRB. The decision gate is deployment itself (Gate E): do not deploy publicly until Gate A is resolved.

## Sources

- NCRB copyright statement (Hindi, retrieved 10 November 2026): <https://ncrb.gov.in/copyright-statement>
- GODL-India: data.gov.in footer, and the gazette text summarised at <https://en.wikipedia.org/wiki/Template:GODL-India>
- Copyright Act 1957, s. 2(o) and s. 52. A copy of the Act is hosted by the Government of Assam: <https://aasc.assam.gov.in/sites/default/files/swf_utility_folder/departments/aasc_webcomindia_org_oid_4/menu/document/copyright_act1957.pdf>. Check the current consolidated text on India Code before relying on section numbers.
- Detailed assessment: [ncrb-publication-rights-assessment.md](ncrb-publication-rights-assessment.md)
