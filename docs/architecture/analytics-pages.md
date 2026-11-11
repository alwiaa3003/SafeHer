# Analytics Pages

How Crime Trends, Crime Categories and Metro Comparison use production data. Updated 10 November 2026. General checking rules are on the Methodology page and in [the data specification](../research/safeher-data-specification.md).

## Data behind each page

| Page | API requests | What it shows |
|---|---|---|
| Crime Trends | `GET /api/crimes/trends?reportingUnit=Delhi UT` (the same request as the Overview) | Nine Delhi UT annual totals, 2016–2024, and their sources and validation records |
| Crime Categories | `/api/crimes/categories`, `/api/validation?checkName=TOT-4`, `/api/crimes?reportingUnitType=state_ut` | Source labels, comparability, TOT-4 records, and whether any record has a category breakdown |
| Metro Comparison | `/api/crimes?reportingUnitType=metro_city` | Whether any metro-city records exist (currently none) |
| Data Sources & Evidence | `/api/data-sources`, `/api/validation`, `/api/geography` | Every source record, every validation record, production use derived from validation and boundary links, and the OSM licence |

## Data Sources & Evidence

- **Production use:** a source's production use comes from the validation records that reference it. The boundary source is matched to geography records by OSM element ID and version.
- **Source form:** taken from stored fields. Volume "Additional tables" marks an NCRB additional table; the word "spreadsheet" is used when its evidence file is an `.xlsx`. A recorded extract page marks a report table.
- **Missing fields:** shown as "Not recorded", never filled in.
- **Documented limitations, not database records:** the research-only list (Table 3A.2 extracts, district files, Delhi City totals, the third-party-hosted CII 2021 copy), the NCRB licence status, and the OSM tile-policy link, from `docs/research/geographic-explorer-source.md`.

No API changes were needed. All figures come from API responses, and the frontend holds no second copy of the data.

## Crime Trends statistics

All statistics apply to the selected year range and describe registered cases only.

| Statistic | Definition | What it does not mean |
|---|---|---|
| Latest recorded total | Cases in the last year of the range | — |
| Highest and lowest recorded totals | The largest and smallest annual counts; ties list every year | Not the most or least dangerous year |
| Change over the range | Last year minus first year, and as a percentage of the first | Not a trend through the years between, and not a change in victimisation |
| Year-over-year change | This year minus the year before; percentage = change ÷ year before × 100 | Not the change in actual crime |

A change is calculated only between consecutive calendar years that both have values. A missing year is shown as a break and labelled "Not available", never as zero, and the change across it is not calculated. A zero base would give no percentage.

The interpretation text is generated from these values. It names 2020 and July 2024 as context only, not as causes.

## Not calculated

- Rates, because no validated population denominators exist for this purpose.
- Trends, forecasts or smoothing beyond the printed values.
- Category shares or counts, because Table 3A.2 is research-only.
- City comparisons or rankings, because there are no approved metro-city records.

## Category and metro restrictions

- **Categories:** the four `crimeCategories` documents are source labels for annual totals, not category observations. The research findings shown (SUB-2 by edition and the approval conditions) come from `docs/research/ncrb-table-3a2-validation.md` and are labelled as research.
- **Metro:** Delhi City is a separate NCRB unit. It is never substituted for Delhi UT, and no Delhi City value is published.
- **Controls:** the planned comparison controls are disabled until compatible, validated records exist.
