# NCRB Table 3A.2 Validation

Research only, 10 November 2026. No Table 3A.2 row is in production.

Data: [validation matrix](data/ncrb-3a2-validation-matrix.csv), [formula checks](data/ncrb-3a2-formula-checks.csv), [page recheck](data/ncrb-3a2-page-recheck.csv), [kidnapping reconstruction](data/ncrb-3a2-kidnapping-reconstruction.csv), [crosswalk](data/ncrb-3a2-category-crosswalk.csv).

## What was checked

The 227 extracted Delhi rows were compared with an independent `pdftotext` reread of all 76 PDF pages. Page locations held: 2018 PDF 242–257, 2022 and 2023 PDF 260–275, and 2024 PDF 330–357.

| Edition | Exact pages | Partial, no contradiction | Partial, split number fragments | Contradicting pages | Cells confirmed |
|---|---:|---:|---:|---:|---|
| 2018 | 15 | 1 | 0 | 0 | 151 of 162 |
| 2022 | 15 | 1 | 0 | 0 | 161 of 162 |
| 2023 | 6 | 10 | 0 | 0 | 137 of 162 |
| 2024 | 3 | 22 | 3 | 0 | 220 of 285 |

This text method could not read every cell. In total, 669 of 771 cells were confirmed. The remainder are not contradicted but rely on the earlier coordinate-aware extraction and visual review. No reviewer sign-off is recorded (OR-11).

## Validation results

| Rule | 2018 | 2022 | 2023 | 2024 |
|---|---|---|---|---|
| EXT-1 two methods agree | PASS_WITH_NOTE | PASS_WITH_NOTE | PASS_WITH_NOTE | PASS_WITH_NOTE |
| EXT-2 checked against source | PASS_WITH_NOTE | PASS_WITH_NOTE | PASS_WITH_NOTE | PASS_WITH_NOTE |
| SUB-1 age split | PASS | PASS | PASS | PASS |
| SUB-2 explicit sub-rows | **FAIL** | **FAIL** | PASS_WITH_NOTE | PASS |
| TOT-1 | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE |
| TOT-2 | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE |
| TOT-3 | PASS | PASS | PASS | PASS |
| TOT-4 (research) | PASS | PASS | PASS | PASS |
| RATE-1 | PASS | PASS | PENDING | PASS |
| LEGAL-1 IPC + BNS = Total | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | PASS |
| LEGAL-2 BNS only from 2024 | PASS | PASS | PASS | PASS |
| LEGAL-3 mapping status | PENDING | PENDING | PENDING | PENDING |
| PROV-3 page reference | PASS | PASS | PASS | PASS |
| MISS-2 not estimated | PASS | PASS | PASS | PASS |

TOT-4 stays **PENDING in production for all records**. A research pass here does not change a production status.

RATE-1 could not be done for 2023 because the Delhi population cell was not readable by this method.

## Totals, independently recomputed

| Year | IPC/BNS | SLL | Total | Victims check |
|---|---:|---:|---:|---|
| 2018 | 11,868 | 1,772 | 13,640 | 12,201 + 1,784 = 13,985 |
| 2022 | 12,641 | 1,606 | 14,247 | 12,823 + 1,643 = 14,466 |
| 2023 | 11,688 | 1,751 | 13,439 | 11,931 + 1,763 = 13,694 |
| 2024 | 11,795 (IPC 8,505 + BNS 3,290) | 1,601 | 13,396 | 11,973 + 1,611 = 13,584 |

Neither the 2024 IPC column nor the BNS column is a full-year measure on its own.

## Kidnapping formula

NCRB prints `Col.24 = Col.27+30+33+36+39+42+51` (cases) and the equivalent for victims. Column 36 is itself printed as `Col.36 = Col.39+Col.42`, so the printed formula includes a parent and its two children.

| Edition | Metric | Printed total | Printed formula sum | Difference | Excluding Col.36 | Remaining difference |
|---|---|---:|---:|---:|---:|---:|
| 2018 | Cases | 3,715 | 3,724 | +9 | 3,714 | −1 |
| 2018 | Victims | 3,926 | 3,935 | +9 | 3,925 | −1 |
| 2022 | Cases | 3,917 | 3,924 | +7 | 3,917 | 0 |
| 2022 | Victims | 4,032 | 4,039 | +7 | 4,032 | 0 |
| 2023 | Cases | 3,970 | 3,970 | 0 | 3,970 | 0 |
| 2023 | Victims | 4,089 | 4,089 | 0 | 4,089 | 0 |

**New finding:** removing Column 36 fully reconciles 2022 and 2023, but leaves 2018 one short in both metrics. Double-counting therefore explains 2022 but does not fully explain 2018. The earlier "suspected double-counting" description should not be stated as the complete explanation for 2018.

The reconstruction is arithmetic only. NCRB's printed formula and printed values are preserved, and no column is substituted.

## Category and structural changes

- **Section label:** 2018 prints "Sec. 336 IPC", and 2022 and 2023 print "Sec. 363 IPC" at the same position. NCRB's 2020 district-file headers also print "Sec. 336 IPC". Kept as printed.
- **POCSO:** "Sexual Violence" in 2018 and 2024 headings, "Sexual Offences" in 2022 and 2023.
- **2024 additions:** separate headings for sexual harassment, disrobing, voyeurism, stalking and Sec. 69 BNS, plus separate kidnapping sub-headings.
- **Not in 2024 under the same structure:** Human Trafficking and POCSO r/w Section 377, among others.
- Rows by edition: 54, 54, 54 and 65. Printed column numbers [252]–[254] repeat in 2024.

## Crosswalk

The crosswalk has 227 rows, and every row is `not_assessed` or `not_comparable`. No IPC/BNS pair is marked comparable. A shared research code is only a link for review.

## Conditions for eventual production approval

1. A reviewer records visual sign-off for each edition (OR-11).
2. A documented decision on the 2018 and 2022 kidnapping formula, including the unexplained 2018 difference of −1.
3. A category-by-category comparability review.
4. Decided wording for rows that fail SUB-2.
5. Explicit approval for a reviewed import.
