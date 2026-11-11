# Delhi FIR Incident-Location Feasibility

**Status:** Research only, 10 November 2026.
- No code, data, Atlas or Git changes.
- No contact, RTI request or account.
- No raw FIR stored.

**Companion files:**
- [Sample assessment (CSV)](delhi-fir-sample-assessment.csv)
- [Access and permission plan](delhi-fir-access-and-permission-plan.md)
- [Map pilot recommendations](delhi-fir-map-pilot-recommendations.md)

**Builds on:**
- [Incident-level data inventory](incident-level-data-source-inventory.md) (I12)
- [Legal review](convicted-offender-privacy-and-legal-review.md)

## 1. Sources examined

All accessed on 10 November 2026.

| Source | What it establishes | Quality |
|---|---|---|
| Delhi Police FIR search, `https://cctns.delhipolice.gov.in/citizen/firSearch.htm` | Search fields; uploading rule; exclusion of "Sensitive" FIRs | Primary, read |
| Delhi Police RTI Manual 14 (s.4(1)(b)(xiv)), updated 6 Jul 2026, `https://delhipolice.gov.in/assets/img/rti/46870_Manual-14.pdf` (SHA-256 `8352b920d99df56e3087766dd3e4519baf0f5e4098292e868fe6202e5d1b68fb`) | FIRs uploaded "except those categorized as 'Sensitive' by the concerned Addl.DCP/DCP District", "in compliance of the order dated 6.12.2010" | Primary, read |
| Delhi Police RTI Manual 15 (s.4(1)(b)(xv)), `https://delhipolice.gov.in/assets/img/rti/58815_Manual%2015.pdf` (SHA-256 `214b93c7873a96cab5c8da18ef9a07aa3475a363d2fc2996bef4fc596b64f3c3`) | Citizen facilities: SMS look-ups for vehicles and firearms by FIR number. No FIR data service | Primary, read |
| *Court on its own motion v State*, W.P.(Crl.) 468/2010, Delhi HC, 6 Dec 2010 | Origin of the FIR-upload rule: supply of FIR copies to accused persons, and uploading | Copy located at `https://indiankanoon.org/doc/72093419/` but **not read**. The order's existence and purpose are confirmed by the portal note and Manual 14 (primary). Official copy not retrieved |
| *Youth Bar Association of India v Union of India*, (2016) 9 SCC 473, W.P.(Crl.) 68/2016, 7 Sep 2016 | National rule: upload within 24 hours; sensitive offences (sexual offences, insurgency, terrorism, POCSO) excepted; decision by an officer not below Dy.SP | Secondary only (official copy not retrieved) |
| BNSS 2023, s.173(1) (Gazette, No. 46 of 2023) | Information is entered "in such form as the State Government may by rules prescribe". The proviso lists BNS ss.64–71, 74–79 and 124 as offences reported by women that must be recorded by a woman officer | Primary, read |
| BNS 2023, s.72; *Nipun Saxena*, direction 3 | Victim identity bar; sexual-offence and POCSO FIRs "shall not be put in the public domain" | Primary, read (previous milestone) |
| Standard FIR form (IIF-I): place-of-occurrence fields | State copies reportedly list (a) direction and distance from the P.S. and beat number, (b) address, (c) police station and district if outside the limits | **Secondary only.** The Puducherry Police form and BPR&D advisory URLs returned 404 or were unreachable. **Not verified for Delhi** |

## 2. Portal findings

| Question | Finding | Evidence |
|---|---|---|
| Which FIRs are public? | All except those a DCP or Addl. DCP classes as "Sensitive" | Portal note; Manual 14 |
| Which categories are excluded? | No published Delhi list was found. A 2010 Delhi Police statement (secondary) named terrorism, national security, rape, molestation and kidnapping for ransom. *Youth Bar Association* names sexual offences, insurgency, terrorism and POCSO. *Nipun Saxena* bars public rape and POCSO FIRs | Legal review; news (secondary) |
| Search options | **(a)** district, police station, year and FIR number; or **(b)** district, police station, year, date range and the **name** of an accused, complainant or victim | Portal instructions |
| CAPTCHA, login, terms | None on the search page. No terms of use or disclaimer found | Page source |
| Downloads, API, bulk | No API or bulk facility. Per-FIR view only. Manual 14 lists none | Manual 14 |
| Search response content | JSON including FIR number, registration date and **investigation status**, plus **complainant-name and FIR-brief fields**. **Act and section fields were empty** in every result. **No place field** | Sample (§3) |
| FIR document view | `getSearchfirprint.htm?RegNo=…` returned **HTTP 200 with an empty body** to a scripted session. In headless Edge the search form did not render. **Not inspected** | Sample (§3) |
| Place-of-occurrence field in Delhi FIRs | **NOT_YET_VERIFIED.** The standard form reportedly has one, but BNSS s.173(1) leaves the format to State rules | §1 |

## 3. Controlled sample

The method used the portal's own form endpoints, 5 seconds apart, about 85 requests in total over all checks:
- 6 police stations across 6 districts, the second station listed in each district;
- years 2023 and 2025, with a two-digit and a three-digit FIR number each;
- 24 searches.

**Privacy controls:**
- Names, briefs and documents were never printed or saved.
- Only non-personal fields were recorded.
- Exact FIR numbers are not written to the CSV.

**Results:**
- **16 of 24 searches returned a record.** Number search also matches partially; for example, a two-digit query returned up to 7 results.
- **8 returned none.** That includes all four at one cyber police station. The portal response cannot tell non-existence, sensitivity or non-upload apart.
- **Category was not exposed** in any result.
- **The document view was not retrievable** by automated means, so **no place-of-occurrence field was inspected**.
- Name search was not used.

**Conclusion of the sample:** occurrence locations in public Delhi FIRs remain **unverified**. The sample establishes only what the portal exposes without opening documents.

## 4. Can the occurrence field be used?

Assuming the standard form's fields exist in Delhi FIRs, which is unverified:

| Element | Likely meaning | Usability |
|---|---|---|
| Direction and distance from the police station | Bearing and distance from the station building | Gives only a rough relative position. A point computed from it would be a **derived, invented coordinate**; not used |
| Beat number | Police beat inside the station jurisdiction | No public beat boundaries exist. Possibly usable as an area if Delhi Police supplied boundaries |
| Address of occurrence | Free-text place, often a house, shop or street | The most precise element. For crimes against women it is frequently a **home**, so publishing it is victim-identifying |
| Outside-limit police station | Jurisdiction transfer | Confirms that the registering station is not always the incident area |

## 5. Verdict

| Question | Answer | Classification |
|---|---|---|
| Can SafeHer obtain publicly accessible FIRs? | Individual non-sensitive FIRs are publicly searchable. Documents could not be retrieved by automated means, and there is no bulk route | **NOT_YET_VERIFIED** (document view) |
| Can occurrence fields be extracted lawfully? | Not established. FIRs are allegations containing personal data, uploaded so that people can obtain FIR copies. Reuse, extraction and republication terms are not published. DPDP s.3(c)(ii) applicability is uncertain | **REQUIRES_LEGAL_REVIEW** |
| Do those fields represent incident locations? | By design the field is the place of occurrence. Precision and accuracy are unverified for Delhi | **NOT_YET_VERIFIED** |
| Can locations be generalised enough to protect victims? | Yes in principle, to a grid or police district with suppression of small counts. Not for sexual offences, which are withheld anyway | **FEASIBLE_WITH_PERMISSION** |
| Can non-sensitive categories support a pilot? | The women-specific offences in BNSS s.173's proviso (BNS 64–79, 124) are the ones generally withheld. Women-relevant but non-sensitive heads (for example snatching, or dowry harassment if uploaded) cannot be identified from search results | **NOT_YET_VERIFIED** |
| Bulk extraction from the public portal for a map | Would require enumerating FIR numbers and processing personal data at scale | **NOT_FEASIBLE** (and not recommended) |
| Anonymised, generalised extract from Delhi Police | The only route to authoritative incident locations | **FEASIBLE_WITH_PERMISSION** |
| NCRB police-district aggregates | Already held. Needs a boundary licence (OR-04) and reuse terms (OR-12) | **FEASIBLE_WITH_PERMISSION** |

**Most realistic path to real incident markers:** an official, anonymised, location-generalised extract from Delhi Police under written permission, displayed as **grid or area aggregates, not points**, for crimes against women. Public FIR scraping is not a viable or responsible route.
