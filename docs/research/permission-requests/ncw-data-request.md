# Draft request: National Commission for Women, complaint statistics

**Status:** UNSENT DRAFT, prepared 10 November 2026. Do not send until the project owner explicitly approves it.

**Replaces:** Draft C in [the access strategy](../delhi-crime-data-access-strategy.md), §2. That draft asked only about reuse. This version adds definitions, reporting periods and units. See [the review](../safeher-permission-request-review.md), §2.3.

## What the public page shows (checked 10 November 2026)

Checked at `https://ncwapps.nic.in/frmComp_stat_Overview.aspx` with three ordinary page requests in the normal form flow. No captcha, login or other protection was involved, and no bulk download was made.

**Controls:**
- **Year:** 2000–2026, with a "Financial Year" option.
- **Report type:** Nature Wise, State Wise, or Nature Vs State.
- **State.**
- **District:** populated once a state is chosen.

**What it shows:**
- Delhi lists **15 districts**: Central, Dwarka, East, New Delhi, North, North East, North West, Outer, Outer-North, Rohini, Shahdara, South, South East, South West and West. These are the GSDL police-district names **minus AIRPORT**. That is a name match only.
- A district view returns **complaint counts by nature (category) and month**. The 2025 Central Delhi table lists 14 categories totalling 82 complaints, and most cells hold 0–3.
- The State Wise view gives Delhi a 2025 total of 2,501 complaints. Whether the district tables sum to the state total was **not checked**.
- **Terms:** the footer reads "© Copyright: National Commission for Women … All Rights Reserved". No reuse terms, category definitions, period definitions or unit definitions are shown.
- Responses were kept in the session scratchpad only; their SHA-256 hashes are in [the review](../safeher-permission-request-review.md), §5. No NCW figures were added to the repository.

## Before sending (OWNER checklist)

- [ ] Fill in the sender and supervisor details.
- [ ] **Confirm the contact route.** `ncw.nic.in` refused connections on 10 November 2026, so the contact page was not read. Check its "Contact Us" page, or the web information manager link on the statistics page.
- [ ] Do not describe NCW complaints as registered crimes anywhere in SafeHer.

---

**Subject:** Request for complaint-statistics definitions and reuse permission, for a non-commercial academic map of Delhi

To: [Office to be confirmed: Member Secretary / Complaint and Investigation Cell / Web Information Manager]
National Commission for Women, Plot No. 21, Jasola Institutional Area, New Delhi 110025

Dear Sir or Madam,

I am [name], a [programme] student at [institution], supervised by [supervisor name]. SafeHer is a non-commercial academic map of crimes against women in Delhi. It shows each source separately, with full attribution. It would present NCW figures **only as complaints received by NCW**, never as registered crimes or as a safety score, and never combined with police or NCRB figures.

The "Statistical Overview of Received Complaints" page publishes complaint counts by nature, state, district and month. Because the site states "All Rights Reserved", I am writing to ask permission and for the information needed to present the figures accurately.

1. **Historical complaint counts** for Delhi, by district, nature of complaint and month, for all years available. Please let me know if a file such as a spreadsheet or CSV can be provided, and from which year district-level figures are available.
2. **Reporting period.** Are counts based on the date a complaint was received or registered? What exactly does the "Financial Year" option change?
3. **Geographic units:**
   - How is a complaint assigned to a district: by the complainant's address, the place of the incident, or the police district handling it?
   - Do the 15 Delhi districts correspond to Delhi Police districts, and from what date?
   - Why is there no IGI Airport district?
4. **Complaint categories.** Definitions of each "nature" category, and whether a complaint can be counted under more than one category or more than once.
5. **Data dictionary.** Any notes on revisions, transfers or duplicates.
6. **Reuse and publication terms:**
   - Written permission to reproduce the district-level counts, with attribution, on a non-commercial academic website.
   - Permission to display them as a district map, and the attribution wording you require.
   - Whether the Government Open Data License – India applies.

Small counts would be suppressed. No complainant information is sought.

Yours faithfully,
[Name]
[Programme, institution]
[Supervisor: name, email]
