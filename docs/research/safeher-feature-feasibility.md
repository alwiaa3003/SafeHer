# SafeHer Feature Feasibility

10 November 2026. Machine-readable version: [data/safeher-feature-feasibility.csv](data/safeher-feature-feasibility.csv).

| Feature | Classification | Why |
|---|---|---|
| Delhi annual crime trends | FEASIBLE_NOW | Eight validated Table 3A.1 figures are in production. 2019 can follow if approved. |
| Year-over-year changes | FEASIBLE_NOW | Same table family. Descriptive only: break at missing years, flag 2020 and July 2024, and do not read as prevalence. |
| Category comparisons, single edition | FEASIBLE_WITH_ADDITIONAL_DATA | Rows are extracted, but reviewer sign-off and approval are outstanding. |
| Category trends across editions | NOT_FEASIBLE_WITH_CURRENT_DATA | All comparability is `not_assessed`, sources for several years are missing, and the 2024 structure changed. |
| Delhi versus other metros | FEASIBLE_WITH_ADDITIONAL_DATA | Table 3B.1 has not been validated for all metros. Counts only. |
| District choropleth | FEASIBLE_WITH_ADDITIONAL_DATA | Official 2020–2022 totals reconcile. Boundary permission and date are missing. |
| Police-station analysis | NOT_FEASIBLE_WITH_CURRENT_DATA | No public official station-level source found. |
| Ward analysis | NOT_FEASIBLE_WITH_CURRENT_DATA | No ward-level crime source found. |
| Hotspot analysis | NOT_FEASIBLE_WITH_CURRENT_DATA | No open incident coordinates exist for crimes against women. |
| Night/day analysis | NOT_FEASIBLE_WITH_CURRENT_DATA | NCRB is annual. |
| Crime-density analysis | NOT_FEASIBLE_WITH_CURRENT_DATA | No suitable geocoded dataset. |
| Predictive modelling | NOT_FEASIBLE_WITH_CURRENT_DATA | A short annual aggregate series cannot support credible prediction. SafeHer should not add machine learning for appearance. |

No valid spatial or temporal incident data was found.

## Optional analytics

An official **Delhi UT and Delhi City comparison over time** can be prepared as a research output. [The data](data/ncrb-delhi-ut-vs-city.csv) shows the gap between the two units narrowing from 2,059 in 2014 to 0 in 2024. It would need clear labels stating that the cause is unknown.
