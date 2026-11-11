# SafeHer Data Acquisition Action Plan

**Status:** Preparation only, 10 November 2026.
- **Not done:** no request sent, no contact, RTI, account, Atlas connection, import, code change or Git staging.
- **OWNER approval:** every request needs it.

**Related documents:**
- **Drafts:** [permission-requests/](permission-requests/)
- **Tracker:** [safeher-acquisition-tracker.csv](safeher-acquisition-tracker.csv)
- **Review:** [safeher-permission-request-review.md](safeher-permission-request-review.md)

## 1. Summary

| Rank | Request | Why |
|---|---|---|
| 1 | **GSDL police-district boundaries** | Every polygon layer (NCRB, NCW, Garg-by-district, Delhi Police) needs a permitted boundary. NCRB 2020–2022 district data is already held and validated, so this permission turns directly into a map |
| 2 | **Anisha Garg, area aggregates** | The only known source of sub-district geography for registered FIRs on crimes against women: 261,493 point-geocoded IPC FIRs, 2016–2019. High value, but outcome uncertain |
| 3 | **NCRB reuse clarification** | Needed for the first layer, using data already in hand |
| 4 | **Delhi Police generalised extract** | The most authoritative and recent source, but the slowest; location validity must be flagged (OR-39) |
| 5 | **NCW complaint statistics** | A women-specific district layer of complaints, not crimes. Counts are small, and the terms are "All Rights Reserved" |
| 6 | Authors of E11 and E12 (Draft D) | Data source unverified; on hold |

**Approach first:** GSDL, sent together with NCRB as the first batch. Both are low-effort clarifications, and both unblock a pilot from data SafeHer already holds.

**Send the Garg request in the same week.** It is the highest-value data request. The author is on the 2026–27 job market, so a prompt and well-scoped request matters, and offering an embargo until her publication is part of it.

**Next:** Delhi Police with an institutional covering letter, then NCW.

## 2. What each request seeks

| Request | Data | Granularity | Period | Permission sought |
|---|---|---|---|---|
| Garg | **Requested:**<br>• counts by area, year (month optional) and Table B.3 category, with IPC labels;<br>• ward identifiers and boundary reference;<br>• data dictionary;<br>• geocoding method;<br>• missing-data notes;<br>• whether withheld FIRs are included. | Ward, else 147 harmonised jurisdictions, else 16 police districts | 2016–2019 | Written permission for public display; attribution; embargo terms |
| Delhi Police | **Requested:**<br>• anonymised identifier;<br>• offence head, act and section;<br>• year and month;<br>• locality or about 1 km grid;<br>• police district, plus police station if appropriate;<br>• location precision and derivation;<br>• data dictionary;<br>• counts and coverage;<br>• missing-data and location-quality notes.<br>**Accepted instead:** aggregates. | Grid or locality; district; station | Recent years | Written permission for public visualisation; attribution; boundary effective dates |
| NCW | **Requested:**<br>• historical counts by district, nature and month;<br>• reporting-period rule;<br>• how districts are assigned;<br>• category definitions;<br>• data dictionary. | 15 Delhi districts | 2000–2026, as available | Reuse and publication terms; whether GODL applies |
| GSDL | The 16 `DP_DISTRICT_BOUNDARY` polygons | Police district | Current layer, undated | Use, reproduction, adaptation, public display, attribution, update frequency, effective dates, authority and suitability for joining |
| NCRB | Clarification for the district tables already held | Police district | 2020–2022, plus whether 2017–2019 and 2023–2024 exist | Reuse, visualisation, derived maps, attribution, whether definitions must accompany the data |

## 3. Which datasets could support a ward-level map

| Candidate | Can it? | Conditions |
|---|---|---|
| **Garg FIR dataset** | **Yes, potentially.** Points could be counted into wards by the researcher. The released product would be counts only | Researcher's agreement; ward counts do not exist yet; legal advice on the scraped corpus (§6); 2016–2019 only; IPC only; about 12% not geocoded overall, so cells are incomplete rather than zero |
| Delhi Police extract | Possibly, if generalised to locality or grid and re-aggregated | Permission; occurrence-based locations only (OR-39) |
| NCRB, NCW | **No.** District is the finest unit | Never disaggregate or interpolate |

**A ward boundary is also needed:** Census 2011 wards, MCD 2022 wards (GSDL, rights reserved), or DataMeet wards (CC BY-SA, scraped origin). This needs its own licence decision. Ask Garg which she used.

## 4. Which datasets could support a police-district map

| Candidate | Status |
|---|---|
| **NCRB district files, 2020–2022** | Held and validated; 16 geographic units match GSDL ([district recommendations](district-map-production-recommendations.md)). Blocked only by the GSDL and NCRB permissions |
| **NCW district complaints** | 15 units, which by name equal GSDL's minus AIRPORT. A separate layer only, once terms and district assignment are confirmed |
| Garg, aggregated to district | Possible fallback in the Garg request. 2016–2019 boundaries changed (the 2018 reorganisation is noted in the paper's Table B.1), so a boundary vintage must be confirmed |
| Delhi Police extract | Possible |

## 5. Permissions required

| Permission | Needed for |
|---|---|
| GSDL written permission and effective dates | Any police-district layer |
| NCRB reuse clarification, or GODL applicability | The NCRB layer |
| NCW reuse permission | The NCW layer |
| Garg written permission, plus legal advice | The Garg layer |
| Ward boundary licence | Any ward layer |
| Delhi Police written permission | The Delhi Police layer |
| OSM attribution, and a tile provider before high-traffic deployment (OR-18) | The base map |
| Legal advice on BNS s.72 and *Nipun Saxena* suppression thresholds | Display of sexual-offence categories at any area level |

## 6. Questions for an Indian lawyer (before sending the Garg or Delhi Police requests)

1. May SafeHer receive and publish area counts derived by a researcher from FIRs scraped from the public portal? This includes the paper's note that FIRs withheld from the public index were retrieved. Does excluding those FIRs remove the concern?
2. What minimum area size and count thresholds satisfy BNS s.72 and *Nipun Saxena* for sexual-offence categories?
3. Do "All Rights Reserved" footers on GSDL and NCW pages prevent use without written permission, even for non-commercial academic display?
4. Does GODL apply to NCRB publications hosted outside data.gov.in?

## 7. First pilot, conditional on access

**Trigger:** the first approved dataset plus an approved boundary. The expected first combination is NCRB 2020–2022 with GSDL districts.

### 7.1 Experience

| Element | Behaviour |
|---|---|
| Main interface | The existing Delhi map (`/`) |
| Layer selector | **One layer at a time:** "NCRB: registered cases" / "NCW: complaints received" / "Researcher FIR compilation" (only when approved). Never summed, never stacked into one number |
| Geography | Police-district choropleth (16 units). Ward only when a ward-level layer exists |
| Filters | Category with original labels per source; no cross-source mapping; IPC and BNS kept separate. Year shows only the layer's available years (NCRB 2020–2022) |
| Area selection | Panel with count, year, category label, source table and edition, precision badge ("Police district"), suppression state, and notes |
| Notices | "Registered cases, not proven offences, and not a safety score." For NCW: "Complaints received by NCW, not registered crimes" |
| Colour | Neutral single-hue sequential scale; no red ramp; legend states "count" |
| Missing and suppressed | Hatched or neutral fill labelled "Not available" or "Suppressed (fewer than N)". **Never zero and never interpolated** |
| Non-geographic units | Crime Branch, Railway, Metro and the like listed beside the map, never on a polygon |
| Points | None. No points are generated from ward or district totals |
| Rates | None. No official police-district population exists, so counts only |

### 7.2 Data rules

- Store each source layer with `populationType` (`registered_fir`, `complaint`) and `locationSource: aggregate_published`, as in [the architecture](safeher-incident-data-architecture-recommendation.md).
- The boundary becomes a dated geography version. The join uses stored unit IDs, never runtime names.
- Suppression is applied server-side. The threshold comes from legal advice (§6, question 2), and is a working placeholder until then.
- No value is created for a missing year, ward or district.

### 7.3 First implementation milestone after permission

**M1: police-district registered-case layer.**
1. Import the approved GSDL boundaries as `geographicalUnits` (`geographyType: police_district`), with source, date and hash.
2. Approve the `reportingUnitType: police_district` enum extension, then import the 2020–2022 NCRB district records already validated (the 48 total rows, plus the 2022 category rows if approved).
3. Add an API for district records, with the server-side suppression and eligibility checks.
4. Build the choropleth, layer and year controls, the area panel, notices and the unavailable state.
5. Tests:
   - the unit join;
   - no summing across sources;
   - suppressed and missing states;
   - no points;
   - accessibility (a table view of the same figures);
   - widths of 1440, 1024, 768 and 390 px.

**Later:**
- **M2:** the NCW layer, once permitted.
- **M3:** the Garg or Delhi Police sub-district layer, through `publicIncidentAreas`.

## 8. Next action

The owner reviews the five drafts, fills in the placeholders, obtains supervisor sign-off, and decides whether to send the first batch (GSDL plus NCRB, then Garg). Record each send and reply in the tracker.
