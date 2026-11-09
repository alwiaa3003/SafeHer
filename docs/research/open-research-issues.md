# SafeHer Open Research Issues

Unresolved limitations as of 10 November 2026, with closed items kept as a record. An item closes only when its resolution evidence is recorded. Rules are in [safeher-data-specification.md](safeher-data-specification.md).

## OR-01. 2019 NCRB source not obtained

- **Status:** Open. 2019 is `missing_pending_source`.
- **Evidence available:** The held 3A.1 extracts cover 2016–2018 and 2020–2024. The approved expected source is the English Crime in India 2021.
- **What would resolve it:** Obtain that official edition, record its hash, and check the printed Delhi value and label.
- **Must not be claimed:** Any 2019 figure, estimate or complete 2016–2024 series.

## OR-02. TOT-4 pending for all eight production records

- **Status:** Open. EXT-2 is PASS and TOT-4 is PENDING for 2016–2018 and 2020–2024.
- **Evidence available:** Research TOT-4 passes for 2018, 2022, 2023 and 2024 but has not been promoted. Table 3A.2 sources for 2016, 2017, 2020 and 2021 have not been obtained.
- **What would resolve it:** Obtain the missing sources, then make an approved production update for each year.
- **Must not be claimed:** That any production record is fully validated, or that research results changed a production status.

## OR-03. NCRB district-level data not retrieved or validated

- **Status:** Open.
- **Evidence available:** NCRB lists "District Wise Reports", but results load dynamically and were not retrieved. Third-party compilations exist and are not official sources.
- **What would resolve it:** Retrieve official Delhi tables, record units and years, separate non-geographic police units, and validate them.
- **Must not be claimed:** Any district, ward or police-station crime figure, ranking, risk or safety conclusion.

## OR-04. GSDL permission not established

- **Status:** Open. A permission request was drafted. No sending or reply is recorded.
- **Evidence available:** GSDL services state no open licence, and its website says All Rights Reserved.
- **What would resolve it:** Written permission and confirmation of each layer's date.
- **Must not be claimed:** That GSDL layers are licensed for SafeHer, or that they match NCRB units by name.

## OR-05. Table 3A.2 not approved for production

- **Status:** Open. Research only for 2018 and 2022–2024.
- **Evidence available:** Delhi rows were extracted and reviewed, with results in ignored local folders.
- **What would resolve it:** Resolve or formally accept OR-06 and OR-07, then give explicit approval and a reviewed import.
- **Must not be claimed:** Category figures as validated production data. Extraction is not approval.

## OR-06. Kidnapping formula in Table 3A.2

- **Status:** Open. SUB-2 is FAIL for 2018 and 2022, and PASS_WITH_NOTE for 2023.
- **Evidence available:** The printed formula includes Col.36 and its child columns 39 and 42. Procuration and Importation sit under the heading but are outside the printed formula in 2018–2023.
- **What would resolve it:** An NCRB clarification, or a documented treatment approved for publication.
- **Must not be claimed:** A corrected kidnapping total, or that the cause is confirmed. Double-counting is suspected only.

## OR-07. IPC/BNS and cross-edition comparability

- **Status:** Open. Comparability is `not_assessed` for every category.
- **Evidence available:** Printed section references. In 2024 some headings differ, Sec. 69 BNS has no printed earlier equivalent, and Human Trafficking and POCSO r/w Section 377 do not appear.
- **What would resolve it:** A category-by-category review with evidence.
- **Must not be claimed:** That IPC and BNS categories are equivalent, or any cross-year category trend.

## OR-08. Category data for other years

- **Status:** Open. Approved scope is 2018 and 2022–2024.
- **Evidence available:** Each edition's category table covers its own year only.
- **What would resolve it:** Obtain the 2019, 2020 and 2021 editions, and the 2016 and 2017 editions if those years are required.
- **Must not be claimed:** Category coverage for any other year.

## OR-09. 2024 Delhi UT and Delhi City equality

- **Status:** Open and unexplained. Both totals are identical for 2024.
- **Evidence available:** Printed tables. Records keep the figures independently, and 2024 carries the caveat.
- **What would resolve it:** An NCRB explanation of unit definitions or the 2024 data.
- **Must not be claimed:** That the units are equivalent, or that either figure is an error.

## OR-10. Full-report PDF pages not rechecked

- **Status:** Open. `pdfPageStatus` is `not_independently_rechecked` on all eight records.
- **Evidence available:** Values were checked against hashed one-page extracts. Full volumes for 2018, 2022, 2023 and 2024 are held.
- **What would resolve it:** Check each cited page in the full report and record the result.
- **Must not be claimed:** That the cited full-report pages are confirmed.

## OR-11. Table 3A.2 review items

- **Status:** Open. Completion of the reviewer's visual spot-check is not recorded.
- **Evidence available:** Coordinate-aware extraction agreed with rendered pages in a single pass. The 2018 pages do not print the I/V/R legend, so its meaning is read from later editions. Printed anomalies are preserved.
- **What would resolve it:** A recorded reviewer sign-off for each edition.
- **Must not be claimed:** That the extraction has been independently double-checked.

## OR-12. NCRB reuse licence

- **Status:** Open. No explicit licence has been found.
- **Evidence available:** NCRB publications were reviewed for reuse terms without finding one.
- **What would resolve it:** A published licence or written permission.
- **Must not be claimed:** That NCRB PDFs may be redistributed. They stay out of Git.

## OR-13. Masked Delhi street-crime dataset

- **Status:** Unverified.
- **Evidence available:** Listed on Kaggle behind a login. It covers snatching and robbery, drawn from calls rather than FIRs.
- **What would resolve it:** Confirm licence, columns, timestamps and whether coordinates are real.
- **Must not be claimed:** Any link to crimes against women, or any hotspot result.

## OR-14. Safecity permission

- **Status:** Blocked. A permission request was drafted. No sending or reply is recorded.
- **Evidence available:** Written permission is required. Reports are self-selected and carry a high privacy risk.
- **What would resolve it:** Written permission with agreed aggregation and privacy terms.
- **Must not be claimed:** That Safecity data is official, representative or available to SafeHer.

## OR-15. Mendeley district data

- **Status:** Quarantined.
- **Evidence available:** A CC BY 4.0 third-party compilation with Delhi rows for 2019 and 2020 and no overall total column.
- **What would resolve it:** Category-by-category validation against official NCRB tables.
- **Must not be claimed:** That it is an NCRB source or suitable for the primary analysis.

## OR-16. Delhi boundary and unit identity

- **Status:** Open.
- **Evidence available:** OSM relation 1942586 was checked for identity, tags, licence and geometry. Its match to NCRB units is untested. "National Capital Territory" wording is inferred from ISO code IN-DL, as the relation's name tag is "Delhi".
- **What would resolve it:** An authoritative definition of each NCRB unit's extent.
- **Must not be claimed:** That the outline is official or survey-grade, or that it matches any NCRB reporting unit.

## OR-17. Police district and boundary questions

- **Status:** Open.
- **Evidence available:** GSDL lists 16 police districts, and historic data shows changing units. GSDL's 180 station polygons may be incomplete compared with 209–225 reported stations.
- **What would resolve it:** Dated boundary records and confirmed change dates.
- **Must not be claimed:** That one boundary set is valid for all years.

## OR-18. Other external terms

- **Status:** Open. Survey of India terms have not been read directly. A public deployment with meaningful traffic should use a tile provider instead of OSM's tile servers.
- **Evidence available:** Survey of India's portal failed on a certificate error. OSM's tile policy has been read.
- **What would resolve it:** A manual terms review, and a provider decision before public deployment.
- **Must not be claimed:** That SafeHer's tile use is cleared for a high-traffic public site.

## OR-19. Stored Atlas notes predate current holdings

- **Status:** Closed on 10 November 2026. The project owner approved a metadata-only update, and Atlas notes now match the source metadata wording.
- **Original issue:** Atlas `crimeRecords` and `validationRecords` said Table 3A.2 "has not been obtained and checked", and the 2021 record said no extract of the 2023 table was held. A read-only inspection found that `dataSources` did not contain this wording.
- **What was changed:** 25 note fields across 16 documents: the TOT-4 note text and check scope on 8 `crimeRecords`, the superseded-source reason on the 2021 record, and the TOT-4 explanation on 8 `validationRecords`.
- **Evidence available:** Full before-and-after comparison of all six collections showed only those 25 changes. A repeat preview found 0 pending changes, and the API returned the new wording.
- **What resolved it:** The approved update above. No annual figure, validation status, validation result or evidence hash changed.
- **Must not be claimed:** That this update completed TOT-4 or approved Table 3A.2. TOT-4 remains pending for all eight production records (OR-02), and Table 3A.2 remains research-only (OR-05).
