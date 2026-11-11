# Draft request: Anisha Garg, University of Warwick

**Status:** UNSENT DRAFT, prepared 10 November 2026. Do not send until the project owner explicitly approves it. Nothing in this draft implies that the researcher has agreed to share anything.

**Replaces:** Draft A in [the access strategy](../delhi-crime-data-access-strategy.md), §2. That draft was written from the January 2025 paper, which described ward geocoding as future work. The 2 November 2026 version reports point geocoding as complete, so the request has been rewritten. See [the review](../safeher-permission-request-review.md), §2.1.

## Before sending (OWNER checklist)

- [ ] Fill in the sender's name, programme, institution and supervisor. Do not claim an affiliation that does not exist.
- [ ] Ask the supervisor to read the request and agree to be copied.
- [ ] Get legal advice on question 1 in [the action plan](../safeher-data-acquisition-action-plan.md), §6. It covers receiving aggregates derived from scraped FIRs, including FIRs withheld from the public index.
- [ ] Re-read the latest version of the paper before sending, in case its figures have changed.
- [ ] Send from an institutional address if one is available.

**Contact route:** anisha.garg@warwick.ac.uk. This address is printed on the 2 November 2026 paper and on the author's website.

---

**Subject:** Request for de-identified, area-level counts from your Delhi FIR dataset, for a non-commercial academic map

Dear Anisha Garg,

I am [name], a [programme] student at [institution], supervised by [supervisor name, email]. I am building SafeHer, a non-commercial academic web map of officially registered crimes against women in Delhi. SafeHer's rules:
- every figure carries its source and a precision label;
- the map is never presented as a safety score;
- it never shows personal information.

I read *Eyes on the Street: Mass Transit and Women's Safety in Public Spaces* (2 November 2026). The paper describes a structured dataset built from the Delhi Police FIRs published for 2016–2019, with reported places of occurrence geocoded for 88% of IPC reports. I am writing to ask whether a small, de-identified **aggregate** derived from that work could be shared for public display, within your data terms, ethics approval and publication plans.

**What SafeHer does not need.** No individual FIR documents or records, FIR numbers, victim or complainant information, accused information, names, exact addresses, coordinates, or narrative text. SafeHer would never show individual points derived from your data.

**What I am asking for, if possible:**
1. **Counts by area and period:**
   - **Area:** by census or municipal ward, with the ward system and vintage you used. If wards are not suitable, by your 147 harmonised police jurisdictions, or by the 16 police districts.
   - **Period:** by year, and by month if you are comfortable with that.
2. **Categories:** your categories from Table B.3, with their original IPC section labels. Cells below a threshold you consider safe would be suppressed. I would suggest at least the suppression SafeHer applies itself, and sexual-offence categories could be excluded or shown only at a coarser level if you prefer.
3. **Ward identifiers and geographic reference:** the boundary file used, with its source and any licence, so that the counts can be joined without guessing.
4. **A short data dictionary** for the shared table.
5. **The geocoding method, in as much detail as you are comfortable sharing:**
   - how the Place of Occurrence text was matched;
   - the share geocoded by hand;
   - how ambiguous and street-centroid matches were handled.
6. **Missing data:**
   - geocoding coverage by year, category and area;
   - reports without a usable place of occurrence;
   - units excluded, such as metro, railway and specialised cells.

   This lets SafeHer show where the counts are incomplete instead of implying zero.
7. **Coverage of withheld FIRs.** Whether the corpus includes FIRs withheld from the portal's public index. If it does, could they be excluded from anything shared?
8. **Your attribution requirements**, and any embargo until your paper is published.
9. **Written permission** stating the scope under which SafeHer may display the shared counts publicly on a non-commercial website.

SafeHer would describe the figures as "FIRs registered by Delhi Police, 2016–2019, as compiled and geocoded by Anisha Garg (University of Warwick)". They would not be described as proven offences, a measure of risk, or a substitute for your analysis. I would be glad to show you the display before anything goes online, and to remove it at your request.

I understand completely if this is not possible. If so, I would still value any advice on how reliable the Place of Occurrence field is for mapping at the area level.

Thank you for your time, and congratulations on the paper.

Kind regards,
[Name]
[Programme, institution]
[Supervisor: name, email]
[Project page, if any]
