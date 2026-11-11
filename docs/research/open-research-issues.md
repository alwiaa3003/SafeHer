# SafeHer Open Research Issues

Unresolved limitations as of 10 November 2026, with closed items kept as a record. An item closes only when its resolution evidence is recorded. Rules are in [safeher-data-specification.md](safeher-data-specification.md).

## OR-01. 2019 NCRB source not obtained

- **Status:** Open. 2019 is `missing_pending_source`.
- **Evidence available:** The held 3A.1 extracts cover 2016–2018 and 2020–2024. The approved expected source is the English Crime in India 2021.
- **What would resolve it:** Obtain that official edition, record its hash, and check the printed Delhi value and label.
- **Must not be claimed:** Any 2019 figure, estimate or complete 2016–2024 series.
- **Production update (10 November 2026):** Closed for production. Delhi UT 2019 = 13,395 was re-verified and added with status `verified_with_note` and TOT-4 pending. Still not to be claimed: that an NCRB-hosted Crime in India 2021 table was checked, or that the all-India 2019 difference is explained.
- **Research update (10 November 2026):** Partially resolved. Official NCRB file gives Delhi 2019 = 13,395, and a third-party-hosted copy of CII 2021 Table 3A.1 agrees. Not in production; needs approval. NCRB-hosted printed table still not held. See ncrb-2019-investigation.md.

## OR-02. TOT-4 pending for all eight production records

- **Status:** Open. EXT-2 is PASS and TOT-4 is PENDING for 2016–2018 and 2020–2024.
- **Evidence available:** Research TOT-4 passes for 2018, 2022, 2023 and 2024 but has not been promoted. Table 3A.2 sources for 2016, 2017, 2020 and 2021 have not been obtained.
- **What would resolve it:** Obtain the missing sources, then make an approved production update for each year.
- **Must not be claimed:** That any production record is fully validated, or that research results changed a production status.
- **Research update (10 November 2026):** Partially resolved in research only. TOT-4 passes for 2018 and 2022-2024, and is corroborated for 2021 from a third-party-hosted copy. 2016, 2017 and 2020 lack sources. **Production remains PENDING for all eight records.**

## OR-03. NCRB district-level data not retrieved or validated

- **Status:** Open.
- **Evidence available:** NCRB lists "District Wise Reports", but results load dynamically and were not retrieved. Third-party compilations exist and are not official sources.
- **What would resolve it:** Retrieve official Delhi tables, record units and years, separate non-geographic police units, and validate them.
- **Must not be claimed:** Any district, ward or police-station crime figure, ranking, risk or safety conclusion.
- **Research update (10 November 2026):** Partially resolved. Official district files retrieved for 2014-2016 and 2020-2022; 2020-2022 reconcile exactly with State/UT totals. None listed for 2017-2019 or 2023-2024. See ncrb-district-data-assessment.md.
- **District investigation (10 November 2026):** Data side largely resolved for 2020-2022: official district files reconcile exactly with Delhi UT, all printed formulas pass, and 2022 category sums match Table 3A.2 for 52 of 52 columns. 2014-2015 do not reconcile; no files exist for 2017-2019 or 2023-2024. Still not approved: see district-map-production-recommendations.md.

## OR-04. GSDL permission not established

- **Status:** Open. A permission request was drafted. No sending or reply is recorded.
- **Evidence available:** GSDL services state no open licence, and its website says All Rights Reserved.
- **What would resolve it:** Written permission and confirmation of each layer's date.
- **Must not be claimed:** That GSDL layers are licensed for SafeHer, or that they match NCRB units by name.
- **Research update (10 November 2026):** Blocked by permission. No reply or permission recorded. The layer's metadata has no date field and no copyright text.
- **District investigation (10 November 2026):** Still blocked. GSDL's police-district layer is technically compatible (16 polygons, area within 0.1% of the OSM outline, 99.7% single coverage), but the site states All Rights Reserved and the layer has no date or licence.
- **Implementation update (10 November 2026):** The police-district map is implemented, but GSDL geometry is not published. The boundary endpoint returns no features, and the public map shows the figures as a table (OR-45).
- **Acquisition-round update (10 November 2026):** The earlier "drafted" request text was not found anywhere in the repository. A new draft covers permission, adaptation, public display, attribution, update frequency, effective dates and authority ([GSDL request](permission-requests/gsdl-boundary-permission-request.md)). GSDL's home-page disclaimer says its data may come from departments "without ground-truthing". Unsent; ranked first in the [tracker](safeher-acquisition-tracker.csv).

## OR-05. Table 3A.2 not approved for production

- **Status:** Open. Research only for 2018 and 2022–2024.
- **Evidence available:** Delhi rows were extracted and reviewed, with results in ignored local folders.
- **What would resolve it:** Resolve or formally accept OR-06 and OR-07, then give explicit approval and a reviewed import.
- **Must not be claimed:** Category figures as validated production data. Extraction is not approval.
- **Research update (10 November 2026):** Still open. 227 rows rechecked with no contradiction across 76 pages, but sign-off, comparability and the kidnapping decision are outstanding.

## OR-06. Kidnapping formula in Table 3A.2

- **Status:** Open. SUB-2 is FAIL for 2018 and 2022, and PASS_WITH_NOTE for 2023.
- **Evidence available:** The printed formula includes Col.36 and its child columns 39 and 42. Procuration and Importation sit under the heading but are outside the printed formula in 2018–2023.
- **What would resolve it:** An NCRB clarification, or a documented treatment approved for publication.
- **Must not be claimed:** A corrected kidnapping total, or that the cause is confirmed. Double-counting is suspected only.
- **Research update (10 November 2026):** Still open. Reconstruction shows that removing Col.36 reconciles 2022 and 2023, but 2018 remains 1 short in cases and victims, so double-counting does not fully explain 2018.
- **District investigation (10 November 2026):** New evidence: the 2022 district file prints a kidnapping formula that excludes the compel sub-columns, and its total equals Table 3A.2's printed total. This supports a printing error in Table 3A.2's formula, not a data error. 2018's remaining -1 is not explained.

## OR-07. IPC/BNS and cross-edition comparability

- **Status:** Open. Comparability is `not_assessed` for every category.
- **Evidence available:** Printed section references. In 2024 some headings differ, Sec. 69 BNS has no printed earlier equivalent, and Human Trafficking and POCSO r/w Section 377 do not appear.
- **What would resolve it:** A category-by-category review with evidence.
- **Must not be claimed:** That IPC and BNS categories are equivalent, or any cross-year category trend.
- **Research update (10 November 2026):** Still open. The crosswalk marks every row not_assessed or not_comparable.

## OR-08. Category data for other years

- **Status:** Open. Approved scope is 2018 and 2022–2024.
- **Evidence available:** Each edition's category table covers its own year only.
- **What would resolve it:** Obtain the 2019, 2020 and 2021 editions, and the 2016 and 2017 editions if those years are required.
- **Must not be claimed:** Category coverage for any other year.
- **Research update (10 November 2026):** Still open. Corroboration for 2021 exists in a third-party-hosted copy only.

## OR-09. 2024 Delhi UT and Delhi City equality

- **Status:** Open and unexplained. Both totals are identical for 2024.
- **Evidence available:** Printed tables. Records keep the figures independently, and 2024 carries the caveat.
- **What would resolve it:** An NCRB explanation of unit definitions or the 2024 data.
- **Must not be claimed:** That the units are equivalent, or that either figure is an error.
- **Research update (10 November 2026):** Still open. UT minus City narrowed from 2,059 (2014) to 0 (2024); the cause is unknown.

## OR-10. Full-report PDF pages not rechecked

- **Status:** Open. `pdfPageStatus` is `not_independently_rechecked` on all eight records.
- **Evidence available:** Values were checked against hashed one-page extracts. Full volumes for 2018, 2022, 2023 and 2024 are held.
- **What would resolve it:** Check each cited page in the full report and record the result.
- **Must not be claimed:** That the cited full-report pages are confirmed.
- **Research update (10 November 2026):** Partially resolved. Pages 241, 259 and 329 carry the expected figures. Production metadata remains not_independently_rechecked until updated.

## OR-11. Table 3A.2 review items

- **Status:** Open. Completion of the reviewer's visual spot-check is not recorded.
- **Evidence available:** Coordinate-aware extraction agreed with rendered pages in a single pass. The 2018 pages do not print the I/V/R legend, so its meaning is read from later editions. Printed anomalies are preserved.
- **What would resolve it:** A recorded reviewer sign-off for each edition.
- **Must not be claimed:** That the extraction has been independently double-checked.
- **Research update (10 November 2026):** Partially resolved. An independent reread confirmed 669 of 771 cells with no contradiction. Reviewer sign-off is still not recorded.

## OR-12. NCRB reuse licence

- **Status:** Open. No explicit licence has been found.
- **Evidence available:** NCRB publications were reviewed for reuse terms without finding one.
- **What would resolve it:** A published licence or written permission.
- **Must not be claimed:** That NCRB PDFs may be redistributed. They stay out of Git.
- **Research update (10 November 2026):** Still open. NCRB's copyright page could not be opened (certificate error).
- **Research update (10 November 2026, incident-data round):** Partial route found, not a resolution. data.gov.in states that its content is "licensed under the Government Open Data License-India" (Gazette No. 42, 13 February 2017). The licence permits use, adaptation and publication with attribution, and excludes personal or sensitive data. The only district crimes-against-women resource found there is for 2013; none was found for 2020–2022. The NCRB files SafeHer holds therefore remain without an explicit licence.
- **Acquisition-round update (10 November 2026):** A clarification request has been drafted ([NCRB request](permission-requests/ncrb-data-reuse-clarification.md)). It asks about reuse, visualisation, derived maps, attribution and accompanying definitions. Unsent; the NCRB contact page failed on a certificate error, so the route is unverified.
- **Production-readiness update (10 November 2026):** the copyright statement has now been read, which changes the status from "no licence found" to "permission required by NCRB's own terms".
  - **Source:** `ncrb.gov.in/copyright-statement` (Hindi only; the English page failed).
  - **Wording:** material "should not be copied/reproduced, in part or in full, without the prior permission of the Bureau". It may be downloaded without permission. It may not be used in a misleading or objectionable context. Any other use is subject to the Bureau's permission.
  - **GODL route:** still applies only to data.gov.in resources, and no 2020–2022 district-wise resource exists there.
  - **Classification:** every publishable district data group is REQUIRES_PERMISSION. Whether bare figures are protected at all is REQUIRES_LEGAL_REVIEW. The same condition applies to the Delhi-wide Table 3A.1 figures already displayed.
  - **Contact:** NCRB's address on that page is `dct[at]ncrb[dot]gov[dot]in`.
  - **Assessment:** [NCRB publication-rights assessment](ncrb-publication-rights-assessment.md).
  - **Status:** open, awaiting the owner's decision to send the clarification request or seek legal advice.
  - **Must not be claimed (added):** that SafeHer has permission to reproduce NCRB figures publicly.
- **Completion-round update (10 November 2026):**
  - **Rights matrix:** covers every dataset in use ([publication-rights matrix](safeher-publication-rights-matrix.md)). No displayed NCRB figure is cleared for public publication.
  - **Draft request:** the NCRB request is now a permission request naming each affected display. It is unsent.
  - **Status:** open, at Gate A (owner decision).

## OR-13. Masked Delhi street-crime dataset

- **Status:** Unverified.
- **Evidence available:** Listed on Kaggle behind a login. It covers snatching and robbery, drawn from calls rather than FIRs.
- **What would resolve it:** Confirm licence, columns, timestamps and whether coordinates are real.
- **Must not be claimed:** Any link to crimes against women, or any hotspot result.
- **Research update (10 November 2026):** Still open. Not inspected in this round.
- **Research update (10 November 2026, incident-data round):** The licence is now known, but the contents are still uninspected. Kaggle API metadata for `ankurzing/spatio-temporal-crime-incidents` gives the licence as "Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)", with one file, `crime_prediction_dataset.csv` (2,100,830 bytes). The source paper (arXiv 2602.23750) says its coordinates are call-attendant entries or geocoded addresses, masked by an undisclosed method, and that the raw data was obtained with Delhi Police permission. The NoDerivatives term bars sharing derived markers. Rejected for SafeHer display unless written permission is given ([incident inventory](incident-level-data-source-inventory.md), I14).

## OR-14. Safecity permission

- **Status:** Blocked. A permission request was drafted. No sending or reply is recorded.
- **Evidence available:** Written permission is required. Reports are self-selected and carry a high privacy risk.
- **What would resolve it:** Written permission with agreed aggregation and privacy terms.
- **Must not be claimed:** That Safecity data is official, representative or available to SafeHer.
- **Research update (10 November 2026):** Blocked by permission. No public request process was found.
- **Research update (10 November 2026, incident-data round):** Still blocked. The public research splits derived from Safecity (`swkarlekar/safecity`) were inspected. The 990-record dev split has only story text and three labels, with no location or date, and 50 duplicate texts. The README says "for research purposes only" and asks users to contact Safecity for permission. An updated, unsent draft is in [the acquisition plan](incident-level-data-acquisition-plan.md), §4.

## OR-15. Mendeley district data

- **Status:** Quarantined.
- **Evidence available:** A CC BY 4.0 third-party compilation with Delhi rows for 2019 and 2020 and no overall total column.
- **What would resolve it:** Category-by-category validation against official NCRB tables.
- **Must not be claimed:** That it is an NCRB source or suitable for the primary analysis.
- **Research update (10 November 2026):** Still open. Not validated in this round.

## OR-16. Delhi boundary and unit identity

- **Status:** Open.
- **Evidence available:** OSM relation 1942586 was checked for identity, tags, licence and geometry. Its match to NCRB units is untested. "National Capital Territory" wording is inferred from ISO code IN-DL, as the relation's name tag is "Delhi".
- **What would resolve it:** An authoritative definition of each NCRB unit's extent.
- **Must not be claimed:** That the outline is official or survey-grade, or that it matches any NCRB reporting unit.
- **Research update (10 November 2026):** Still open. Not changed by this research.

## OR-17. Police district and boundary questions

- **Status:** Open.
- **Evidence available:** GSDL lists 16 police districts, and historic data shows changing units. GSDL's 180 station polygons may be incomplete compared with 209–225 reported stations.
- **What would resolve it:** Dated boundary records and confirmed change dates.
- **Must not be claimed:** That one boundary set is valid for all years.
- **Research update (10 November 2026):** Partially resolved. 2020-2022 NCRB geographic unit names match the 16 GSDL names, but a name match does not establish equal areas, and GSDL has no date field.
- **District investigation (10 November 2026):** Partially resolved for 2020-2022 only: 16 GSDL polygons pair one to one with NCRB's 16 geographic units, checked by area and coverage as well as names. The boundary date and the years it represents remain unconfirmed.

## OR-18. Other external terms

- **Status:** Open. Survey of India terms have not been read directly. A public deployment with meaningful traffic should use a tile provider instead of OSM's tile servers.
- **Evidence available:** Survey of India's portal failed on a certificate error. OSM's tile policy has been read.
- **What would resolve it:** A manual terms review, and a provider decision before public deployment.
- **Must not be claimed:** That SafeHer's tile use is cleared for a high-traffic public site.
- **Research update (10 November 2026):** Still open.

## OR-19. Stored Atlas notes predate current holdings

- **Status:** Closed on 10 November 2026. The project owner approved a metadata-only update, and Atlas notes now match the source metadata wording.
- **Original issue:** Atlas `crimeRecords` and `validationRecords` said Table 3A.2 "has not been obtained and checked", and the 2021 record said no extract of the 2023 table was held. A read-only inspection found that `dataSources` did not contain this wording.
- **What was changed:** 25 note fields across 16 documents: the TOT-4 note text and check scope on 8 `crimeRecords`, the superseded-source reason on the 2021 record, and the TOT-4 explanation on 8 `validationRecords`.
- **Evidence available:** Full before-and-after comparison of all six collections showed only those 25 changes. A repeat preview found 0 pending changes, and the API returned the new wording.
- **What resolved it:** The approved update above. No annual figure, validation status, validation result or evidence hash changed.
- **Must not be claimed:** That this update completed TOT-4 or approved Table 3A.2. TOT-4 remains pending for all eight production records (OR-02), and Table 3A.2 remains research-only (OR-05).

## OR-20. District-category data available but not approved

- **Status:** Open. Recorded 10 November 2026.
- **Evidence available:** Official NCRB district files for 2020-2022 give 52 category columns per police unit. They pass all internal checks, and 2022 matches Table 3A.2. One section label differs: Sec. 336 in the district file, Sec. 363 in Table 3A.2.
- **What would resolve it:** Approved boundaries (OR-04, OR-17), a category comparability review (OR-07), a decision on the label difference, NCRB reuse terms (OR-12), and explicit approval of a reviewed import.
- **Must not be claimed:** That district category data is validated for publication, that categories are comparable across years, or that a district's count reflects risk.

## OR-21. Court reuse permission not requested

- **Status:** Open. Recorded 10 November 2026.
- **Evidence available:** The Delhi HC copyright policy allows reproduction "after taking proper permission by sending a mail". eCourts and the Supreme Court require prominent acknowledgement and no misleading use. Delhi District Courts state "All Rights Reserved". Copyright Act s.52(1)(q)(iv) exempts reproducing judgments unless the court prohibits it. See [the legal review](convicted-offender-privacy-and-legal-review.md), §7.
- **What would resolve it:** Written permission from the Delhi HC, and legal advice on how the statute relates to the website terms.
- **Must not be claimed:** That a publicly accessible judgment is licensed for republication or bulk use.
- **Research update (10 November 2026):** Still open for reproduction. The Delhi HC hyperlinking and framing policy states "We do not object to you linking directly to the information that is hosted on this website and no prior permission is required for the same". It asks to be informed of links and forbids framing. Linking is therefore permitted, but reproduction is not. The eCourts judgments portal terms say its documents are "for reference purposes only". See [the legal review](convicted-offender-privacy-and-legal-review.md), §8.

## OR-22. No official bulk access to court records

- **Status:** Open. Recorded 10 November 2026.
- **Evidence available:** eCourts judgment search, case status and the Supreme Court portal are behind CAPTCHAs. No official API was found, and third-party wrappers are not authorised sources. Delhi HC PDFs can be downloaded individually from public links.
- **What would resolve it:** An official data-access route or an agreement with the court or the eCourts e-Committee.
- **Must not be claimed:** That a court dataset is complete or representative. The 10-case sample came from search-engine discovery.
- **Research update (10 November 2026):** Still open. The sample now has 12 candidates, including 2 without a conviction. The Delhi HC search covers case number, party, date, neutral citation and former judge, with no offence search, behind a CAPTCHA. The eCourts HC portal filters by Act and Section behind a CAPTCHA. Third-party bulk collections (AWS "Indian High Court Judgments"; Development Data Lab, 2010–2018) are CC BY 4.0 on their packaging, but they are not authoritative and do not settle the courts' terms.

## OR-23. Appeal finality cannot be verified

- **Status:** Open. Recorded 10 November 2026.
- **Evidence available:** In 2 of the 12 Delhi HC judgments read, a trial conviction was set aside for at least one person. Supreme Court SLP status could not be checked without a manual CAPTCHA-protected search, which was not done.
- **What would resolve it:** Manual, dated status checks per appellant, and a lawyer's view of what check is sufficient.
- **Must not be claimed:** That any person is finally convicted, or that no later appeal exists because none was found.

## OR-24. No incident-level geography in judgments

- **Status:** Open. Recorded 10 November 2026.
- **Evidence available:** None of the 12 judgments states coordinates. All name the FIR registration police station, which is not necessarily the incident site. Finer descriptions are mostly homes linked to the victim. Court locations are not incident locations.
- **What would resolve it:** Nothing found so far. Any area display would also need a licensed police boundary (OR-04, OR-17).
- **Must not be claimed:** That a court case can be placed as a map marker, or that a geocoded locality or police station is an incident location.
- **Research update (10 November 2026):** Correction. 11 of the 12 judgments name the registering police station; SH-CASE-09 (appeal A) does not state an FIR number or station. Classified by the six precision classes: 0 exact coordinates, 1 named location (victim-linked), 1 locality-only, 9 district-only (registering station), 0 court-only, and 1 with no geographic information. 10 of 12 incidents took place in homes. See [the data assessment](convicted-offender-data-assessment.md), §5.

## OR-25. Identity publication needs legal advice

- **Status:** Open. Recorded 10 November 2026.
- **Evidence available:** BNS s.72, POCSO s.23 and *Nipun Saxena v Union of India* para 50.1 bar identifying victims "even in a remote manner". Naming offenders often does this. Of the 10 sample cases, 4 must not be published, 5 need review, and 1 is mixed; no case is cleared. The Delhi HC's 2026 right-to-be-forgotten framework is known only from secondary reports.
- **What would resolve it:** Advice from an Indian lawyer on the questions in [the legal review](convicted-offender-privacy-and-legal-review.md), §9.
- **Must not be claimed:** That convicted persons' names may be republished, or that offender profiles are lawful.
- **Research update (10 November 2026):** Still open. Over 12 candidates: 6 cases must not be published, plus the 2 acquitted appellants in SH-CASE-09 (appeal A); 5 need review; 1 person is potentially publishable after review; none is cleared. BNS ss.72–73 and BNSS s.366 were read in the Gazette; s.72 applies to offences "alleged or found", so it continues after conviction. The *Nipun Saxena* directions are para 43 in the official report ([2018] 14 S.C.R. 755 at 786–787); the copy used earlier numbers them para 50. Lawyer questions are now in the legal review, §11.

## OR-26. Official statute texts partly unverified

- **Description:** Several provisions relied on could not be read in an official full text.
- **Evidence:**
  - Verified from the Gazette: BNS ss.72, 73 and 356; BNSS ss.366 and 398.
  - Reproduced verbatim by a Ministry of Information and Broadcasting advisory of 10 October 2018: POCSO s.23 and JJ Act s.74.
  - Reproductions only: POCSO ss.5(n) and 33(7), Copyright Act s.52(1)(q)(iv) and DPDP Act s.3(c)(ii).
  - India Code, the Legislative Department and WCD refused connections on 10 November 2026.
- **Impact:** Later amendments to POCSO and the JJ Act are unchecked, and some conclusions rest on reproduced wording.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Read the current official texts on India Code or in the Gazette, and record any amendments.
- **Must not be claimed:** That every cited provision has been checked against its current official text.

## OR-27. *Nipun Saxena* directions under further consideration

- **Description:** The Supreme Court matter that issued the 2018 victim-identity directions is still pending.
- **Evidence:** The Supreme Court record of proceedings for W.P.(C) 565/2012 on 24 September 2025 shows it before a three-judge bench and listed for 12 November 2025. No stay of the 2018 directions was found.
- **Impact:** The directions SafeHer relies on could be modified, either tightened or relaxed.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Track later orders, and re-review publication rules after any decision.
- **Must not be claimed:** That the 2018 directions are settled for good, or that they have been relaxed.

## OR-28. Right-to-be-forgotten judgment text not obtained

- **Description:** The 2026 Delhi HC right-to-be-forgotten framework is known only from secondary reports.
- **Evidence:** The Delhi HC supplementary pronouncement list for 29 May 2026 confirms judgment in W.P.(C) 1021/2016 and connected petitions, including W.P.(C) 3918/2021, by Sachin Datta J. The judgment itself (reported as 2026:DHC:4891) was not found on the court site.
- **Impact:** It is unknown whether convicted persons can seek masking or de-indexing, or whether SafeHer would have to honour such orders.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Obtain and read the judgment from the Delhi HC, then ask a lawyer (legal review, §11 Q5).
- **Must not be claimed:** That the framework covers or excludes convicted persons.

## OR-29. Judgment metadata gaps

- **Description:** Official judgment PDFs lack some metadata and contain errors.
- **Evidence:**
  - None of the 12 retrieved Delhi HC PDFs prints a neutral citation.
  - SH-CASE-12 prints the acquittal date as 15 December 2024 for an appeal registered in 2016 (paras 1 and 40).
  - SH-CASE-08 does not name the trial court. SH-CASE-09 (appeal A) does not state the trial court, FIR number or sentence term.
- **Impact:** Records cannot be keyed on neutral citations, and every field needs human checking.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Take neutral citations only from the court's own citation search. Raise date anomalies with the source rather than correcting them.
- **Must not be claimed:** That third-party neutral citations or corrected dates are official.

## OR-30. No suitable alternative incident-level dataset

- **Description:** No legitimate, publishable, incident-level dataset of crimes against women in Delhi with verified incident locations was found.
- **Evidence:** Assessed in [the data assessment](convicted-offender-data-assessment.md), §6, and [the alternative source assessment](alternative-data-source-assessment.md):
  - NCRB tables are aggregate.
  - Delhi Police online FIRs are allegations, and sexual-offence FIRs are withheld.
  - Court datasets are located by court, not by incident.
  - The AIKosh FIR dataset is from Haryana.
  - Mendeley data is aggregate with unverified provenance.
  - Safecity is restricted.
- **Impact:** SafeHer cannot show verified incident markers from any source currently known.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** A new official release with documented incident-location methodology and reuse terms.
- **Must not be claimed:** That any coordinate in these sources shows where an incident occurred.
- **Research update (10 November 2026, incident-data round):** Confirmed across 32 candidates ([incident inventory](incident-level-data-source-inventory.md); [comparison CSV](incident-level-data-candidate-comparison.csv)). None supports public markers. The JusticeHub and AIKosh FIR dataset is the Dataverse replication data `doi:10.7910/DVN/VRH8ND` (CC0); it covers Bihar, UP and Haryana only, and its coordinates are geocoded police stations and districts. Still open.

## OR-31. Map eligibility contract allows sub-exact points

- **Description:** The map's marker eligibility contract accepts locations that this research would not allow as points.
- **Evidence:** `frontend/src/features/map/incidents.js` accepts `precision` values `exact`, `street` and `neighbourhood` for point markers. This research recommends points only for verified exact coordinates at public places not linked to a victim, with all coarser levels shown as generalised areas or aggregates ([the production recommendations](convicted-offender-production-recommendations.md), §4).
- **Impact:** None today, because no records exist and the layer is disabled. A future import could create misleading or identifying points.
- **Status:** Open. Recorded 10 November 2026. No code was changed in this research milestone.
- **Required resolution:** Align the contract with the six precision classes in an approved implementation milestone.
- **Must not be claimed:** That the current contract alone makes a record safe to display.

## OR-32. No Delhi Police open incident release

- **Description:** Delhi Police publish no open dataset of incidents or police-station crime statistics.
- **Evidence:** The Delhi Police website (checked 10 November 2026) offers per-FIR lookup, arrest reports, press releases and a road-crash report. There is no crime-statistics or open-data section. Press releases are arrest announcements that name accused people, listed by district and police station.
- **Impact:** The only authoritative incident-level source in Delhi is unavailable without permission.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** A written request to Delhi Police (draft in [the acquisition plan](incident-level-data-acquisition-plan.md), §4; not sent), or a future official release.
- **Must not be claimed:** That press releases, FIR lookups or arrests are verified incidents or convictions.
- **Research update (10 November 2026, FIR round):** Still open. Delhi Police RTI Manual 14 (updated 6 July 2026) lists FIR viewing as the only FIR-related electronic service, with sensitive FIRs excepted. No API or bulk facility is listed. See OR-35 to OR-38.

## OR-33. Account-gated datasets not inspected

- **Description:** Two candidate datasets could not be opened without accounts or keys this research may not create.
- **Evidence:** The contents of Kaggle I14 and I22 need a Kaggle account. data.gov.in resource data needs an API key or script rendering. The AIKosh page timed out.
- **Impact:** Column-level verification of I14 and I22 is missing. Their rejection rests on licence and metadata.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** The project owner decides whether to register accounts. Contents would then be inspected without changing the rejection basis, unless permission is granted.
- **Must not be claimed:** What columns or coordinates those files contain.

## OR-34. Third-party Delhi "crime maps" are not crime data

- **Description:** Projects that look like Delhi incident maps turn out to be aggregates or perception data.
- **Evidence:**
  - Safeit "SafeMap" uses negative Google Maps reviews, classified by an LLM and geocoded to zones. It has no licence.
  - Delhi-Crime-Map uses 2014 police-station aggregates placed at stations with Voronoi cells. It has no data or licence.
  - "Indian Crimes Dataset" names no source and gives an inconsistent period.
- **Impact:** These must never be imported or used to validate anything.
- **Status:** Open (watch list). Recorded 10 November 2026.
- **Required resolution:** None, beyond keeping them excluded.
- **Must not be claimed:** That these represent registered crime or real incident locations.

## OR-35. Delhi FIR document view not retrievable by automated means

- **Description:** Public Delhi FIRs can be found but could not be opened for inspection.
- **Evidence:** The search works by district, police station, year and FIR number, with no CAPTCHA or login. 16 of 24 sample searches returned a record. The view link `getSearchfirprint.htm` returned HTTP 200 with an empty body to a scripted session, and the search form did not render in headless Edge. No work-around was attempted ([FIR feasibility](delhi-fir-location-feasibility.md), §3).
- **Impact:** The content and precision of the place-of-occurrence field in Delhi FIRs are unverified.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** A manual, privacy-filtered check in a normal browser, if the owner and legal advice approve ([access plan](delhi-fir-access-and-permission-plan.md), §4). Alternatively, Delhi Police's data dictionary.
- **Must not be claimed:** That Delhi FIRs do or do not contain usable occurrence addresses.

## OR-36. FIR place-of-occurrence format unverified for Delhi

- **Description:** The FIR form's location fields have not been confirmed from an official Delhi source.
- **Evidence:** BNSS s.173(1) leaves the FIR book's form to State rules. Standard IIF-I copies reportedly have direction and distance from the police station, beat number, address, and an outside-limits station. The official template URLs (Puducherry Police, BPR&D) returned 404 or were unreachable.
- **Impact:** Any plan to extract occurrence places rests on an assumed format.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Obtain the Delhi FIR format (Delhi Police or the Delhi Government rules).
- **Must not be claimed:** That the Delhi format matches other states'.

## OR-37. Public FIR search exposes personal data and allows name search

- **Description:** The public search can be used to find people, and its responses carry personal data.
- **Evidence:** The search can be run by the name of an accused, complainant or victim. Its JSON response includes complainant-name and FIR-brief fields. Act and section fields were empty in all 16 sample results, so category is not visible without opening documents. Women-specific offences in the BNSS s.173 proviso (BNS 64–79, 124) are those generally withheld as sensitive.
- **Impact:** Any automated use would process personal data, and category filtering is impossible without opening documents. The most relevant women's-safety categories are largely not public.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Legal advice (DPDP Act; the purpose of the 2010 Delhi HC order and *Youth Bar Association*). Prefer an anonymised official extract.
- **Must not be claimed:** That public FIR availability permits extraction, profiling or republication.

## OR-38. FIR-route legal texts not fully verified

- **Description:** Two legal texts the FIR route depends on were not read in their official form.
- **Evidence:**
  - *Youth Bar Association* (2016) 9 SCC 473 was read only in secondary sources.
  - The official RTI Act PDF URL tried returned 404, so s.8(1)(h) and (j), including the DPDP Act's amendment of s.8(1)(j), were not re-read.
  - The 2010 Delhi HC judgment was read only via Indian Kanoon.
- **Impact:** The access plan's RTI and legal sections rely on unverified wording.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Read the official texts before any RTI request or legal reliance.
- **Must not be claimed:** The exact scope of the RTI exemptions or of the *Youth Bar Association* directions.

## OR-39. Police-held incident locations have documented validity problems

- **Description:** Delhi Police's own geocoded incident data often does not mark the incident site.
- **Evidence:**
  - Narayan (2024, pp.132–134): call-takers are "trained to assume the location from where the caller is calling as the location of the crime". Events are sometimes plotted at police stations, and road-only addresses are placed mid-road; when unsure, an officer "would choose a nearby slum".
  - CAG Report No. 15 of 2020, para 9.2.4: CMAPS "largely fetches data from PA-100 only", and CCTNS integration was incomplete in September 2019.
- **Impact:** Even with permission, police points cannot be treated as incident sites without a location-source flag.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** Any extract must state how each location was derived ([architecture](safeher-incident-data-architecture-recommendation.md)).
- **Must not be claimed:** That police-held coordinates are verified incident locations.

## OR-40. Researcher FIR dataset as an aggregate source

- **Description:** The Garg Delhi FIR dataset could supply sub-district geography, but only as aggregates.
- **Evidence:** About 300,000 Delhi FIRs for 2016–2019, scraped from the portal and OCR-parsed, with occurrence descriptions; ward geocoding in progress; names extracted by NER; not released.
- **Impact:** This is the most promising near-term source of sub-district geography for registered crimes against women.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** The owner decides on Draft A ([access strategy](delhi-crime-data-access-strategy.md)). Legal advice is needed on receiving aggregates derived from scraped FIRs.
- **Must not be claimed:** That the data is available, or that its locations are verified.
- **Acquisition-round update (10 November 2026):** Corrected. The 2 November 2026 version of the paper (*Eyes on the Street*, SHA-256 `42b55e6b…`) reports that geocoding is **complete as points**, not "ward geocoding in progress":
  - 357,802 PDFs downloaded and 356,140 parsed;
  - 296,869 IPC reports, of which 261,493 (88.08%) were geocoded from Place of Occurrence with ArcGIS inside each jurisdiction's shapefile;
  - 147 harmonised jurisdictions.

  No ward crime counts are reported, and there is no data-availability or licence statement. The paper also notes that FIRs withheld from the portal's index were retrieved (OR-44). The request has been redrafted ([Garg request](permission-requests/anisha-garg-academic-data-request.md)); still unsent.

## OR-41. NCW complaint statistics not yet retrieved

- **Description:** NCW's public complaint statistics could provide a women-specific district layer, but the figures have not been retrieved.
- **Evidence:** `ncwapps.nic.in/frmComp_stat_Overview.aspx` is public with no captcha, covers 2000–2026, and lists 15 Delhi police-district-style units. Results render client-side and were not retrieved by script. The Dataful mirror has 1,188,938 rows. Terms have not been reviewed.
- **Impact:** A women-specific district layer is possible, but it counts complaints, not FIRs.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** A manual retrieval, the NCW terms (Draft C), and a check of district assignment. It must be kept separate from NCRB counts.
- **Must not be claimed:** That NCW complaints are registered crimes, or that NCW districts equal NCRB units.
- **Acquisition-round update (10 November 2026):** Partially resolved. In the normal form flow (three page requests), the page returns **server-rendered** tables by district, nature and month. The 2025 Central Delhi table lists 14 categories, total 82, with most cells between 0 and 3; Delhi's 2025 state total is 2,501. The 15 districts are GSDL's 16 police districts minus AIRPORT, a name match only. The footer states "All Rights Reserved". Not checked: whether district tables sum to the state total, how a complaint is assigned to a district, and the first year with district data. No figures were imported. A request has been drafted ([NCW request](permission-requests/ncw-data-request.md)); unsent.

## OR-42. Gaps in the exhaustive search

- **Description:** Several sources in the exhaustive search remain unexamined.
- **Evidence:** UN Women Safe Cities Delhi, the IHDS crime module, archived Delhi Police reports (archive query failed), DCW reports, ICRW surveys, the contents of ACLED and GDELT, and the Shodhganga theses (server unreachable). The SSRN (403) and CrimRxiv data sources are also unverified.
- **Impact:** A suitable source could still exist among these.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:** The actions in [the progress file](exhaustive-delhi-crime-research-progress.md).
- **Must not be claimed:** That no further Delhi incident data exists.

## OR-43. Data acquisition plan prepared; no request sent

- **Description:** Five permission and data requests are drafted and ranked. None has been sent.
- **Evidence:**
  - [Action plan](safeher-data-acquisition-action-plan.md);
  - [request review](safeher-permission-request-review.md);
  - [tracker](safeher-acquisition-tracker.csv);
  - [permission-requests/](permission-requests/).
- **Ranking:** GSDL, then Garg, NCRB, Delhi Police, NCW, and finally the E11 and E12 authors.
- **Unverified contact routes:** NCRB, NCW and the Delhi Police addressee.
- **Impact:** No map layer beyond the current Delhi-wide data can be published until GSDL and NCRB permissions are obtained.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:**
  1. The owner approves each draft, fills in the placeholders and gets supervisor sign-off.
  2. The owner sends the requests.
  3. Each send and reply is recorded in the tracker, and permissions are stored with their scope.
- **Must not be claimed:** That any permission has been requested, granted or implied.

## OR-44. Researcher FIR corpus includes FIRs withheld from the public index

- **Description:** The Garg paper (2 November 2026, Table B.1 notes) states that retrieval "marginally exceeds" the indexed maximum "because sensitive reports omitted from the searchable index are nonetheless captured".
- **Impact:** Aggregates derived from the corpus may include FIRs that Delhi Police deliberately withheld from the index, possibly sexual-offence cases. This bears on whether SafeHer may receive and display derived counts.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:**
  1. Legal advice ([action plan](safeher-data-acquisition-action-plan.md), §6, question 1).
  2. Ask the researcher whether such FIRs can be excluded; the request asks this.
- **Must not be claimed:** Which FIRs were withheld, or that the researcher acted improperly. The paper's wording is the only evidence.

## OR-45. Police-district map built; public display blocked by boundary licence

- **Description:** The NCRB police-district choropleth is implemented, but it cannot draw districts publicly.
  - **Data:** 2020–2022 totals and 2022 headline categories; 16 districts and 7 non-geographic units.
  - **Interface:** year and category controls, district panel, key and table.
- **Evidence:**
  - **Licence:**
    - GSDL publishes the only police-district layer found, and states "All Rights Reserved".
    - OpenStreetMap has no Delhi police boundaries (Overpass query, 10 November 2026: 0 results).
    - OpenCity's Delhi jurisdiction resource has been removed: the dataset now lists Mumbai, Bengaluru and Hyderabad only.
    - DataMeet and gist copies re-scrape GSDL.
  - **Geometry:** the local GSDL copy has Z/M coordinate values and three self-touching sliver loops (North-West, Outer North, West). These are fixed in the review import only.
- **Impact:**
  - The public map shows district figures as a table. Polygons appear only in the local review mode, labelled as unlicensed.
  - NCRB reuse terms remain unconfirmed (OR-12).
  - The district records are not in Atlas.
- **Status:** Open. Recorded 10 November 2026.
- **Required resolution:**
  1. Written GSDL permission with effective dates (OR-04; [GSDL request](permission-requests/gsdl-boundary-permission-request.md)), or another licensed boundary.
  2. Then import it as a `verified` police-district geography with licence and attribution.
  3. NCRB clarification (OR-12).
  4. Owner approval for the Atlas import.
- **Must not be claimed:** That the public map shows district shapes, that the boundaries are licensed, or that district counts describe any place smaller than a district.
- **Production-readiness update (10 November 2026):**
  - **Boundaries:** a targeted search found no licensed alternative (13 candidates; [assessment](public-police-boundary-source-assessment.md)).
    - **New candidate:** india-geodata labels a Delhi police-station layer "CC0" but credits it to GSDL. A third party cannot relicense GSDL material, so it is rejected.
    - **Rechecks:** OSM Overpass still returns 0 results. OpenCity still has no Delhi resource.
  - **Safeguards:** production now has six independent layers against review geometry. A licensed-layer importer is ready for when permission or a licence exists.
  - **Status:** BLOCKED_BY_MULTIPLE_ISSUES, adding NCRB terms (OR-12) to this blocker ([readiness](safeher-district-map-production-readiness.md)).
