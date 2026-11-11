# SafeHer Production Data Recommendations

10 November 2026. **Update:** the 2019 recommendation was approved and applied to production on the same day. All other rows remain recommendations, and no other production record was changed. Proposed changes are in [data/safeher-production-proposals.csv](data/safeher-production-proposals.csv) and need project-owner approval.

| Candidate | Figure or category | Evidence | Rules passed | Rules pending | Comparability | Decision |
|---|---|---|---|---|---|---|
| Delhi UT total, 2019 | 13,395 registered cases | NCRB State/UT 2014–2019 xlsx, row SL 34; CII 2021 copy, Table 3A.1 p.259 | EDIT-1 with note, MISS-2, UNIT-1 | TOT-4; NCRB-hosted printed table | Same measure | **APPROVED_FOR_PRODUCTION** |
| TOT-4 result for 2018, 2022, 2023, 2024 | Check result only, no category rows | Validation matrix | TOT-3, TOT-4 research | Reviewer sign-off | `not_assessed` | **APPROVED_FOR_PRODUCTION** |
| TOT-4 result for 2021 | Check result only | Third-party-hosted copy p.275 | Value equality | NCRB-hosted report | `not_assessed` | CANDIDATE_UNVERIFIED |
| Table 3A.2 category rows | 227 rows | Research package | TOT-3, SUB-1 | SUB-2 failures, LEGAL-3, sign-off | `not_assessed` | RESEARCH_ONLY |
| Police-unit totals, 2020–2022 | 23 units per year | NCRB district xlsx | Reconciles to State/UT | Boundaries, unit handling | 2020–2022 only | RESEARCH_ONLY |
| Police-unit totals, 2014–2016 | 19 units per year | NCRB district xlsx | None for totals | Reconciliation | Different unit set | RESEARCH_ONLY |
| Delhi City totals | 2014–2024 | CII 3B.1 and NCRB city xlsx | Values read | Metro validation | Separate unit | RESEARCH_ONLY |
| Dataful, Mendeley, other compilations | Any | None against NCRB | None | Licence, reconciliation | Unknown | REJECTED |

`APPROVED_FOR_PRODUCTION` is a recommendation for you to approve. It is not an action taken.

## 2019 notes if approved

- Status `verified_with_note`, with TOT-4 pending.
- Source recorded as the NCRB additional table, not a Crime in India page.
- Printed label "Delhi", reporting unit Delhi UT.
- The coverage record for 2019 would need a deliberate update.

## TOT-4 notes if approved

- Applies to 2018, 2022, 2023 and 2024 only.
- It would not change `verified_with_note` or import any category.
- 2016, 2017 and 2020 remain pending until Table 3A.2 sources are obtained.
- Equal totals do not validate individual categories.
