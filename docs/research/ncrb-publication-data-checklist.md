# NCRB police-district data: publication checklist

- **Dataset:** `backend/data/ncrb/delhi-police-district-caw.json`
- **Checked:** 10 November 2026
- **Values:** none were altered.

## Data integrity

| Check | Result | Evidence |
|---|---|---|
| Reproducible from the official files | PASS | Re-running `build_district_map_dataset.py` gave a byte-identical file (sha256 `68A13132…4C39`, before and after). |
| Source files identified | PASS | 2020 `234cc32e…`, 2021 `6e92ac42…`, 2022 `12fc30d6…`, each with its ncrb.gov.in URL and retrieval date. |
| 23 Delhi reporting units | PASS | 16 geographic and 7 non-geographic. |
| 16 geographic districts | PASS | Central, Dwarka, East, IGI Airport, New Delhi, North, North-East, North-West, Outer, Outer North, Rohini, Shahdara, South, South-East, South-West, West. |
| 7 non-geographic units | PASS | Crime Branch, EOW, Metro, RAILWAY, SPUWAC, Spl Cell, Vigilance. Stored as `police_unit_non_geographic`, never matched to a boundary, and shown only in the table under "Units not shown on the map". |
| Yearly totals reconcile | PASS | The 23-unit sum equals the printed district total and the Delhi UT total each year: 2020 = 10,093; 2021 = 14,277; 2022 = 14,247. |
| 2022 categories validated | PASS | All 20 headline categories matched Table 3A.2 in earlier research. `DIST-3A2` is recorded on every record. |
| Completeness | PASS | Every validated category and year has all 23 units: 529 values = 3 × 23 totals + 20 × 23 categories. |
| Missing values | PASS | None within validated scope. Unvalidated category-year pairs are absent, not zero, and the map shows them as "Not available". |
| Printed zeros | PASS | 298 printed zeros are kept as `0` with `originalValue: "0"`. The map gives them their own lightest fill. |
| Original NCRB labels | PASS | `categoryLabelOriginal` holds NCRB's label (e.g. "Rape (Sec. 376 IPC) > Rape (Col.24+Col.25)"). Unit labels keep NCRB's spelling (RAILWAY, Spl Cell). |
| Source references | PASS | Each record names the source key, Delhi section, row label and column number. |
| Importer refuses unsound data | PASS | It checks unit counts, unknown units or categories, unvalidated years, non-numeric values, duplicates and reconciliation (tests in `backend/tests/policeDistricts.test.js`). |
| Measure label | NOTE | The files print no incidence or victims label. Totals equal Table 3A.1 registered cases, so the values are treated as registered cases (`MEASURE_NOT_PRINTED`). |

## Display rules (verified in tests and in the browser)

- [x] Only the 2020–2022 total and the 20 validated 2022 categories are offered.
- [x] No age sub-column, Kidnapping & Abduction group, or 2020–2021 category appears.
- [x] Previous-year change uses the latest earlier validated year. A percentage appears only when the earlier figure is above 0.
- [x] Darker shades mean more registered cases. The key says this is not higher individual risk.
- [x] The three notices are in the API (`notices`) and on the Methodology page: "Registered cases, not proven offences.", "District-level statistics do not identify individual incident locations." and "Not a safety score."
  - The map key repeats the first and third.
  - The district panel carries the interpretation note: "These figures represent cases registered by police…".
- [x] There is no composite score, ranking, or safe/unsafe wording. The table is alphabetical.
- [x] Precision is always "Police district".
- [x] Registered cases are never described as all crimes committed.

## Publication status

| Item | Status |
|---|---|
| Data quality | Ready |
| Reuse rights | REQUIRES_PERMISSION ([assessment](ncrb-publication-rights-assessment.md)) |
| Atlas import | Ready, awaiting owner approval ([readiness](safeher-atlas-import-readiness.md)) |
