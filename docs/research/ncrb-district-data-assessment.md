# NCRB District Data Assessment

10 November 2026. Data: [reconciliation](data/ncrb-district-reconciliation.csv), [Delhi totals](data/ncrb-district-delhi-totals.csv), [dataset comparison](data/ncrb-district-dataset-comparison.csv).

## Conclusion

**Official NCRB district-wise crimes-against-women files for Delhi exist for 2014–2016 and 2020–2022, and the 2020–2022 files reconcile exactly with State/UT totals.** A district map is still not ready, because boundary permission and a boundary date are missing.

## Official files retrieved

| Year | Units | Geographic | Non-geographic | Sum of units | Printed total | State/UT total |
|---|---:|---:|---:|---:|---:|---:|
| 2014 | 19 | 12 | 7 | 15,265 | 15,265 | 15,319 |
| 2015 | 19 | 12 | 7 | 17,104 | 17,104 | 17,222 |
| 2016 | 19 | 12 | 7 | 15,295 | 15,310 | 15,310 |
| 2020 | 23 | 16 | 7 | 10,093 | 10,093 | 10,093 |
| 2021 | 23 | 16 | 7 | 14,277 | 14,277 | 14,277 |
| 2022 | 23 | 16 | 7 | 14,247 | 14,247 | 14,247 |

- Values are registered cases by police unit, for many crime heads.
- **2020–2022 are internally consistent and match Table 3A.1.**
- **2014 and 2015 do not match State/UT totals**, falling short by 54 and 118. The reason was not established.
- **2016's named units total 15 fewer than the printed total**, and a separate sheet lists "Delhi UT, 15" without explanation.
- No district crimes-against-women file was listed for 2017–2019, or for 2023–2024.

## Reporting-unit issues

The file is police-unit based, not administrative districts.

- **Non-geographic units:** Crime Branch, EOW, Metro, Railway, Spl Cell, SPUWAC and Vigilance. They are 0.6–0.8% of 2020–2022 cases, and 1.4–2.0% in 2014–2016. They must stay off any map.
- **Unit changes:** Rohini, Shahdara, Dwarka and Outer North appear in 2020–2022, but not 2014–2016. The two periods are not one comparable series.

## Boundary compatibility

| Boundary | Finding |
|---|---|
| GSDL police districts | The 16 geographic units from 2020–2022 match the 16 GSDL names, with IGI Airport matched to AIRPORT. **A name match is not proof of equal areas.** |
| GSDL layer check | `DP_DISTRICT_BOUNDARY` metadata rechecked: EPSG:32643, no date field and an empty copyright field. |
| GSDL licence | Not confirmed as open. Permission is still needed (OR-04). |
| OSM Delhi outline | Context only. Not a police-unit boundary. |
| OSM level-5, revenue districts, census districts | A different unit system. Not compatible. |
| Wards | No ward-level crime figures found. Not compatible. |
| Police stations | No public official station-level crime figures found. |

These earlier findings were not rechecked here and remain prior project findings: 13 revenue districts since December 2025, the 272-to-250 ward change, and the GSDL police-station count concerns.

## Other datasets

| Dataset | Status |
|---|---|
| Dataful 2001–2024 | Third party, metadata only. 529,118 rows and 12 columns. No licence stated, its terms page returned 404. Delhi coverage unconfirmed. Not compared with NCRB. |
| data.gov.in district catalogue | Metadata only. Published 2013, updated 2017. Resources not retrieved. |
| Mendeley | Prior finding: quarantined pending validation. |

## What would make a district map defensible

1. Written GSDL permission and a confirmed boundary date for 2020–2022.
2. Evidence that those boundaries match NCRB's police units for those years.
3. A separate list for the seven non-geographic units.
4. Labels stating that registered counts do not measure safety.
5. No trend across 2014–2016 and 2020–2022 without a defensible unit treatment.
