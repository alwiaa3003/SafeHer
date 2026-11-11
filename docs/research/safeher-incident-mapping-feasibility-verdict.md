# SafeHer Incident Mapping: Feasibility Verdict

**Date:** 10 November 2026.

**Evidence:**
- [Master inventory](exhaustive-delhi-crime-data-source-inventory.md)
- [Comparison CSV](exhaustive-delhi-crime-dataset-comparison.csv)
- [Academic research](academic-delhi-crime-dataset-research.md)
- [Access strategy](delhi-crime-data-access-strategy.md)

## Verdict

**Geolocated Delhi crime incident data exists, but none is publicly available and suitable.** It is held by:

1. **Delhi Police**, in CCTNS FIRs, the DMD "Green Diary" maps and CMAPS. Location quality is documented as weak:
   - caller locations are used as incident locations;
   - some events are plotted at the police station;
   - road-only addresses are placed at the road's midpoint;
   - an officer "would choose a nearby slum" when unsure.
2. **Academic researchers.** Garg's roughly 300,000 Delhi FIRs for 2016–2019 include occurrence descriptions, and ward geocoding is in progress. The data includes personal information and is unreleased.

**So incident mapping is not impossible.** But the realistic product is **area-level mapping of registered incidents from a custodian's data**. Points at individual sites are not realistic for crimes against women.

## Answers

| # | Question | Answer |
|---|---|---|
| 1 | Sources investigated | **58**: 32 earlier plus 26 new. Previous rounds also covered the FIR portal and 12 judgments |
| 2 | Genuinely new | **26**, E01–E26 |
| 3 | Existing Delhi incident-level dataset found? | **Yes, but restricted:** Delhi Police CCTNS, DMD and CMAPS (E01–E02); the Garg FIR dataset (E07); the PCR calls (I13, street crime) |
| 4 | Dataset with actual incident coordinates? | **None verified.** Police-held points are often caller or police-station locations (E01–E02). The PCR points are call locations, masked in the public copy |
| 5 | Locality-level incident locations? | **Yes, as text:** FIR occurrence descriptions (E07, per the paper); ward geocoding in progress, unreleased |
| 6 | Academic datasets obtainable from authors? | **Possibly:** Garg (aggregates only), and the authors of E11 and E12 (unverified). Drafts in the access strategy |
| 7 | Previously overlooked official sources? | **Yes:** the NCW complaint statistics (E04, public, women-specific, Delhi police-district units, 2000–2026); the CAG audit evidence on CMAPS (E25); the DMD (E01) |
| 8 | Which cover crimes against women? | NCRB district tables (I02); NCW (E04–E05); Garg (E07); DMD and CMAPS (E01–E02: rape, eve-teasing); Safecity and Safetipin (perception) |
| 9 | Legally reusable now? | Aggregates only: GODL-covered data.gov.in tables; CC BY research files with no incident locations (E14–E15). **No incident-level source is reusable** |
| 10 | Need written permission? | Delhi Police (E01, E02, I13); Garg (E07); Safecity; Safetipin (E13); GSDL; NCW (terms to confirm); the I14 owners |
| 11 | Best dataset for a real incident-mapping pilot | **Ward-level aggregates derived from Garg's FIR dataset** (if shared), as the earliest sub-district geography of registered crimes against women. Long term: **a Delhi Police generalised extract** with a location-source flag |
| 12 | Most realistic acquisition route | 1. Ask the researcher for ward aggregates (Draft A). 2. In parallel, make the Delhi Police request (Draft B). 3. Meanwhile, NCW district statistics (Draft C) and NCRB police-district tables give lawful area layers once terms are confirmed |
| 13 | What to build first once access is secured | The **area-layer pipeline**: `publicIncidentAreas`, server-side review checks, a choropleth with precision badges and "registered, not proven; not a safety score" notices, and the tightened point contract. Points remain disabled |

## Conditions before anything is displayed

- Written permission or a licence covering display.
- A documented location source.
- Legal advice on BNS s.72 and *Nipun Saxena* thresholds.
- Suppression of small counts.
- Separate layers for FIRs, complaints and perception data.

## Addendum, acquisition round (10 November 2026)

This addendum corrects the answers to Q4 and Q5 above. The original text is kept as a record.

- **Q4, incident coordinates:** a researcher-held dataset with **derived point coordinates** exists. The Garg corpus has 261,493 geocoded IPC FIRs for 2016–2019. They were geocoded from the FIR Place of Occurrence, and the author warns that a coordinate is not necessarily an exact address. The dataset is restricted, includes personal data, and is **not verified by SafeHer**. No public dataset with incident coordinates was found.
- **Q5, locality-level locations:** these exist as text and as researcher-derived points. **Ward counts have not been produced.**

The verdict itself is unchanged: the realistic product is area-level counts from a custodian, and there are no points for crimes against women. See the [acquisition action plan](safeher-data-acquisition-action-plan.md).
