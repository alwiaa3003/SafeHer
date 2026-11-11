# Convicted-Offender Data Assessment

**Status:** Research only. First recorded 10 November 2026 and extended the same day. No data was imported, and no Atlas connection was made.

**Companion files:**
- [Privacy and legal review](convicted-offender-privacy-and-legal-review.md)
- [Case sample (CSV)](convicted-offender-case-sample.csv)
- [Production recommendations](convicted-offender-production-recommendations.md)
- [Research progress](convicted-offender-research-progress.md)

## 1. Question

Can SafeHer obtain verified Delhi court records of convictions for crimes against women, tell final convictions apart from other outcomes, and link them to incident locations precise enough for a map, without breaking the law or source terms?

**Short answer:**
- **Case facts:** yes, for a small hand-verified sample.
- **Finality:** not verifiable today.
- **Map locations:** no.
- **Identities:** not without case-by-case legal review, and most must never be published.

## 2. Authoritative court sources

All accessed on 10 November 2026. "CAPTCHA" means the search form has one. This research never solved, bypassed or automated a CAPTCHA.

| Source | Search options | Download | Bulk or API | Access restrictions | Reuse and linking terms |
|---|---|---|---|---|---|
| **Delhi High Court**, `https://delhihighcourt.nic.in/app/case-number` | Case type, number and year (CAPTCHA). Separate pages: party name `/app/party-name-wise-judgement`, judgment date `/app/judgement-dates-wise`, neutral citation `/app/neutral-citation`, former judge `/app/former-judges-wise`. **No search by offence or section** | Individual PDF and TXT at `/app/showFileJudgment/<id>.pdf`, publicly linked; daily pronouncement lists as PDFs | None found | CAPTCHA on search; files are publicly linked | Reproduction "after taking proper permission by sending a mail"; **direct linking needs no prior permission** (asks to be informed; no framing; new window). See the legal review, §8 |
| **eCourts judgments portal (High Courts)**, `https://judgments.ecourts.gov.in/pdfsearch/` | Free text, plus filters for High Court, Act, Sections, party names, judge and judgment date (portal About page) | Per judgment, after the CAPTCHA | No official API. Third-party wrappers are not authorised sources | CAPTCHA | Acknowledge the source; no misleading or derogatory use; "for reference purposes only ... should not be ... used for any legal purposes" |
| **eCourts services (district courts)**, `https://services.ecourts.gov.in/ecourtindia_v6/` | Case status. The landing page shows search by CNR number (CAPTCHA); other case-status search options were not examined. Delhi District Courts' case-status page links here | Orders and judgments per case | None | CAPTCHA | Acknowledge; "not meant for legal evidence" |
| **Delhi District Courts**, `https://delhidistrictcourts.nic.in/` | Links to eCourts case status and NJDG statistics | Via eCourts | None | Via eCourts | "© Copyright 2026. All Rights Reserved." |
| **Supreme Court**, `https://www.sci.gov.in/judgements-case-no/` | Judgments by case number, diary number, judge and judgment date (`/judgements-diary-no/`, `/judgements-judge/`, `/judgements-judgement-date/`); case status by case number; neutral citation page (CAPTCHA) | Judgment PDFs on `api.sci.gov.in` | None found | CAPTCHA | Reproduction with acknowledgement |
| **NJDG**, `https://njdg.ecourts.gov.in/` | Aggregate pendency and disposal | No case-level outcomes | Dashboards only | Not applicable | Not applicable |
| **data.gov.in** | NCRB aggregates | No case-level court data found | The API was not accessed: the sample-key call was blocked by this session's permission check | Not applicable | Not applicable |

**Third-party bulk collections (not authoritative; not used as evidence):**
- **"Indian High Court Judgments", AWS Open Data**
  - **What it is:** judgment PDFs and metadata collected from the eCourts portal by Dattam Labs, under CC BY 4.0 (`https://registry.opendata.aws/indian-high-court-judgments/`).
  - **Caveat:** the CC BY licence covers the compiler's packaging. It does not settle the courts' own reuse terms, and its collection method has not been reviewed against those terms.
- **Development Data Lab eCourts dataset, 2010–2018**
  - **What it is:** about 80 million district-court case records, with filing and decision dates, acts and sections, and disposition, under CC BY 4.0 per its JusticeHub listing (`https://justicehub.in/dataset/e-courts-dataset-2010-2018`).
  - **Caveats:** the listing mentions party names, while DDL describes the release as de-identified; this is unresolved. It ends in 2018 and has no incident location.

**Not used as evidence:** Indian Kanoon, other judgment aggregators, news reports and social media. They were used only to find candidate case numbers.

**Access method:**
- 12 Delhi HC PDFs, each linked publicly, downloaded one at a time, 4 seconds apart.
- No portal search, CAPTCHA or login.
- Stored in `docs/source-reports/court-judgments-2026-11-10/`, which `git check-ignore` confirms is excluded from Git.

## 3. Case research

**Sample:** 12 Delhi HC judgments decided between 7 February 2025 and 10 March 2026, listed in the [CSV](convicted-offender-case-sample.csv) with neutral references `SH-CASE-01` to `SH-CASE-12`. **Redacted 11 November 2026:** appeal, trial and FIR numbers, police stations, judgment URLs and the per-case citation were removed from the committed research, because together they could indirectly identify child survivors. The unredacted record stays in the Git-ignored `docs/source-reports/` folder. Every field comes from the official PDF.

**Not recorded:**
- Names of any party, including the convicted.
- Case titles.
- Victim or witness details.
- Any place finer than the registering police station.

| Short ID | Case reference | Case number | Decided |
|---|---|---|---|
| S01 | SH-CASE-01 | SH-CASE-01 | 2025-08-12 |
| S02 | SH-CASE-02 | SH-CASE-02 | 2025-02-07 |
| S03 | SH-CASE-03 | SH-CASE-03 | 2025-08-27 |
| S04 | SH-CASE-04 | SH-CASE-04 | 2025-07-03 |
| S05 | SH-CASE-05 | SH-CASE-05 | 2025-09-24 |
| S06 | SH-CASE-06 | SH-CASE-06 | 2025-08-20 |
| S07 | SH-CASE-07 | SH-CASE-07 | 2025-06-03 |
| S08 | SH-CASE-08 | SH-CASE-08 | 2025-08-12 |
| S09 | SH-CASE-09 | SH-CASE-09 (appeal A) and 413/2018 | 2025-12-16 |
| S10 | SH-CASE-10 | SH-CASE-10 | 2025-06-26 |
| S11 | SH-CASE-11 | SH-CASE-11 | 2026-03-10 |
| S12 | SH-CASE-12 | SH-CASE-12 | 2026-02-17 |

**Evidence classification** (per person, where a case has several accused):

| Classification | Meaning used here | Cases |
|---|---|---|
| `VERIFIED_CONVICTION` | The official judgment explicitly records a conviction that **stands at the latest proceeding examined** (a Delhi HC first appeal). This is **not** a claim of finality: `appeal_status` is recorded separately | S01–S08; the SH-CASE-09 (appeal B) appellant in S09 |
| `CONVICTION_OVERTURNED` | A trial conviction set aside on appeal | S10; the two SH-CASE-09 (appeal A) appellants in S09 |
| `CONVICTION_NOT_ESTABLISHED` | No conviction exists: discharge or acquittal | S11 (discharge), S12 (acquittal affirmed) |
| `APPEAL_STATUS_UNKNOWN` | Not used as a conviction label. It applies to the `appeal_status` of **every** case, because Supreme Court status was not checked | All 12 |
| `INSUFFICIENT_EVIDENCE` | Not used. No candidate was kept on news or third-party evidence alone | None |

**Fields confirmed for each case:**
- Court, case number, trial case and FIR (where stated), and judgment date.
- Provisions, trial conviction date, sentence, number convicted and acquitted, and the HC outcome.

All of these come from the operative paragraphs, with page and paragraph references checked against the page markers in the extracted text.

**Missing or flagged:**
- **No neutral citation** is printed in any of the 12 PDFs.
- **S08:** the judgment does not name the trial court.
- **S09:** the judgment does not state the trial court, the FIR number or the sentence term.
- **S12:** prints the acquittal date as 15 December 2024 for an appeal registered in 2016. Recorded as printed and flagged.

**Bias:** the sample came from search-engine discovery. It over-represents recent appeals and POCSO cases and says nothing about conviction rates.

## 4. Conviction and appeal verification

- **Per person, not per case.** S09 shows one judgment both affirming and overturning convictions.
- **Trial convictions are not final.** In 2 of the 12 judgments, a trial conviction was set aside for at least one person.
- **Finality is unknown for everyone.**
  - A Delhi HC judgment can be challenged by special leave petition in the Supreme Court within 90 days, or later with condonation of delay.
  - Checking needs CAPTCHA-protected manual searches, which were not done.
  - Absence of a later judgment was never treated as proof.
- **Allowed statement:** "Conviction affirmed by the High Court of Delhi on [date] in [case number]; Supreme Court status checked on [date]: [finding]." Never "final" and never "convicted offender".

## 5. Geographic precision

**Classes used:**

| Class | Meaning |
|---|---|
| `EXACT_COORDINATE_VERIFIED` | The source states coordinates for the incident |
| `NAMED_LOCATION` | The source names a street, road or landmark for the incident |
| `LOCALITY_ONLY` | The source names a locality or neighbourhood, or several places with no single incident point |
| `DISTRICT_ONLY` | The only usable geography is the **police station where the FIR was registered**, from which a police district could be derived. That district is not stated in the judgment, and registration does not prove the offence happened there |
| `COURT_LOCATION_ONLY` | Only the court is identifiable |
| `NO_GEOGRAPHIC_INFORMATION` | No incident geography beyond descriptions such as "home" |

**Findings across the 12 judgments:**

| Class | Count | Cases |
|---|---|---|
| `EXACT_COORDINATE_VERIFIED` | 0 | No judgment contains coordinates. A full-text search for coordinate patterns, latitude, longitude and GPS found none |
| `NAMED_LOCATION` | 1 | S01: a locality and landmark, linked to the child's family |
| `LOCALITY_ONLY` | 1 | S05: several places, including one outside Delhi |
| `DISTRICT_ONLY` | 9 | S02–S04, S06–S08, S10–S12 |
| `COURT_LOCATION_ONLY` | 0 | |
| `NO_GEOGRAPHIC_INFORMATION` | 1 | S09: "parental home" and "matrimonial home" only |

**What the narratives describe:** in 10 of 12 cases, the incident place is a home: the victim's, the accused person's, a relative's or a shared household. Trial courts (Saket, Dwarka, Karkardooma, Tis Hazari) are court locations, never incident locations. Names such as "South-West District" in a court's title are judicial districts, not police districts.

**Display policy:**

| Class | Public display |
|---|---|
| `EXACT_COORDINATE_VERIFIED` | Never as a point if victim-linked: home, school, workplace or shelter. For a public place, only after generalisation and review. No such case exists |
| `NAMED_LOCATION` | Never as a point. A public, non-victim-linked place could appear only as a generalised area after review. S01 is victim-linked, so it is excluded |
| `LOCALITY_ONLY` | No point. Locality-level areas only in aggregate with a minimum count. No licensed locality boundaries exist |
| `DISTRICT_ONLY` | Only as an aggregate count per police district, using a licensed, dated boundary (none exists: OR-04, OR-17). Never a marker |
| `COURT_LOCATION_ONLY` | Never shown on the map |
| `NO_GEOGRAPHIC_INFORMATION` | Not mapped |

**Hard rules:**
- Never geocode a locality, landmark, police station or court and present the result as an incident point.
- No marker may come from district totals, district centroids, random or jittered coordinates, approximate geocoding, news reports, allegations or synthetic data.

## 6. Alternative incident-level data

This builds on the [alternative data source assessment](alternative-data-source-assessment.md), which covers Safecity, Delhi Police annual figures, masked PCR call data, the Delhi Statistical Handbook, Praja, the Garg FIR study, FIR PDFs and Safetipin.

| Candidate | Publisher | Coverage | Precision | Incident-level? | Personal data | Licence and access | Suitability |
|---|---|---|---|---|---|---|---|
| NCRB *Crime in India*, including district tables | NCRB | Annual | UT, city, police district | Aggregate | No | No explicit licence (OR-12) | Current basis of SafeHer; never for markers |
| Delhi Police online FIR search, `https://cctns.delhipolice.gov.in/citizen/firSearch.htm` | Delhi Police (CCTNS) | Per FIR | Police station | Yes, but allegations | Yes, names | Search by district, station, year and number. Sexual-offence FIRs are excluded from the public domain (*Nipun Saxena* direction 3; *Youth Bar Association*, secondary) | **Excluded**: allegations, not convictions; personal data; sexual offences withheld by law |
| Delhi Police GIS (police-station boundaries) | Delhi Police | Current | Station polygons | Boundaries only | No | Terms not established (GSDL, OR-04) | Boundary context only, not crime data |
| AWS "Indian High Court Judgments" | Dattam Labs, from eCourts | Bulk HC judgments | None beyond judgment text | Case-level judgments | Yes, names in judgments | CC BY 4.0 on the packaging; court terms unresolved | Not authoritative. Same location limits as §5 |
| Development Data Lab eCourts 2010–2018 | DDL, via JusticeHub | District-court cases, 2010–2018 | Court only | Case-level | Unresolved (party names listed vs "de-identified") | CC BY 4.0 per listing | Court location only, ends 2018, no incident geography. **Unsuitable** for markers |
| "FIR dataset 2015–2019" on AIKosh | Researcher dataset, mirrored by JusticeHub | Haryana FIRs (an all-women police stations study) | Police station | Yes | Unknown | CC BY 4.0 per the mirror; AIKosh page unreachable | **Not Delhi**: unsuitable |
| Mendeley "Crime Against Women Dataset for Dark Spot identification" | Independent researchers | Districts | District | Aggregate | No | See OR-15 | Aggregate only; provenance unverified |
| India Data Portal and OpenCity NCRB extracts | Third-party mirrors of NCRB | Annual | City or district | Aggregate | No | Mirror terms | Use NCRB originals instead |

**Conclusion:** no legitimate, publishable, incident-level dataset of crimes against women in Delhi with verified incident locations was found. Every candidate is one of:
- aggregate;
- allegations;
- court-located rather than incident-located;
- outside Delhi;
- restricted.

A latitude and longitude in any of these sources would not show where an incident happened unless its documentation says so, and none does.

## 7. Source limitations

1. Search is case-centric (number, party, date). Only the eCourts HC portal supports search by Act and Section, and only behind a CAPTCHA.
2. There is no official API or bulk route, so a representative sample cannot be assembled within the terms.
3. Neutral citations are missing from the PDFs, and judgments contain internal errors (S12). Every field needs human checking.
4. Finality needs the Supreme Court portal, behind a CAPTCHA.
5. Judgments describe places in narrative form, mostly homes. They are not designed to locate incidents.
6. Judgments routinely contain names that SafeHer must never copy: deceased victims, relatives and witnesses.

See [the production recommendations](convicted-offender-production-recommendations.md) for decisions.
