# SafeHer Permission Request Review

**Status:** Review and preparation only, 10 November 2026. Nothing was sent, filed or registered, and no one was contacted. Final unsent drafts are in [permission-requests/](permission-requests/).

## 1. Drafts that existed before this review

| Draft | Location | Recipient |
|---|---|---|
| A | [access strategy](delhi-crime-data-access-strategy.md), §2 | Anisha Garg |
| B | access strategy, §2 (a one-paragraph addition) | Delhi Police |
| Earlier Delhi Police draft | [FIR access plan](delhi-fir-access-and-permission-plan.md), §3 | Delhi Police |
| C | access strategy, §2 | NCW |
| D | access strategy, §2 | Authors of E11 and E12 |
| GSDL | Referred to in OR-04 and the [geospatial assessment](geospatial-data-assessment.md), §10 | **No text found in the repository** |
| NCRB | None | — |
| Safecity | [incident acquisition plan](incident-level-data-acquisition-plan.md), §4 | Out of scope here |

The earlier drafts are left unchanged as a record. The new files supersede them for sending.

## 2. Findings per draft

### 2.1 Draft A (Garg): outdated; rewritten

**Facts, re-checked against two versions of the paper:**

| Question | Jan 2025 *Safe Travels* (hash `0b341f87…`) | 2 Nov 2026 *Eyes on the Street* (hash `42b55e6b…`) |
|---|---|---|
| Years | 2016–2019 | Jan 2016 – Dec 2019 |
| Records | "approximately 300,000" | 357,802 PDFs downloaded; 356,140 parsed (99.54%); 296,869 with a valid date and an IPC offence (the "IPC corpus") |
| Categories | Table A1: IPC sections | Table B.3: all crimes against women; harassment (294, 354, 354A–D, 509); domestic violence; non-gender street crime; theft. IPC only, so pre-BNS |
| Geocoding | "I will geocode the crime locations to census boundaries called 'wards'" | **Done, as points.** The Place of Occurrence text was geocoded with ArcGIS inside each station's jurisdiction shapefile, with a small share by hand and ambiguous matches excluded. 261,493 of 296,869 IPC reports geocoded (88.08%); harassment 91.3–94.3% by year. The author warns that a coordinate is not necessarily "an exact building address", and street centroids occur |
| Unit of analysis | Police station by day | 147 harmonised territorial jurisdictions by month (286,677 reports); 1 km station rings |
| Ward-level counts | Population only (2011 census wards overlaid on jurisdictions) | **No ward-level crime counts are reported.** Wards are not used for crime; points are binned into station rings |
| Separate from records? | Not stated | Not stated. Jurisdiction-month and ring aggregates exist inside the analysis; nothing is published |
| Shareable without personal data? | Not stated | Aggregates contain no personal data by construction. The underlying records contain names extracted by NER (2025 paper) |
| Licence or permission | None stated | **No data-availability, replication, licence or ethics statement found** |
| Data dictionary | No | Appendix B describes the pipeline. No dictionary is published |
| Delhi Police involvement | Thanks the Joint Commissioner | Thanks the Joint Commissioner of Delhi Police "for guidance on police jurisdictions and crime data" |
| Sensitive FIRs | Not stated | Table B.1 notes that retrieval "marginally exceeds" the indexed maximum "because sensitive reports omitted from the searchable index are nonetheless captured" |

**Problems with Draft A:**
1. It assumed ward geocoding was in progress. Point geocoding is complete, and ward counts do not exist yet. The request now asks for ward counts "if possible", with the 147 jurisdictions or 16 districts as fallbacks.
2. It addressed "Dr Garg". The 2026 site describes her as a PhD candidate on the 2026–27 job market, so the new draft uses her full name.
3. It lacked the required items: data dictionary, geocoding method, missing data, attribution, written permission, ward identifiers and boundary reference.
4. It did not raise the withheld sensitive FIRs. These may include sexual-offence FIRs that the portal deliberately keeps out of its index. The new draft asks whether they can be excluded, and legal advice is a precondition (action plan, §6, question 1).
5. It offered no embargo. The author has not published the data, so the new draft offers to wait until publication and to show the display first.

**Status of the facts above:** this is a fact pattern from the papers, not a statement by the researcher. Nothing implies she will share anything.

### 2.2 Delhi Police (Draft B plus the earlier draft): consolidated

**Strengths:** it excludes personal data, and it addresses BNS s.72 and *Nipun Saxena*.

**Missing pieces, now added:**
- a request for a research dataset or a research-request procedure;
- the location precision and derivation method as a field (OR-39);
- record counts and coverage;
- missing-data and location-quality documentation;
- the police station marked as conditional;
- written permission for public visualisation;
- aggregate tables as an alternative;
- boundary-date confirmation, to help resolve OR-17;
- an explicit statement that this is not an RTI application.

**Addressee:** not verified. The home page lists only general addresses. The Joint CP (Operations) is a plausible office but unconfirmed.

### 2.3 Draft C (NCW): too narrow; expanded

It asked only about reuse and how districts are assigned. The new draft adds:
- the historical counts and file format;
- reporting-period rules, including the "Financial Year" option;
- unit definitions (why there are 15 units and no Airport);
- category definitions;
- multiple counting;
- a data dictionary;
- GODL applicability.

It also records what the page actually shows (§5) and states the "All Rights Reserved" footer.

### 2.4 Draft D (authors of E11 and E12): held

It is still adequate as an enquiry, but the data source of both papers is unverified (E11 returned 403). It stays in the access strategy, unsent and ranked last.

### 2.5 GSDL: new draft

All seven required items are covered. It cites the "All Rights Reserved" footer and the disclaimer that data may come from departments "without ground-truthing". It does not assume reuse rights.

### 2.6 NCRB: new draft

It covers reuse, visualisation, derived maps, attribution and accompanying definitions, plus an optional technical question.

## 3. Rules applied to every final draft

- Unsent, with an owner checklist at the top.
- No claimed affiliation or agreement; placeholders for sender details.
- No request for names, phone numbers, addresses, accused identities, FIR text or copies.
- NCW complaints are never called crimes, and are never to be combined with NCRB or police counts.
- Each asks for written permission for public display and for the required attribution.
- Contact routes are only those actually found. Where none was verified, this is said.

## 4. Contact routes found (10 November 2026)

| Recipient | Route | Verified? |
|---|---|---|
| Anisha Garg | anisha.garg@warwick.ac.uk | Yes: printed in the 2026 paper and on the author's site |
| Delhi Police | cpdelhi@delhipolice.gov.in; delpol.service@delhipolice.gov.in; PHQ, Jai Singh Road, 110001 | General addresses only; no data or research office found |
| NCW | Plot 21, Jasola Institutional Area, New Delhi 110025, from the statistics page footer | `ncw.nic.in` refused the connection; no email verified |
| GSDL | cs.gsdl@gmail.com; (011) 2381 3287; Vikas Bhawan-II, Civil Lines, 110054 | Shown on gsdl.org.in |
| NCRB | — | Contact page certificate error; not verified |

## 5. Files read this round (scratchpad only, not in Git)

| File | SHA-256 |
|---|---|
| Garg, *Eyes on the Street* (2 Nov 2026), from `warwick.ac.uk/fac/soc/economics/staff/agarg/anisha_jmp.pdf` | `42b55e6b719f6362d9b2ed3b7c413c4967a6280179b078dc67dc7c5ea8163b25` |
| Garg, *Safe Travels* (14 Jan 2025), already held | `0b341f873bcaeed0e5a30e0167e5a87af5297f57f247162dd9f3e3936d1fc0b9` |
| NCW statistics page, default view | `6c6c1e770df3127ce41fe9fff6e66cb1ea40b504ae8935b9cae5d977ee87b250` |
| NCW, 2025 state-wise view | `46b0e7b3cfe387dee280ad9c971476d2447bc19abfa61f66621d4db32be64833` |
| NCW, 2025 Central Delhi nature-wise view | `9c60d5eeda32c91878a154aac6b511169a531a78dc13f337304aa084c3191aa1` |

Three NCW page requests were made in total, through the normal form, with no captcha, login or bypass. No figures were imported.

## 6. Corrections to earlier research

These change earlier conclusions. The earlier files are left as written; the corrections are recorded in OR-40 and OR-41 and in an addendum to [the verdict](safeher-incident-mapping-feasibility-verdict.md).
- **E07:** geocoding is **complete as points** (88%), not "ward geocoding in progress". Earlier answers to Q4 and Q5 therefore change. A researcher-held dataset with derived incident coordinates exists; it is restricted, contains personal data, and is not verified by SafeHer.
- **E04:** NCW figures **are** server-rendered in the normal page flow, by district, nature and month. They are not client-side-only. The terms are "All Rights Reserved".
