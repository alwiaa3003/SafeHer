# Delhi FIR Data: Map Pilot Recommendations

**Status:** Recommendations only, 10 November 2026. No code or eligibility rule was changed. The Crime Map shows no crime markers, and must continue not to until the conditions below are met.

## 1. Precision options

| Option | Usefulness | Privacy risk | Recommendation |
|---|---|---|---|
| 1. Exact incident coordinates | Highest | Very high: often a home, school or workplace; directly victim-identifying for crimes against women | **Never** for crimes against women. For other categories, only at verified public places |
| 2. Street level | High | High: few households per street; residence inferable | Not for crimes against women |
| 3. Locality level | Moderate | Moderate to high in small localities; locality names are not standardised and need boundaries | Only with licensed boundaries and minimum counts |
| 4. Grid or area (for example a 1 km cell) | Good for spatial pattern | Low with a minimum count per cell and per period | **Most precise level recommended**, using data generalised by the source |
| 5. Police-district aggregate | Coarse but authoritative today (NCRB) | Very low | **Feasible first pilot** once GSDL and NCRB permissions are cleared |

**Never:**
- geocode a home address as a marker;
- place a marker at a police station because it is the only coordinate;
- convert direction and distance from a station into a point;
- distribute district totals across neighbourhoods;
- create synthetic coordinates.

## 2. Proposed workflow

```
Public or released record
  -> permitted extraction          (written permission or licence on file)
  -> location validation           (does the field describe the incident site? precision class)
  -> privacy review                (exclude sexual offences, POCSO, juveniles, homes, schools, shelters)
  -> geographic generalisation     (grid or area; never finer than approved)
  -> publication eligibility review (minimum counts; licence covers display)
  -> map display                   (area aggregate; a point only if every point rule passes)
```

**Human review:**
- one reviewer for extraction and validation;
- a second reviewer for privacy and eligibility;
- legal sign-off before the first publication and after any rule change.

**Always excluded:**
- BNS 63–79 and 124, IPC 354–354D, 376–376E and 509, and POCSO, except as suppressed aggregates from an official source;
- anything involving juveniles;
- court-masked cases;
- any home-based location below area level.

**Every record keeps:**
- source reference and access date;
- original category label;
- date precision and location precision;
- verification status;
- an append-only review history.

**Labelling:** every display says **"registered case (FIR) — an allegation, not a proven offence"**. No offender data is collected.

## 3. Pilots

| Pilot | Data | Status | Display |
|---|---|---|---|
| **P1: police-district choropleth** | NCRB district tables 2020–2022 (held) | **FEASIBLE_WITH_PERMISSION** (GSDL boundaries OR-04; NCRB terms OR-12) | 16 police-district areas, registered cases, with a "not a safety score" notice |
| **P2: grid aggregates of registered cases** | A Delhi Police anonymised extract (access plan, route C) | **FEASIBLE_WITH_PERMISSION**; data not yet available | 1 km cells, monthly or quarterly, minimum-count suppression, original heads |
| **P3: points for non-sensitive public-place incidents** | The same extract, if it includes verified public-place locations | **REQUIRES_LEGAL_REVIEW** | Only for public places; never for crimes against women |
| Public FIR portal extraction | — | **NOT_FEASIBLE** | — |

## 4. Recommended next implementation milestone

**P1 preparation, only after GSDL and NCRB permissions are granted:**
- a read-only aggregate layer of NCRB registered cases by police district;
- a licensed, dated boundary;
- the existing provenance and validation records;
- an explicit "registered cases, not incidents or risk" legend.

**Alongside P1:** tighten the point-eligibility contract (OR-31), so that only `INCIDENT_EXACT_COORDINATE` records at approved public places could ever be points.

Until permissions exist, the next milestone should be the owner's decision on sending the requests in the [access plan](delhi-fir-access-and-permission-plan.md). It should not be code.
