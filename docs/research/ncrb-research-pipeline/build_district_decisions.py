"""Builds the Year x Unit x Measure x Category decision table and the category-source
comparison from the district validation outputs. No values are copied into the decisions."""
import csv
import json

from common import OUT, write_csv

recon = {int(r["year"]): r for r in csv.DictReader(open(OUT / "district-reconciliation-detail.csv", encoding="utf-8"))}
units = list(csv.DictReader(open(OUT / "district-unit-rows.csv", encoding="utf-8")))
columns = list(csv.DictReader(open(OUT / "district-column-labels.csv", encoding="utf-8")))
summary = json.loads((OUT / "district-validation-summary.json").read_text(encoding="utf-8"))
boundary = json.loads((OUT / "district-boundary-summary.json").read_text(encoding="utf-8"))
assert summary["formula_failures"] == 0 and summary["cross_check_2022"]["DIFFERENT"] == 0

BOUNDARY_BLOCK = "GSDL boundary: no open licence (site states All Rights Reserved), no boundary date"
REUSE = "NCRB reuse terms not established"
rows = []
for year in (2014, 2015, 2016, 2020, 2021, 2022):
    cats = [c["printed_label"] for c in columns if int(c["year"]) == year][:-1]
    for u in (x for x in units if int(x["year"]) == year):
        geographic = u["unit_kind"] == "geographic_police_district"
        reconciles = recon[year]["reconciles"] == "True"
        for measure, category in [("registered_cases", "Total crime against women")] + [("registered_cases", c) for c in cats]:
            is_total = category == "Total crime against women"
            if not geographic:
                decision, why = "REJECTED", "Non-geographic reporting unit; it has no polygon and must stay off the map."
            elif year < 2020:
                decision, why = "REJECTED", f"{year} uses a 12-district police system that the available 16-district boundary does not represent." + ("" if reconciles else " Totals do not reconcile with Delhi UT.")
            elif is_total:
                decision, why = "RESEARCH_ONLY", f"Data checks pass (official file, exact reconciliation, formulas). Blocked by: {BOUNDARY_BLOCK}; {REUSE}."
            elif year == 2022:
                decision, why = "RESEARCH_ONLY", f"Category sums match Table 3A.2 (2022) for all 52 columns, but category comparability is not assessed and Table 3A.2 is not approved. Blocked by: {BOUNDARY_BLOCK}; {REUSE}."
            else:
                decision, why = "CANDIDATE_UNVERIFIED", f"Internal formulas and totals pass, but no Table 3A.2 source for {year} has been checked against these columns. Also blocked by the boundary and reuse issues."
            rows.append({"year": year, "reporting_unit": u["printed_unit"], "unit_kind": u["unit_kind"], "measure": measure, "category": category, "decision": decision, "basis": why})
    rows.append({"year": year, "reporting_unit": "all units", "unit_kind": "", "measure": "victims", "category": "any", "decision": "NOT_AVAILABLE", "basis": "District files print one value per category with no victims measure."})
for year in (2017, 2018, 2019, 2023, 2024):
    rows.append({"year": year, "reporting_unit": "all units", "unit_kind": "", "measure": "registered_cases", "category": "any", "decision": "NOT_AVAILABLE", "basis": "No official NCRB district crime-against-women file was listed for this year on 10 November 2026."})
assert not any(r["decision"] == "APPROVED_FOR_PRODUCTION" for r in rows)
write_csv("district-map-production-recommendations.csv", list(rows[0].keys()), rows)

sources = [
    {"candidate": "NCRB District-wise Crime against Women, 2020, 2021, 2022", "origin": "official NCRB additional tables", "structure": "District x Year x 52 categories x registered cases, plus printed total",
     "district_units": "23 (16 geographic, 7 non-geographic)", "category_labels": "IPC and SLL headings as printed; Sec. 336 printed where 2022 Table 3A.2 prints 363", "measure": "Registered cases (equals Table 3A.2 incidence for all 52 columns in 2022); no victims",
     "district_categories_reconcile_to_district_total": "Yes: printed first-row headings sum to the printed total for every unit", "categories_reconcile_to_delhi_ut": "2022: yes, 52 of 52 columns equal Table 3A.2; 2020, 2021: not checked against a state category table",
     "legal_framework": "IPC and SLL (pre-BNS)", "limitations": "No IPC/SLL subtotal columns; one section-label difference; comparability not assessed", "reuse": "No explicit NCRB reuse licence", "status": "AVAILABLE_RESEARCH_ONLY"},
    {"candidate": "NCRB District-wise Crimes committed against Women, 2014, 2015", "origin": "official NCRB additional tables", "structure": "District x Year x category columns (older heading set)",
     "district_units": "19 (12 geographic, 7 non-geographic)", "category_labels": "Older headings", "measure": "Not stated", "district_categories_reconcile_to_district_total": "Not tested",
     "categories_reconcile_to_delhi_ut": "No: printed totals fall short of Delhi UT by 54 (2014) and 118 (2015), unexplained", "legal_framework": "IPC and SLL", "limitations": "Different unit system from 2020-2022", "reuse": "No explicit NCRB reuse licence", "status": "AVAILABLE_NOT_RECONCILED"},
    {"candidate": "NCRB District-wise Crimes committed against Women, 2016", "origin": "official NCRB additional tables", "structure": "District x Year x 20 categories",
     "district_units": "19 (12 geographic, 7 non-geographic)", "category_labels": "Older headings", "measure": "Not stated", "district_categories_reconcile_to_district_total": "Not tested",
     "categories_reconcile_to_delhi_ut": "Printed total equals Delhi UT; named units are 15 short, matching an unlabelled second sheet that equals the unallocated amount for all 36 States/UTs", "legal_framework": "IPC and SLL", "limitations": "Different unit system", "reuse": "No explicit NCRB reuse licence", "status": "AVAILABLE_RESEARCH_ONLY"},
    {"candidate": "NCRB Table 3A.2 (Crime in India)", "origin": "official NCRB report", "structure": "State/UT x category; one Delhi row", "district_units": "None", "category_labels": "As printed per edition",
     "measure": "Incidence, victims and rate", "district_categories_reconcile_to_district_total": "Not applicable", "categories_reconcile_to_delhi_ut": "Totals equal Table 3A.1 (research)",
     "legal_framework": "IPC, SLL; IPC and BNS in 2024", "limitations": "Not district-level", "reuse": "No explicit NCRB reuse licence", "status": "NOT_DISTRICT_LEVEL"},
    {"candidate": "NCRB district files for 2017-2019 and 2023-2024", "origin": "official NCRB additional tables", "structure": "Not listed", "district_units": "", "category_labels": "", "measure": "",
     "district_categories_reconcile_to_district_total": "", "categories_reconcile_to_delhi_ut": "", "legal_framework": "", "limitations": "No file found on 10 November 2026", "reuse": "", "status": "NOT_AVAILABLE"},
    {"candidate": "Dataful NCRB District Wise Crime Data (Crimes against Women by Crime Head)", "origin": "third-party compilation", "structure": "Year x State x Reporting unit x Crime head, 2001-2024 stated",
     "district_units": "Not confirmed for Delhi", "category_labels": "Crime heads", "measure": "Absolute cases", "district_categories_reconcile_to_district_total": "Not tested", "categories_reconcile_to_delhi_ut": "Not tested",
     "legal_framework": "Mixed", "limitations": "Not downloaded; not compared with NCRB", "reuse": "Not stated; terms page returned 404", "status": "NOT_VERIFIED"},
    {"candidate": "data.gov.in District-wise crimes committed against Women", "origin": "OGD India (NCRB listed)", "structure": "District-wise (catalogue description)", "district_units": "Not confirmed", "category_labels": "Not read",
     "measure": "Not read", "district_categories_reconcile_to_district_total": "Not tested", "categories_reconcile_to_delhi_ut": "Not tested", "legal_framework": "", "limitations": "Resources not retrieved; API needs a key", "reuse": "OGD licence on site footer; resource terms not read", "status": "NOT_RETRIEVED"},
    {"candidate": "Mendeley women crime dataset", "origin": "third-party research", "structure": "District x category (prior research)", "district_units": "NCRB units", "category_labels": "", "measure": "Cases",
     "district_categories_reconcile_to_district_total": "Not tested", "categories_reconcile_to_delhi_ut": "Not tested", "legal_framework": "", "limitations": "Quarantined; superseded by official files for 2020", "reuse": "CC BY 4.0", "status": "QUARANTINED"},
]
write_csv("district-category-source-comparison.csv", list(sources[0].keys()), sources)
count = {}
for r in rows:
    count[(r["decision"])] = count.get(r["decision"], 0) + 1
print("decisions", count, "| boundary features", boundary["feature_count"], "| grid", boundary["grid_coverage_0.01deg"])
