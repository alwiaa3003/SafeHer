# District and District-Category Data Assessment

10 November 2026. Research only; no Atlas writes. Reproduce with `ncrb-research-pipeline/validate_district_data.py`.

Data (local, Git-ignored): `data/district-file-inventory.csv`, `district-unit-rows.csv`, `district-reconciliation-detail.csv`, `district-formula-checks.csv`, `district-column-labels.csv`, `district-2022-vs-table-3a2.csv`, `district-category-source-comparison.csv`.

## Conclusion

**District × year × category × registered-case data exists in official NCRB files for 2020, 2021 and 2022.** It passes every internal check, and for 2022 it matches Table 3A.2 exactly.

It is not approved for production: comparability, boundary and reuse conditions are unmet (see [the production recommendations](district-map-production-recommendations.md)). The status is not `DISTRICT_CATEGORY_DATA_NOT_AVAILABLE`, but **available, research only**.

## Files inspected

Every file was downloaded from NCRB on 10 November 2026 and sits in `docs/source-reports/retrieved-2026-11-10/`. Each has worksheet "District Data Report", with Delhi rows under "State: Delhi UT" (2014–2016) or "State: Delhi" (2020–2022).

| Year | Value columns | Total column | Footnotes | SHA-256 (first 12) |
|---|---:|---|---|---|
| 2014 | 40 | Total Crimes against Women | Source: Crime in India | `3d71c5023816` |
| 2015 | 40 | Total Crimes against Women | Source: Crime in India | `f0c049c0c052` |
| 2016 | 21 | Total Crimes against Women | Source: Crime in India | `15ac23feaa89` |
| 2020 | 52 + total | Total Crime against Women (IPC+SLL) | Source: Crime in India | `234cc32eab38` |
| 2021 | 52 + total | Total Crime against Women (IPC+SLL) | None | `6e92ac422515` |
| 2022 | 52 + total | Total Crime against Women (IPC+SLL) | "# Clarifications are pending" (Nagaland, not Delhi) | `12fc30d6247a` |

Full URLs and hashes are in `district-file-inventory.csv`.
- **Measure:** no file states incidence or victims.
- **Licence:** no explicit NCRB reuse licence.
- **2016 blanks:** the cyber-crime column is blank for every Delhi unit. Blank is treated as not available, not zero.

## Reporting units

| Years | Geographic police districts | Non-geographic units |
|---|---|---|
| 2014–2016 | 12: Central, East, IGI Airport, New Delhi, North, North-East, North-West, Outer, South, South-East, South-West, West | 7: Crime Branch, EOW, Metro, Railway, Spl Cell, SPUWAC, Vigilance |
| 2020–2022 | 16: the 12 above plus Rohini, Shahdara, Dwarka, Outer North | Same 7 |

Labels are kept exactly as printed, including "RAILWAY".

## Reconciliation

| Year | All units | Geographic | Non-geographic | Printed total | Delhi UT | Result |
|---|---:|---:|---:|---:|---:|---|
| 2014 | 15,265 | 15,036 | 229 | 15,265 | 15,319 | −54, unexplained |
| 2015 | 17,104 | 16,872 | 232 | 17,104 | 17,222 | −118, unexplained |
| 2016 | 15,295 | 14,996 | 299 | 15,310 | 15,310 | Units 15 short of printed total |
| 2020 | 10,093 | 10,036 | 57 | 10,093 | 10,093 | Exact |
| 2021 | 14,277 | 14,183 | 94 | 14,277 | 14,277 | Exact |
| 2022 | 14,247 | 14,135 | 112 | 14,247 | 14,247 | Exact |

Non-geographic units account for 0.6–0.8% of cases in 2020–2022.

- **2016:** an unlabelled second sheet lists "Delhi UT, 15". For all 36 States/UTs, that sheet's value equals the printed total minus the named units. This is consistent with cases not allocated to a named unit, but the sheet has no heading, so that meaning is not confirmed.
- **2014 and 2015:** the printed totals agree with the unit sums but fall short of the State/UT totals. No missing unit explains it, and none was forced.

## Category structure, 2020–2022

- **Formulas:** 30 printed formula checks per file, covering every women/girls split, kidnapping, ITP, cyber and POCSO totals, and the overall total. All pass for every one of the 23 units in all three years.
- **Kidnapping:** the district files print the total as `Col.11 to Col.14, Col.17 to Col.19`. That excludes the two "compel" sub-columns and includes procuration and importation, so it reconciles exactly.
- **Template residue:** the kidnapping heading also carries a stray fragment, `Col.25=Col.28+…`, which looks like template residue. It is recorded and not used.
- **No subtotals:** the files print no IPC or SLL subtotal columns.

## 2022 cross-check with Table 3A.2

The 23-unit sums of the 52 district columns were compared with the independently extracted Table 3A.2 (2022) Delhi row. The two Table 3A.2 subtotal rows were set aside, and each pair was checked for age group and section number.

- **Result:** 52 of 52 columns match.
- **Label difference:** one. The district file prints "Sec. 336 IPC" where Table 3A.2 (2022) prints "Sec. 363 IPC", for the same value of 3,773. It is kept as printed and unresolved.
- **What this shows:** the district values are registered cases (incidence) and sum to the Delhi UT category values.
- **Kidnapping:** the district kidnapping total of 3,917 matches Table 3A.2, whose own printed formula overstates it by 7. This supports reading the Table 3A.2 issue (OR-06) as a printing error.

2020 and 2021 have no checked state-level category table, so their category columns are verified only internally.

## Other candidates

| Candidate | Status |
|---|---|
| Table 3A.2 | State/UT only; not district-level |
| NCRB district files 2017–2019, 2023–2024 | None listed |
| Dataful compilation | Third party, not downloaded or compared |
| data.gov.in catalogue | Resources not retrieved |
| Mendeley | Quarantined |

## What may and may not be shown

- **Districts:** no Delhi-wide category count may be shown as a district count, and no Delhi total may be distributed.
- **Percentages:** category shares would have a valid denominator (the unit's printed total), but they are not approved.
- **Across years:** categories cannot be compared across 2014–2016 and 2020–2022, because the headings and unit systems differ.
