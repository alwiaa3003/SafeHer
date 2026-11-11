# Delhi FIR Data: Access and Permission Plan

**Status:** Plan only, 10 November 2026. Nothing has been sent or filed. Steps marked **OWNER** need the project owner's decision.

## 1. Routes

| Route | Description | Classification | Notes |
|---|---|---|---|
| A. Public FIR portal, bulk | Enumerate FIR numbers and extract occurrence places | **NOT_FEASIBLE** | Personal data at scale. The portal's purpose is supplying FIR copies. No terms permit reuse |
| B. Public FIR portal, manual structural check | The owner opens a few non-sensitive FIRs in a normal browser and records **only** the field-level features in [the sample CSV](delhi-fir-sample-assessment.csv) | **REQUIRES_LEGAL_REVIEW** | Verifies whether the place field exists and how precise it is. Never stores content (§4) |
| C. Written request to Delhi Police | An anonymised, location-generalised extract with a data dictionary and a licence | **FEASIBLE_WITH_PERMISSION** | Preferred route |
| D. RTI application to the Delhi Police PIO | A request for aggregate or anonymised information | **REQUIRES_LEGAL_REVIEW** | Personal information and investigation-related information are exempt under RTI Act s.8(1)(j) and (h); the official text was not re-read (OR-38). Aggregates are more likely to be provided than records. **OWNER** decision; not filed |
| E. NCRB | Reuse terms for district tables, and any finer published series | **FEASIBLE_WITH_PERMISSION** | NCRB publishes aggregates only |

## 2. Fields to request (route C or D)

| Field | Essential? | Note |
|---|---|---|
| Anonymised incident identifier | Essential | Not the FIR number, which could be looked up |
| Original offence head, act and section | Essential | As recorded, with IPC or BNS stated |
| Period (month or quarter) | Essential | A full date is not needed |
| Location at an approved precision: grid cell (for example 1 km) or beat or police-station jurisdiction | Essential | Generalised by Delhi Police before release |
| Police district | Essential | |
| Police station | Optional | Only if counts are suppressed below the agreed threshold |
| Place type (public place, transport, residence, workplace, online) | Useful | Allows home-based incidents to be excluded from any finer display |
| Data dictionary, and a description of the generalisation method | Essential | |
| Licence or written publication permission | Essential | Ideally the Government Open Data License – India |
| **Must not be requested** | — | Names, addresses, phone numbers, FIR text or brief, accused or victim details, exact coordinates of residences, FIR copies, any sexual-offence or POCSO record below an aggregated level |

## 3. Draft request (not sent)

> **Subject:** Request for an anonymised, location-generalised extract of registered cases for an academic project
>
> Dear Sir or Madam,
>
> SafeHer is a non-commercial BTech research project that maps officially registered crimes against women in Delhi, with full source attribution and no personal information.
>
> We request an anonymised extract of registered cases with:
> - offence head and section;
> - month and year;
> - police district;
> - a generalised location (a grid cell or beat area, as you consider appropriate);
> - a data dictionary.
>
> We do not seek names, addresses, FIR text or FIR copies. Sexual offences and POCSO cases would be shown only as aggregated counts with small numbers suppressed, consistent with BNS s.72 and *Nipun Saxena v Union of India*.
>
> We would also be grateful to know the licence under which such data could be published, and the required attribution.
>
> Yours faithfully,
> [Name, institution, supervisor]

The earlier general draft is in [the incident-level acquisition plan](incident-level-data-acquisition-plan.md), §4.

## 4. Manual structural-check protocol (route B, only if the owner and legal advice approve)

1. Use a normal browser. Do not automate. Do not use name search.
2. Look at at most 20 FIRs across several police stations and years. Skip any FIR whose sections include BNS 63–79, 124, IPC 354–354D, 376–376E or 509, or POCSO, or that involves a child.
3. For each FIR, record only the CSV fields:
   - whether a place-of-occurrence field exists;
   - which sub-fields are present;
   - the precision class (address, street or landmark, locality, direction and distance only, not stated);
   - whether it appears to be a residence;
   - whether it is generalisable.
4. Do not copy, screenshot, download or note any name, address, phone number, brief or narrative.
5. Close each FIR after recording.

## 5. Legal advice needed

1. Does extracting and republishing generalised occurrence places from publicly uploaded FIRs comply with the purpose of the 2010 Delhi HC order and *Youth Bar Association*, and with the DPDP Act?
2. Are FIR occurrence places "personal data" when they are residential addresses?
3. What generalisation and suppression thresholds would satisfy BNS s.72 and *Nipun Saxena* for non-sexual crimes against women?
4. Would an RTI request for anonymised records fall within s.8(1)(j) or (h)?
