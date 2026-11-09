# SafeHer Data Specification

Tracked record of the approved data rules, based on Data Specification v1.0 and later project decisions. Last updated 10 November 2026.

Unresolved items are in [open-research-issues.md](open-research-issues.md). The source PDFs and the Table 3A.2 review files stay out of Git. This document records rules and decisions, not their restricted contents.

## 1. Data integrity

| Rule | Requirement |
|---|---|
| Aggregated reporting units | NCRB annual figures describe a whole reporting unit. They do not describe a place within it. |
| No distribution | Delhi-wide totals must never be divided among districts, wards, police stations or streets. |
| Cases and victims | Registered cases and victims are different measures, stored in separate fields. A victim count is never inferred from a case count. |
| Missing data | Missing values stay missing. They are never estimated, interpolated or converted to zero. A gap is a coverage record, with no numeric field. |
| Zero | A zero is stored only if NCRB printed zero. |
| Original labels | The label printed by NCRB is kept alongside any normalised label. |
| Delhi UT and Delhi City | They are separate units, are never combined in one series, and are not assumed to be equivalent. |
| Category comparability | Comparability across years or editions needs evidence. The default is `not_assessed`. |
| Interpretation | Registered counts are not individual victimisation probabilities and do not show that a place is safe or unsafe. |
| Composite scores | No composite safety or risk score may be created without a defensible research methodology. None exists in SafeHer. |
| Data layers | Official NCRB data, general street-crime data and community reports remain independently queryable and are never merged into one score. |
| Sources | Only official NCRB publications feed the primary series. No synthetic records are stored as data. |
| Privacy | No record may identify victims, accused people or private individuals. |

## 2. Primary datasets

| ID | Dataset | Table (2022–2024 numbering) | Unit | Current state |
|---|---|---|---|---|
| P1 | Annual totals | 3A.1 | Delhi UT | In production: 8 years |
| P2 | Categories | 3A.2 | Delhi UT | Research only |
| P3 | Rape detail | 3A.3, 3A.4, 3A.11 | Delhi UT | Not started |
| P4 | Outcomes | 3A.5–3A.10 | Delhi UT | Not started |
| P5 | Metro totals | 3B.1 | Delhi City and other metros | Not in production |
| P6 | Metro categories | 3B.2 | Delhi City and other metros | Not in production |
| P7 | Metro outcomes | 3B.3–3B.8 | Delhi City and other metros | Not started |

Older editions must be mapped individually because their layouts differ.

### Annual total sources

| Years | Edition | Printed unit label |
|---|---|---|
| 2016–2018 | Crime in India 2018 | Delhi UT |
| 2019 | Not obtained (expected: English Crime in India 2021) | None |
| 2020–2021 | Crime in India 2022 | Delhi |
| 2022–2024 | Crime in India 2024 | Delhi |

Approved category scope starts with 2018 and 2022–2024. The approved source plan is the 2021 edition for 2019 totals and 2021 categories, the 2019 edition for 2019 categories, and the 2020 edition for 2020 categories.

### Supplementary sources

| Dataset | Status | Condition |
|---|---|---|
| Mendeley district data (CC BY 4.0) | Quarantined | Must match NCRB head-level tables, 2019 and 2020 only |
| Kaggle masked street-crime data | Unverified | Licence, columns, timestamps and coordinates must be confirmed |
| Safecity reports | Blocked | Written permission required |

Dataful, India Data Portal, Praja, press figures, FIR PDFs and undocumented uploads are not imported.

## 3. Geospatial integrity

- OpenStreetMap relation 1942586 is contextual geography only.
- It has not been shown to match NCRB's Delhi UT or Delhi City reporting units, and must not be used to locate NCRB counts.
- Boundary records never hold crime values.
- GSDL data must not be used without permission. A queryable service does not grant a reuse licence.
- District and ward crime analysis requires compatible, validated crime data and boundaries with a known date. Revenue, census and ward units must not stand in for police districts.
- Non-geographic police units, such as Crime Branch, Metro and Railway, must never be placed on polygons.
- No coordinates, timestamps or incidents may be fabricated.
- General street-crime data, if ever used, must remain separate from women-specific NCRB data and must not be labelled as crimes against women.

The evidence is in [geospatial-data-assessment.md](geospatial-data-assessment.md) and [geographic-explorer-source.md](geographic-explorer-source.md).

## 4. NCRB and legal comparability

- IPC and BNS source distinctions are preserved. `legalRegime` takes `ALL`, `IPC`, `BNS`, `IPC_BNS_TOTAL` or `SLL`.
- IPC and BNS categories are not treated as equivalent. Matching section references alone do not establish statistical equivalence.
- In 2024, the IPC and BNS columns both cover part of the year in which the law changed. Neither is a full-year measure alone.
- Categories with no predecessor are never back-cast.
- Table 3A.2 stays research-only until its validation and production-readiness requirements are met. Extracting a table does not approve it, and holding a report does not complete a validation.
- Publication year and reporting period are distinct. A table published in the 2024 edition can cover 2022–2024.
- `crimeCategories.reportingYear` is a historical field name holding the publication year. The API returns it as `publicationYear`, with the source's `reportingPeriod`.

## 5. Validation status

| Status | Meaning | Shown in primary charts |
|---|---|---|
| `pending` | Extracted, not yet checked | No |
| `passed_automatic` | Passed automatic rules | Not until any required manual check |
| `verified` | Automatic rules and manual check passed | Yes |
| `verified_with_note` | Verified, with a documented caveat | Yes, with caveat |
| `conflict` | Editions or tables disagree | Not until reviewed |
| `failed` | A blocking rule failed | No |

All eight production annual records are `verified_with_note`. Green and the check mark are reserved for fully validated records.

## 6. Validation rules

| ID | Rule | On failure |
|---|---|---|
| PROV-1 | Every required provenance field is present | Block |
| PROV-2 | PDF hash matches the registered document | Block |
| PROV-3 | Value traceable to its table and PDF page | Block |
| SUB-1 | Age split sums to the parent total | Fail |
| SUB-2 | Sub-rows sum to their parent, only where NCRB explicitly defines them as additive | Fail |
| TOT-1 | Additive IPC/BNS categories sum to the subtotal | Fail |
| TOT-2 | Additive special-law categories sum to the subtotal | Fail |
| TOT-3 | IPC/BNS subtotal plus special-law subtotal equals the overall total | Fail |
| TOT-4 | Table 3A.2 total equals 3A.1; 3B.2 total equals 3B.1 | Conflict |
| RATE-1 | Recalculated rate matches the published rate within 0.1 | Review |
| LEGAL-1 | For 2024, IPC plus BNS equals the printed total | Fail |
| LEGAL-2 | BNS values appear only from the 2024 edition onward | Fail |
| LEGAL-3 | Every category has an IPC/BNS mapping status | Block publication |
| LEGAL-4 | Categories with no predecessor are never back-cast | Block |
| LEGAL-5 | 2024 trend charts show a legal-change marker | Block publication |
| EDIT-1 | Same statistic matches across editions | Conflict, retain both |
| UNIT-1 | Delhi UT and Delhi City are never in one series | Block |
| UNIT-2 | UT minus City is negative or unusual | Review |
| EXT-1 | Two extraction methods agree | Manual review |
| EXT-2 | Headline totals checked against the source | Required for `verified` |
| MISS-1 | Every year in a series has a value or coverage record | Block |
| MISS-2 | No statistic has an estimated or derived origin | Block |
| SUPP-1 | A supplementary value matches NCRB before promotion | Stays quarantined |

Production records currently store EXT-2 (PASS) and TOT-4 (PENDING) only. The other rules are the specification, not a claim that each has been run.

## 7. Approved Table 3A.2 research decisions

These are research results for 2018 and 2022–2024. They do not change production records.

| Rule | Decision |
|---|---|
| SUB-2, kidnapping formula | 2018 FAIL, 2022 FAIL, 2023 PASS_WITH_NOTE |
| TOT-1, TOT-2 | NOT_APPLICABLE. NCRB does not list subtotal members, and membership is not inferred from matching subtotals |
| TOT-3 | PASS for all four editions in research |
| TOT-4 | PASS for all four editions in research, not promoted to production |

NCRB's printed formula includes a parent column and its child columns. Printed values are preserved, and no alternative column is substituted. The 2018 Section 336/363 discrepancy is preserved as printed. Original Delhi and Delhi UT labels are kept separately. IPC/BNS comparability remains `not_assessed`.

## 8. Implementation notes

The original specification assumed PostgreSQL and a Python pipeline. The approved backend later moved to MongoDB and Express, with `coverageRecords` holding gaps. The data rules above were retained.

Required interface wording: the data covers registered cases, and NCRB states that more registered crime is not an indicator of a place being comparatively unsafe.

## 9. Known limitations

- Police-recorded cases only. Under-reporting is unknown.
- The Principal Offence Rule can undercount individual categories.
- NCRB data is annual, so no monthly, daily or hourly analysis is possible from it.
- 2020 was a COVID-19 year and is not a normal baseline.
- The July 2024 legal change requires caution for 2024 category comparisons.
- Population bases vary by edition, so rate comparisons need caution.
