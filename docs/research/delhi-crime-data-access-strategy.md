# Delhi Crime Data: Access Strategy

**Status:** Strategy and unsent drafts, 10 November 2026.
- Nothing was sent, filed or registered.
- No affiliation was claimed.
- Each route needs the project owner's (**OWNER**) decision.

## 1. Routes compared

| Route | Data | Precision | Coverage | Women-specific | Licence | Privacy risk | Difficulty | Rating |
|---|---|---|---|---|---|---|---|---|
| **R1** Researcher-derived aggregates (Garg, E07) | Ward-level counts by quarter and section group, derived from FIR occurrence descriptions | Ward (about 290 units), if the geocoding is complete | Delhi 2016–2019 | Yes (by section) | Researcher's terms, plus legal review | Medium (from scraped personal data) | Medium | **Most promising near-term route to existing sub-district geography** |
| **R2** Delhi Police anonymised extract (CCTNS or DMD/CMAPS) | Offence head, month, generalised location, location-source flag | Grid, beat or police-station jurisdiction | Delhi, recent | Yes | Written permission needed | Low if generalised by the police | High | **Best long-term authoritative route** |
| **R3** NCW complaint statistics (E04) | Complaint counts by nature, district and year (and month, per the mirror) | District (police-district-like) | 2000–2026 | Yes | NCW terms not reviewed; data.gov.in carries NCW state tables | Low | Low | **Immediately obtainable as aggregates**; complaints are not FIRs |
| **R4** NCRB police-district tables (held) | Registered cases, 52 categories | Police district | 2020–2022 | Yes | Unclear (OR-12) | Low | Low | Ready once licences clear |
| **R5** Authors of E11 and E12 | Unknown | Unknown | Delhi | Likely | Unknown | Unknown | Low to medium | Verify first |
| R6 Masked PCR street-crime data (I14) | Street-crime calls | Masked points | 2019–2021 | No | ND licence | Medium | Medium | Out of scope |
| R7 Safetipin audits (E13) | Perception audits | Audit points | 2013–2016 | Perception | Custom, no redistribution | Low | Medium | Context layer only, never crime |
| R8 RTI to the Delhi Police PIO | Aggregates by police station or month | Police station | Chosen years | Yes | RTI disclosure terms | Exemption risk under s.8(1)(h) and (j) (OR-38) | Medium | OWNER decision; legal advice first |

**Not acceptable:**
- scraping the FIR portal;
- obtaining raw FIRs, names or narratives;
- geocoding addresses into points;
- combining NCW complaints with NCRB cases into one count.

## 2. Unsent drafts

**Draft A: Anisha Garg, University of Warwick (R1)**

> **Subject:** Request for de-identified, area-level aggregates from your Delhi FIR research
>
> Dear Dr Garg,
>
> I am a BTech student building SafeHer, a non-commercial academic map of officially registered crimes against women in Delhi. I read *Safe Travels: Transport Development and Women's Safety in India* (2025).
>
> Would it be possible, within your data terms and ethics approval, to share only aggregated, de-identified counts? Specifically:
> - by census ward (or police station) and quarter;
> - grouped by IPC section category;
> - with cells below a small threshold suppressed;
> - with no record-level data, names, FIR numbers or text.
>
> I would cite your work and describe the counts as registered FIRs, not proven offences.
>
> If this is not possible, I would value your advice on the location field's reliability.
>
> [Name, programme, supervisor]

**Draft B: Delhi Police, Joint CP (Operations) / DMD (R2).** This builds on [the FIR access plan](delhi-fir-access-and-permission-plan.md), §3, and adds a location-source flag:

> ... We additionally request, for each generalised record, an indication of how the location was derived (FIR place of occurrence, caller location, police station, or manual plotting), so that only occurrence-based locations are displayed ...

**Draft C: National Commission for Women (R3)**

> **Subject:** Reuse of NCW complaint statistics for an academic map
>
> We seek confirmation that the "Statistical Overview of Received Complaints" may be reproduced, with attribution, as district-level counts for Delhi on a non-commercial academic website, and a description of how the district of each complaint is assigned.

**Draft D: Authors of E11 and E12 (R5)**

> **Subject:** Data source for your Delhi study
>
> Could you tell us the data source and the spatial unit used in your study, and whether any aggregated, de-identified version can be shared for academic use?

## 3. Questions for an Indian lawyer

1. May SafeHer receive and publish area aggregates derived by a third party from publicly uploaded FIRs (R1)?
2. Do NCW statistics fall under GODL or other reuse terms?
3. What minimum area and count thresholds satisfy BNS s.72 and *Nipun Saxena* for crimes against women?
4. Would an RTI request for police-station-level monthly counts by offence head be exempt?
