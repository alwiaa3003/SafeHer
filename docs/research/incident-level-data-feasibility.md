# Incident-Level Crime Mapping in Delhi: Feasibility

**Status:** Research assessment, 10 November 2026. Evidence is in the [source inventory](incident-level-data-source-inventory.md) and the [candidate comparison](incident-level-data-candidate-comparison.csv).

## 1. Answer

**No.** With currently accessible and legally reusable data, SafeHer cannot show genuine, geographically meaningful incidents of crimes against women across Delhi.

Of 32 candidates assessed, **none supports public map markers**.

| What a candidate offers | Candidates | Why it fails |
|---|---|---|
| Incident-level points | 1 (I13, raw PCR calls) | Restricted; street crime, not crimes against women; reported call locations |
| Incident records located only by police station | 6 (I11, I12, I15, I20, I21, I25) | Allegations with personal data, unreleased, outside Delhi, or court judgments |
| Aggregates (district, city or UT) | 11 | Not incidents |
| Community or perception data | 4 | Not registered crime; permission needed or no location |
| Not incident-level, or unknown | 10 | Court documents, articles, or undocumented provenance |

## 2. Why

1. **Authority versus availability.** The only point-level police data (PCR calls) is released solely by permission. Its masked public copy (I14) carries CC BY-NC-ND 4.0, which forbids sharing adapted material such as map markers.
2. **Coordinate meaning.** Every public coordinate examined marks a police station, district, review zone or reported call location, never a verified incident site (I13, I21, I23, I24).
3. **Law.** For sexual offences, FIRs are withheld from the public domain, and identifying a victim "even in a remote manner" is barred (*Nipun Saxena*; BNS s.72; POCSO s.23). Exact locations of crimes against women, mostly homes in the court sample, are victim-identifying.
4. **Licences.** NCRB's own site has no explicit licence (OR-12). The GODL route exists only for tables published on data.gov.in, and none was found for 2020–2022 district data.

## 3. Best sources by role

| Role | Best source | Use | Limits |
|---|---|---|---|
| **Primary** | NCRB district tables 2020–2022 (I02) | Area-level registered-case counts by police district, research only | Aggregate; needs a licensed boundary (OR-04) and a licence (OR-12) |
| **Supplementary** | NCRB via data.gov.in under GODL (I03) | A clearly licensed copy of aggregates where it exists | No 2020–2022 district resource found |
| **Academic** | Masked Delhi PCR records (I14), with the paper (I13) | Methodological reference only | ND licence; street crime; masked; not inspected |
| **Community** | Safecity (I17) | A separate, permission-based perception layer, never counted as crime | Written permission; self-selected; privacy risk |

**No source qualifies for markers**, so no "best marker source" is named.

## 4. Can sources be combined?

| Proposed join | Matching key | Evidence of compatibility | Verdict |
|---|---|---|---|
| NCRB district tables + GSDL police-district boundaries | Police-district name | 16 names pair one-to-one, with area checks (OR-17) | **Feasible technically**; blocked by permission (OR-04) |
| NCRB district tables + court judgments | Registering police station → police district | No case-level key in NCRB; judgments are a non-representative sample | **Not valid**: different populations |
| NCRB + Safecity | None | Different populations (registered cases vs self-reports) | **Never combine counts** |
| Masked PCR + NCRB | None | Calls vs FIRs; street crime vs crimes against women | **Not valid** |
| IPC-era and BNS-era categories | A legal and statistical crosswalk | None documented (OR-07) | **Do not merge** |

## 5. Feature feasibility

| Feature | Decision |
|---|---|
| Red incident markers for crimes against women | `NOT_RECOMMENDED` with current data |
| Police-district choropleth of NCRB registered cases (2020–2022) | `REQUIRES_LEGAL_REVIEW`: needs GSDL permission and an NCRB licence |
| Separate Safecity perception layer | `REQUIRES_LEGAL_REVIEW`: needs written permission and aggregation |
| Street-crime point layer from masked PCR data | `NOT_RECOMMENDED`: ND licence; out of scope |
| Location panel stating "no incident data" (current) | `APPROVED_FOR_PROTOTYPE`: already implemented |

## 6. What would change the answer

1. **A Delhi Police or NCRB release** of anonymised incident records with:
   - documented location generalisation (for example, a grid or beat, never a home);
   - category labels and dates;
   - an open licence such as GODL.
2. **Written permission** from the I14 dataset owners and Delhi Police to display derived, generalised street-crime aggregates. This would still not cover crimes against women.
3. **Written permission from Safecity** for aggregated community reports, shown as a separate layer.
4. **GSDL permission plus NCRB licence clarity.** Together these would give a lawful police-district choropleth of registered cases: the closest credible alternative to markers.
