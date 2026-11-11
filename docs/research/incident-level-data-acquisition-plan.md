# Incident-Level Data: Acquisition Plan

**Status:** Plan and drafts only, 10 November 2026.
- Nothing has been sent, requested, purchased or registered.
- Every step marked **OWNER** needs the project owner's decision.

**Starting point:** no eligible incident-level dataset exists ([feasibility](incident-level-data-feasibility.md)). The realistic aim is in two parts:
- **(a)** a lawful area-level layer;
- **(b)** a permission path towards generalised incident data.

## 1. Options

| Option | Source | Method | Authentication or CAPTCHA | Format | Frequency | History | Feasibility |
|---|---|---|---|---|---|---|---|
| A | NCRB district tables (I02) | Already downloaded | None | XLSX | Annual | 2020–2022 held | Held; licence unclear (OR-12) |
| B | NCRB data on data.gov.in (I03) | Portal download or API | **API key** (registration needed: OWNER) | CSV/JSON | Irregular | 2013 district file only | Licensed (GODL), but wrong years |
| C | GSDL police-district boundaries (I32) | Written permission | Permission | ArcGIS services | Undated | — | Needed for any district map (OR-04) |
| D | Delhi Police anonymised incident extract | Written request (an RTI request is a separate OWNER decision) | Permission | Unknown | Unknown | Unknown | Unknown; the only route to true incident data |
| E | Masked PCR street-crime data (I14) | Kaggle download (account: OWNER) and written permission for derived display | Account and permission | CSV | One-off | 2019–2021 | Out of scope (street crime); ND licence |
| F | Safecity aggregates (I17) | Written permission | Permission | Unknown | Continuous | Since 2012 | Separate perception layer only |

**Recommended order:**
1. **C** (GSDL permission).
2. **A or B** (NCRB licence clarity), which together give a police-district choropleth.
3. **D** (Delhi Police), as the long-term incident route.
4. **F** (Safecity), optional, as a separate layer.

E is not recommended.

## 2. Validation required before any use

- **Provenance:** publisher, URL, access date and SHA-256 recorded for every file.
- **Licence:** written terms kept with the data. No derived display without explicit permission.
- **Coordinates:** written confirmation of what each coordinate represents and how it was generalised. Points are never accepted without that documentation.
- **Categories:** original labels kept as published. IPC and BNS are never merged without a documented crosswalk (OR-07).
- **Dates:** date precision recorded (day, month or year).
- **Duplicates and missing values:** both reported. Nothing is filled or interpolated.
- **Totals:** reconciled with NCRB where the population is the same; differences explained, not adjusted.

## 3. Privacy controls

- **Never stored:** names, phone numbers, addresses, photographs or free text.
- **Location generalisation:** at least police-district or grid level for crimes against women. Victim-linked places (home, school, workplace, shelter) are always excluded from point display.
- **Small counts:** cells with very small counts are suppressed. The threshold is to be set with legal advice.
- **Separation:** incident records are kept separate from any identity information. No offender collection is created.
- **Local storage:** downloaded data stays outside Git until reuse is permitted.

## 4. Draft permission requests (not sent)

**Draft 1: Delhi Police, anonymised incident data**

> **Subject:** Request for anonymised, generalised crime-against-women data for an academic project
>
> Dear Sir or Madam,
>
> I am a BTech final-year student building SafeHer, a non-commercial academic website that presents officially registered crimes against women in Delhi with full source attribution. I request permission to receive and display an anonymised extract of registered cases with:
> - the crime head as recorded;
> - the month and year;
> - a generalised location (police station or police district only, never an address).
>
> No names, addresses or FIR documents are sought. Sexual-offence records would be shown only as counts above a minimum threshold, in line with BNS s.72 and the Supreme Court's directions in *Nipun Saxena v Union of India*.
>
> Could you advise:
> - whether such an extract can be provided;
> - under what licence;
> - whether attribution to Delhi Police is required?
>
> Yours faithfully,
> [Name, institution, supervisor]

**Draft 2: Dataset owners of "Spatio-Temporal Crime Prediction" (I14)**

> **Subject:** Licence clarification for the masked Delhi street-crime dataset
>
> Dear Dr Sinha and colleagues,
>
> Your Kaggle dataset is licensed CC BY-NC-ND 4.0. Could you confirm:
> 1. what the coordinates represent and how they were masked;
> 2. whether displaying aggregated, generalised counts derived from it on a non-commercial academic website is permitted, given the NoDerivatives term;
> 3. whether Delhi Police approval is also required?
>
> [Name, institution]

**Draft 3: Safecity (Red Dot Foundation).** This updates the earlier draft noted in OR-14.

> **Subject:** Permission to show aggregated Safecity reports for Delhi
>
> We request permission to show Delhi Safecity reports as a separate, clearly labelled community layer. It would:
> - be aggregated to areas;
> - suppress small counts;
> - include no free text;
> - never be combined with police statistics.
>
> Please advise on the terms and the attribution wording.

**Draft 4: NCRB, reuse terms**

> **Subject:** Reuse terms for Crime in India district tables
>
> Could you confirm whether the district-wise additional tables of *Crime in India* (2020–2022) may be republished on a non-commercial academic website, with attribution, and whether the Government Open Data License – India applies?

## 5. Decisions needed

1. Send drafts 1–4? Who signs them? (OWNER)
2. Register for a data.gov.in API key? (OWNER)
3. File an RTI request? Not authorised in this milestone. (OWNER)
4. Pursue the GSDL permission already drafted earlier (OR-04)? (OWNER)
