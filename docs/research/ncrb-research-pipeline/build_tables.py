"""Builds the research inventory, feasibility and proposal tables.
Hashes are recomputed from local files; findings come from the two validation scripts."""
import csv

from common import OUT, RETRIEVED, SOURCES, VOLUMES, only_file, sha256, write_csv

R = "2026-11-10"
NCRB_J = "https://www.ncrb.gov.in/uploads/2022/July/11/custom/crime-in-india"
NCRB_P = "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/post"


def local(path):
    return {"file": path.name, "bytes": path.stat().st_size, "sha": sha256(path)}


inv = []
def add(title, period, pub, vol, table, ttitle, unit, pages, url, path, retrieved, cls, licence, use, note):
    f = local(path) if path else {"file": "", "bytes": "", "sha": ""}
    inv.append({"publication_title": title, "period_covered": period, "publication_year": pub, "volume_part": vol, "table_number": table,
                "table_title": ttitle, "original_unit_terminology": unit, "pages": pages, "official_source_url": url, "local_file": f["file"],
                "file_size_bytes": f["bytes"], "sha256": f["sha"], "retrieved": retrieved, "source_class": cls, "licence_or_reuse": licence, "suitability": use, "notes": note})

NO_LICENCE = "No explicit NCRB reuse licence found"
BASE = "https://www.ncrb.mha.gov.in/uploads"
add("Crime in India 2018", "2016-2018 (3A.1); 2018 (3A.2)", "", "Volume I", "3A.1; 3A.2", "Crime against Women", "Delhi UT (3A.1); Delhi (3A.2)", "PDF 241; PDF 242-257", f"{BASE}/nationalcrimerecordsbureau/custom/1653734481_Crime%20in%20India%202018%20-%20Volume%201_3_0_0.pdf", SOURCES / VOLUMES["2018"], "held before this task", "official", NO_LICENCE, "production (3A.1); research-only (3A.2)", "Publication year not recorded in this inventory; edition year is 2018.")
add("Crime in India 2022", "2020-2022 (3A.1); 2022 (3A.2)", "", "Volume I", "3A.1; 3A.2; 3B.1", "Crime against Women", "Delhi; Delhi City (3B.1)", "PDF 259; PDF 260-275; PDF 317", f"{BASE}/nationalcrimerecordsbureau/custom/1701607577CrimeinIndia2022Book1.pdf", SOURCES / VOLUMES["2022"], "held before this task", "official", NO_LICENCE, "production (3A.1); research-only (3A.2, 3B.1)", "")
add("Crime in India 2023", "2021-2023 (3A.1); 2023 (3A.2)", "", "Part I (file name); Volume I (front matter)", "3A.1; 3A.2", "Crime against Women", "Delhi", "PDF 259; PDF 260-275", f"{BASE}/files/1CrimeinIndia2023PartI.pdf", SOURCES / VOLUMES["2023"], "held before this task", "official", NO_LICENCE, "research-only", "Corroborates 2021-2023 annual figures.")
add("Crime in India 2024", "2022-2024 (3A.1); 2024 (3A.2)", "", "Volume I", "3A.1; 3A.2; 3B.1", "Crime against Women", "Delhi; Delhi City (3B.1)", "PDF 329; PDF 330-357; PDF 399", f"{BASE}/files/11CrimeinIndia2024-VolumeI.pdf", SOURCES / VOLUMES["2024"], "held before this task", "official", NO_LICENCE, "production (3A.1); research-only (3A.2, 3B.1)", "")
for name, per, lab in (("women_2016-18.pdf", "2016-2018", "Delhi UT"), ("women_2020-22.pdf", "2020-2022", "Delhi"), ("women_2022-24.pdf", "2022-2024", "Delhi")):
    add("NCRB Table 3A.1 one-page extract", per, "", "", "3A.1", "Crime against Women (IPC+SLL)", lab, "1", "", SOURCES / name, "held before this task", "official (extract supplied by project owner)", NO_LICENCE, "production evidence", "Hash matches production metadata.")
add("NCRB Additional Table: State/UT Cases Registered under Crimes against Women", "2014-2019", "", "Additional tables, year 2019", "003 State/UT", "Statement on Cases Registered In Police Stations and Cr.PC (156_3) under Crimes against Women During 2014-2019", "Delhi", "sheet row SL 34", f"{NCRB_P}/1679740555003StateUT-wiseCasesRegistered1563underCrimesagainstWomenduring2014-2019.xlsx", only_file("state-caw-2014-2019"), R, "official", NO_LICENCE, "production-candidate evidence for 2019", "Reproduces 2016-2018 production figures exactly.")
add("NCRB Additional Table: City-wise Cases Registered under Crimes against Women", "2014-2019", "", "Additional tables, year 2019", "003 City", "Cases Registered ... in 53 Metropolitan Cities During 2014-2019", "Delhi City", "sheet row SL 12", f"{NCRB_P}/1679738257003City-wiseCasesRegistered1563underCrimesagainstWomenduring2014-2019.xlsx", only_file("city-caw-2014-2019"), R, "official", NO_LICENCE, "research-only", "Delhi City is a separate unit.")
add("NCRB Additional Table: State/UT Cases Registered under Crimes against Women", "2021", "", "Additional tables, year 2021", "003 State/UT", "State/UT-wise Cases Registered", "Delhi", "sheet row SL 32", f"{NCRB_P}/1673006953003StateUT-wiseCasesRegistered1563underCrimesagainstWomenduring2021.xlsx", only_file("state-caw-2021"), R, "official", NO_LICENCE, "corroboration", "")
add("NCRB Additional Table: State/UT Cases Registered under Crimes against Women", "2022", "", "Additional tables, year 2022", "003 State/UT", "State/UT-wise Cases Registered", "Delhi", "sheet row SL 32", "https://www.ncrb.gov.in/uploads/files/003StateUT-wiseCasesRegistered1563underCrimesagainstWomenduring2022.xlsx", only_file("state-caw-2022"), R, "official", NO_LICENCE, "corroboration", "")
for y, slug, url in ((2014, "district-caw-2014", f"{NCRB_J}/5District-wise-Crimes-committed-against-Women_2014.xlsx"), (2015, "district-caw-2015", f"{NCRB_J}/5-District-wise-Crimes-committed-against-Women_2015.xlsx"), (2016, "district-caw-2016", f"{NCRB_J}/District-wise-Crimes-committed-against-Women_2016.xlsx"), (2020, "district-caw-2020", f"{NCRB_J}/Districtwise-Crime-against-Women_2020.xlsx"), (2021, "district-caw-2021", f"{NCRB_P}/16730066503DistrictwiseCrimeagainstWomen2021.xlsx"), (2022, "district-caw-2022", "https://www.ncrb.mha.gov.in/uploads/files/3-DistrictwiseCrimeagainstWomen20221.xlsx")):
    add("NCRB Additional Table: District-wise Crimes against Women", str(y), "", f"Additional tables, year {y}", "District Wise Reports", "District-wise Crime against Women", "Delhi UT / Delhi police units", "sheet 'District Data Report'", url, only_file(slug), R, "official", NO_LICENCE, "research-only", "See district assessment.")
add("Crime in India 2021 (English)", "2019-2021 (3A.1); 2021 (3A.2)", "", "Volume I", "3A.1; 3A.2; 3B.1", "Crime against Women", "Delhi; Delhi City", "PDF 259; PDF 275 (3A.2 total); PDF 317", "https://endnowfoundation.org/wp-content/uploads/2023/04/Crime-in-India-2021-NCRB-1_compressed.pdf", only_file("cii-2021-v1-en-endnow-copy"), R, "third-party-hosted copy of an official report", NO_LICENCE + "; hosted by a third party", "corroboration only", "Not obtained from NCRB. Compressed copy; integrity against NCRB's original cannot be confirmed.")
for t, u, n in (("Crime in India 2019, 2020, 2021 (Hindi front matter)", "https://www.ncrb.gov.in/crime-in-india-year-wise.html?year=2021", "Listing shows front matter, snapshots and glossary. Table chapters were not listed in the default Hindi view. English view requires a browser session and was not reached."),
                ("NCRB year-wise listing, English view", "https://www.ncrb.gov.in/crime-in-india-year-wise.html", "Language switch rejected the automated request (CSRF). Not accessed."),
                ("Additional tables for 2023 and 2024", "https://www.ncrb.gov.in/crime-in-india-additional-table.html", "The page returned no file links for these years on 2026-11-10."),
                ("Crime in India 2017 and 2018-2019 district CAW files", "https://www.ncrb.gov.in/crime-in-india-additional-table.html", "Only district Missing Persons and Juvenile files were listed for 2017-2019."),
                ("OGD: District-wise crimes committed against Women", "https://www.data.gov.in/catalog/district-wise-crimes-committed-against-women", "Page metadata only: published 2013-10-11, updated 2017-10-25. Resource list is client-rendered; the API needs a key and was not used."),
                ("OGD: State/UT crime against women 2019-2021", "https://kerala.data.gov.in/resource/stateut-wise-number-crime-against-women-indian-penal-code-and-special-and-local-laws-ipc", "Listed 2019-2021. Values not retrieved."),
                ("Parliament replies with NCRB annexures", "https://eparlib.sansad.in/", "Located by search, but the hosts refused automated download; Delhi rows not read."),
                ("Dataful District Wise Crimes against Women", "https://distcrimes.dataful.in/datasets/2/", "Third-party compilation. Metadata only, 2001-2024, 529,118 rows. Licence unstated, terms page returned 404.")):
    inv.append({"publication_title": t, "period_covered": "", "publication_year": "", "volume_part": "", "table_number": "", "table_title": "", "original_unit_terminology": "", "pages": "", "official_source_url": u, "local_file": "", "file_size_bytes": "", "sha256": "", "retrieved": f"attempted {R}", "source_class": "third-party" if "Dataful" in t else "official", "licence_or_reuse": "Not established", "suitability": "not obtained", "notes": n})
write_csv("ncrb-source-inventory.csv", list(inv[0].keys()), inv)

# Annual rule matrix across all years.
ann = []
def a(y, rule, res, ev, prod="NOT_APPLICABLE"):
    ann.append({"year": y, "rule": rule, "research_result": res, "production_status": prod, "evidence": ev})
YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
EDIT = {2016: ("PASS", "CII 2018 p.241 and official 2014-2019 xlsx agree."), 2017: ("PASS", "CII 2018 p.241 and official 2014-2019 xlsx agree."), 2018: ("PASS", "CII 2018 p.241 and official 2014-2019 xlsx agree."),
        2019: ("PASS_WITH_NOTE", "Official xlsx and third-party-hosted copy of CII 2021 p.259 agree."), 2020: ("PASS_WITH_NOTE", "CII 2022 p.259 and third-party-hosted copy of CII 2021 agree."),
        2021: ("PASS", "CII 2022 p.259, CII 2023 p.259 and official 2021 xlsx agree."), 2022: ("PASS", "CII 2022, 2023 and 2024 and official 2022 xlsx agree."), 2023: ("PASS", "CII 2023 p.259 and CII 2024 p.329 agree."), 2024: ("NOT_APPLICABLE", "One edition covers 2024 so far.")}
for y in YEARS:
    prod = "PASS" if y != 2019 else "NOT_IN_PRODUCTION"
    a(y, "EDIT-1", *EDIT[y], prod="NOT_RECORDED" if y != 2019 else "NOT_IN_PRODUCTION")
    a(y, "EXT-2", "PASS_WITH_NOTE" if y == 2019 else "PASS", "Official xlsx value read; printed report page from NCRB not held." if y == 2019 else "Table 3A.1 extract and full-report page checked.", prod=prod)
    a(y, "TOT-4", {2016: "PENDING", 2017: "PENDING", 2019: "PENDING", 2020: "PENDING", 2021: "PASS_WITH_NOTE"}.get(y, "PASS"),
      {2021: "Table 3A.2 total 14277 in third-party-hosted copy of CII 2021 p.275 equals Table 3A.1.", 2016: "No Table 3A.2 source held.", 2017: "No Table 3A.2 source held.", 2019: "No Table 3A.2 source held.", 2020: "No Table 3A.2 source held."}.get(y, "Table 3A.2 total equals Table 3A.1 in the same edition."), prod="PENDING" if y != 2019 else "NOT_IN_PRODUCTION")
    a(y, "MISS-2", "PASS", "Printed official value only. Nothing estimated.", prod="PASS" if y != 2019 else "NOT_IN_PRODUCTION")
    a(y, "UNIT-1", "PASS", "State/UT series only.", prod="PASS" if y != 2019 else "NOT_IN_PRODUCTION")
gaps = {r["year"]: int(r["ut_minus_city"]) for r in csv.DictReader(open(OUT / "ncrb-delhi-ut-vs-city.csv", encoding="utf-8"))}
for y in YEARS:
    v = gaps.get(str(y))
    a(y, "UNIT-2", "PENDING" if v == 0 else "PASS_WITH_NOTE", f"UT minus City = {v}. {'Zero is unexplained and needs review.' if v == 0 else 'Not negative. The gap narrows sharply after 2018; the cause is unknown.'}")
a("2016-2024", "MISS-1", "PASS_WITH_NOTE", "Every production year has a value, and 2019 has a coverage record. 13395 is a proposal only.", prod="PASS")
write_csv("ncrb-annual-validation-matrix.csv", list(ann[0].keys()), ann)

# Feasibility
F = [
    ("Delhi annual crime trends", "FEASIBLE_NOW", "Verified Table 3A.1 figures", "Eight validated figures are in production. 2019 can be added if the proposal is approved."),
    ("Year-over-year changes", "FEASIBLE_NOW", "Comparable annual definitions", "Descriptive only. Same measure and table family; must break at missing years, flag 2020 and July 2024, and not be read as prevalence."),
    ("Crime-category comparisons (single edition)", "FEASIBLE_WITH_ADDITIONAL_DATA", "Validated Table 3A.2 categories", "Rows extracted and largely checked, but approval and reviewer sign-off are outstanding."),
    ("Crime-category trends across editions", "NOT_FEASIBLE_WITH_CURRENT_DATA", "Evidence of comparability", "All comparability is not_assessed, 2019-2021 and 2016-2017 lack sources, and the 2024 structure changed."),
    ("Delhi versus other metros", "FEASIBLE_WITH_ADDITIONAL_DATA", "Validated Table 3B.1 for all metros", "Counts only. Table 3B.1 has not been validated, and Delhi City must not be combined with Delhi UT."),
    ("District choropleth", "FEASIBLE_WITH_ADDITIONAL_DATA", "Compatible boundaries with permission and date", "Official police-unit totals reconcile exactly for 2020-2022. GSDL permission and boundary date are missing; 7 units have no geography."),
    ("Police-station analysis", "NOT_FEASIBLE_WITH_CURRENT_DATA", "Station-level crime figures", "No public official station-level source found."),
    ("Ward analysis", "NOT_FEASIBLE_WITH_CURRENT_DATA", "Ward-level crime figures", "No ward-level crime source found. Allocation from districts would be fabrication."),
    ("Hotspot analysis", "NOT_FEASIBLE_WITH_CURRENT_DATA", "Genuine incident coordinates", "No open incident-level data on crimes against women. Would also raise serious privacy risks."),
    ("Night/day analysis", "NOT_FEASIBLE_WITH_CURRENT_DATA", "Genuine incident timestamps", "NCRB data is annual."),
    ("Crime-density analysis", "NOT_FEASIBLE_WITH_CURRENT_DATA", "Suitable geocoded dataset", "No suitable geocoded dataset exists for crimes against women."),
    ("Predictive modelling", "NOT_FEASIBLE_WITH_CURRENT_DATA", "Representative granular data", "A short annual aggregate series cannot support credible prediction, and SafeHer should not add ML for appearance."),
]
write_csv("safeher-feature-feasibility.csv", ["feature", "classification", "evidence_needed", "explanation"], [dict(zip(["feature", "classification", "evidence_needed", "explanation"], x)) for x in F])

# Proposed changes. Nothing here is imported.
P = [
    {"candidate": "Delhi UT total, 2019", "source": "NCRB additional table, State/UT Crimes against Women 2014-2019 (xlsx)", "reporting_period": "2019", "reporting_unit": "Delhi UT (printed Delhi)", "figure_or_category": "13395 registered cases (51 under Cr.PC 156(3) + 13344 in police stations)", "evidence": "Sheet row SL 34; third-party-hosted copy of CII 2021 Table 3A.1 PDF p.259 agrees", "rules_passed": "EDIT-1 (with note), MISS-2, UNIT-1", "rules_pending": "TOT-4; printed Table 3A.1 page from NCRB not held", "comparability": "Same measure: this file reproduces production 2016-2018 exactly", "notes_required": "Different source form from other years; TOT-4 pending; label printed as Delhi", "decision": "APPROVED_FOR_PRODUCTION", "status_if_approved": "verified_with_note"},
    {"candidate": "TOT-4 result for 2018, 2022, 2023, 2024", "source": "CII 2018/2022/2023/2024 Tables 3A.1 and 3A.2", "reporting_period": "2018; 2022; 2023; 2024", "reporting_unit": "Delhi UT", "figure_or_category": "Validation check only; no category rows", "evidence": "docs/research/data/ncrb-3a2-validation-matrix.csv", "rules_passed": "TOT-4 and TOT-3 research PASS; totals confirmed by reread", "rules_pending": "Reviewer sign-off for the extraction (OR-11)", "comparability": "not_assessed", "notes_required": "Equal totals do not validate individual categories", "decision": "APPROVED_FOR_PRODUCTION", "status_if_approved": "TOT-4 becomes PASS for these years only; record status stays verified_with_note"},
    {"candidate": "TOT-4 result for 2021", "source": "Third-party-hosted copy of CII 2021 Table 3A.2 p.275", "reporting_period": "2021", "reporting_unit": "Delhi UT", "figure_or_category": "Validation check only", "evidence": "Total 14277 equals Table 3A.1", "rules_passed": "Value equality", "rules_pending": "Original NCRB report", "comparability": "not_assessed", "notes_required": "", "decision": "CANDIDATE_UNVERIFIED", "status_if_approved": "Do not change"},
    {"candidate": "Table 3A.2 category rows (227 rows)", "source": "CII 2018/2022/2023/2024", "reporting_period": "2018; 2022; 2023; 2024", "reporting_unit": "Delhi UT (printed Delhi)", "figure_or_category": "Delhi category rows", "evidence": "Research package", "rules_passed": "TOT-3; SUB-1", "rules_pending": "SUB-2 FAIL 2018, 2022; LEGAL-3; reviewer sign-off", "comparability": "not_assessed", "notes_required": "Kidnapping formula caveat", "decision": "RESEARCH_ONLY", "status_if_approved": "Do not change"},
    {"candidate": "Delhi police-unit totals 2020-2022", "source": "NCRB District-wise Crime against Women xlsx", "reporting_period": "2020; 2021; 2022", "reporting_unit": "Delhi police units", "figure_or_category": "23 units per year", "evidence": "docs/research/data/ncrb-district-reconciliation.csv", "rules_passed": "Sum of units equals State/UT total", "rules_pending": "Boundary permission and date; non-geographic unit handling", "comparability": "2020-2022 only", "notes_required": "7 units have no geography", "decision": "RESEARCH_ONLY", "status_if_approved": "Do not change"},
    {"candidate": "Delhi police-unit totals 2014-2016", "source": "NCRB District-wise Crimes against Women xlsx", "reporting_period": "2014; 2015; 2016", "reporting_unit": "Delhi police units", "figure_or_category": "19 units per year", "evidence": "docs/research/data/ncrb-district-reconciliation.csv", "rules_passed": "None for totals", "rules_pending": "Totals do not reconcile cleanly", "comparability": "Different unit set from 2020-2022", "notes_required": "", "decision": "RESEARCH_ONLY", "status_if_approved": "Do not change"},
    {"candidate": "Delhi City totals (Table 3B.1)", "source": "CII Table 3B.1 and NCRB City xlsx", "reporting_period": "2014-2024", "reporting_unit": "Delhi City", "figure_or_category": "Metro totals", "evidence": "docs/research/data/ncrb-delhi-ut-vs-city.csv", "rules_passed": "Value read", "rules_pending": "Full metro validation", "comparability": "Separate unit", "notes_required": "2024 equality unexplained", "decision": "RESEARCH_ONLY", "status_if_approved": "Do not change"},
    {"candidate": "Dataful, Mendeley and other third-party compilations", "source": "Third-party", "reporting_period": "Various", "reporting_unit": "Various", "figure_or_category": "Any", "evidence": "No official reconciliation done", "rules_passed": "None", "rules_pending": "Licence and reconciliation", "comparability": "Unknown", "notes_required": "", "decision": "REJECTED", "status_if_approved": "Do not change"},
]
write_csv("safeher-production-proposals.csv", list(P[0].keys()), P)

# District candidates and geographic compatibility.
D = [
    ("NCRB District-wise CAW 2020-2022", "NCRB (official)", "2020; 2021; 2022", "Police units (23 for Delhi)", "Cases", "Yes, Delhi", "Yes: 7 of 23 units", "Reproducible xlsx", "No explicit licence", "Exact name match to 16 GSDL police districts; boundary date and permission missing", "BEST_CANDIDATE"),
    ("NCRB District-wise CAW 2014-2016", "NCRB (official)", "2014; 2015; 2016", "Police units (19 for Delhi)", "Cases", "Yes, Delhi UT", "Yes: 7 of 19 units", "Reproducible xlsx", "No explicit licence", "12 geographic units predate Rohini, Shahdara, Dwarka, Outer North; printed totals differ from State/UT or unit sums", "RESEARCH_ONLY"),
    ("NCRB District CAW 2017-2019, 2023-2024", "NCRB (official)", "None retrieved", "n/a", "n/a", "n/a", "n/a", "No file listed on 2026-11-10", "n/a", "n/a", "UNAVAILABLE"),
    ("OGD District-wise crimes committed against Women", "OGD India, NCRB listed", "Not confirmed", "District", "Not confirmed", "Not confirmed", "Not confirmed", "Client-rendered; API key required, not used", "OGD licence in site footer; resource terms not read", "Not assessed", "NOT_RETRIEVED"),
    ("Dataful District Crimes against Women 2001-2024", "Dataful (third-party)", "2001-2024 stated", "Crime reporting unit", "Absolute cases", "Not confirmed", "Unit type column exists; not inspected", "Download not attempted", "Not stated", "Not assessed", "NOT_VERIFIED"),
    ("Mendeley women crime dataset", "Third-party research", "Includes 2019-2020", "NCRB units", "Cases", "Yes (prior research)", "Yes (prior research)", "Yes", "CC BY 4.0", "Prior finding; quarantined", "QUARANTINED"),
    ("OSM Delhi outline", "OpenStreetMap", "Current", "Delhi outline", "n/a", "n/a", "n/a", "Yes", "ODbL", "Single outline. Not a police-unit boundary", "CONTEXT_ONLY"),
    ("OSM level-5 areas", "OpenStreetMap", "Current", "Revenue-type districts", "n/a", "n/a", "n/a", "Yes", "ODbL", "13 revenue-type areas (prior research). Not police units", "UNSUITABLE_FOR_NCRB_UNITS"),
    ("GSDL police districts", "GSDL", "Undated", "16 police districts", "n/a", "n/a", "n/a", "Queryable", "Not established", "Layer checked 2026-11-10: EPSG:32643, no date field, no copyright text", "BLOCKED_BY_PERMISSION"),
    ("GSDL police stations", "GSDL", "Undated", "180 stations (prior research)", "n/a", "n/a", "n/a", "Queryable", "Not established", "No station-level crime data", "UNSUITABLE_NOW"),
    ("GSDL revenue and ward layers", "GSDL", "Various", "Revenue, wards", "n/a", "n/a", "n/a", "Queryable", "Not established", "Different unit systems", "UNSUITABLE_FOR_NCRB_UNITS"),
    ("DataMeet Delhi boundaries", "Community", "Unknown", "Wards, outline", "n/a", "n/a", "n/a", "Yes", "CC BY-SA 2.5 India; scraped origin", "Different unit systems; weak provenance", "UNSUITABLE_FOR_NCRB_UNITS"),
]
keys = ["dataset", "publisher", "years", "geographic_unit", "measure", "delhi_included", "non_geographic_units_mixed", "downloadable_reproducible", "licence", "boundary_compatibility", "assessment"]
write_csv("ncrb-district-dataset-comparison.csv", keys, [dict(zip(keys, x)) for x in D])
