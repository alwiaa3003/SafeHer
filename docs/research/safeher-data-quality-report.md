# SafeHer Data Quality Report

10 November 2026. Produced with `docs/research/ncrb-research-pipeline/`. Pandas, Matplotlib and SciPy are not installed and were not added, so the checks use standard-library Python and no charts were produced.

## Starting production state

Eight annual Delhi UT figures, all `verified_with_note`, with TOT-4 pending. 2019 is held as a coverage record. Values were not changed.

## Results

| Check | Result |
|---|---|
| Missingness | 2019 is the only gap in 2016–2024. It remains missing in production. |
| Duplicates | No duplicate category codes per edition. No duplicate Delhi police units per year. |
| Invalid values | No non-numeric cells or blanks in the 227 Table 3A.2 data rows. Zeros are printed zeros: 15, 13, 15 and 17 rows by edition. |
| Reporting-unit labels | Printed "Delhi UT" in 2016–2018 Table 3A.1 and "Delhi" elsewhere. Table 3A.2 prints "Delhi" throughout. |
| Year coverage | Annual: 2016–2024 with 2019 outstanding. Table 3A.2: 2018 and 2022–2024. District: 2014–2016 and 2020–2022. |
| Source provenance | Local PDF hashes recorded. 3A.1 extract hashes still match metadata. |
| Arithmetic | TOT-3 passes all four editions for cases and victims. 2024 IPC + BNS = Total on all 45 rows. |
| Cross-edition | 15 annual comparisons across editions match, with no production mismatch. |
| Cited report pages | The recorded full-report pages (241, 259, 329) carry the expected Delhi figures. |
| Rates | Printed rates recompute within 0.1 for 2018, 2022 and 2024. 2023 could not be read. |

## Comparability

| Issue | Effect |
|---|---|
| 2024 legal transition | Category comparison needs caution. IPC and BNS are not assumed equivalent. |
| Section labels and POCSO wording change | Preserved as printed. |
| Police unit changes | 2014–2016 and 2020–2022 are not one series. |
| UT minus City gap | 2,059 (2014), 2,456, 1,507, 1,534, 1,916, 493 (2019), 311, 295, 89, 73, 0 (2024). The cause is unknown. |

## Reconciliation limits

- 2014 and 2015 district files fall short of State/UT totals by 54 and 118.
- 2016 named units total 15 less than the printed total.
- 2018 kidnapping leaves −1 after removing the duplicated parent column.
- The all-India 2019 total differs between two sources, while Delhi agrees.

No missing value was interpolated, no outlier was removed, and no per-capita analysis was added. A change in registered cases is not a direct change in crime prevalence.
