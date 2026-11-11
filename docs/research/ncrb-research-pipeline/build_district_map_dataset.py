"""Builds backend/data/ncrb/delhi-police-district-caw.json from the official NCRB
district crime-against-women files for 2020-2022 (Git-ignored, in docs/source-reports/).

Scope (see docs/research/district-map-production-recommendations.md):
- Total crime against women, 2020-2022: the 23 units reconcile exactly with the printed
  district total and with the production Delhi UT totals.
- 2022 headline categories: each district-sum matched Table 3A.2 (52 of 52 columns).
  Age sub-columns are left out, because they are parts of a head, not separate categories.
  The Kidnapping & Abduction group is left out while OR-06 is open.
- 2020-2021 categories are CANDIDATE_UNVERIFIED and are not exported.

Only printed values are copied. Nothing is estimated, and the script stops on any mismatch.
Run: python -I build_district_map_dataset.py (from this folder).
"""
import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import OUT, PRODUCTION, ROOT, only_file, read_xlsx, sha256  # noqa: E402

TARGET = ROOT / "backend" / "data" / "ncrb" / "delhi-police-district-caw.json"
YEARS = (2020, 2021, 2022)
FILES = {2020: "district-caw-2020", 2021: "district-caw-2021", 2022: "district-caw-2022"}

GEOGRAPHIC = [
    ("central", "Central", "Central"), ("dwarka", "Dwarka", "Dwarka"), ("east", "East", "East"),
    ("igi-airport", "IGI Airport", "IGI Airport"), ("new-delhi", "New Delhi", "New Delhi"),
    ("north", "North", "North"), ("north-east", "North-East", "North-East"),
    ("north-west", "North-West", "North-West"), ("outer", "Outer", "Outer"),
    ("outer-north", "Outer North", "Outer North"), ("rohini", "Rohini", "Rohini"),
    ("shahdara", "Shahdara", "Shahdara"), ("south", "South", "South"),
    ("south-east", "South-East", "South-East"), ("south-west", "South-West", "South-West"),
    ("west", "West", "West"),
]
NON_GEOGRAPHIC = [
    ("crime-branch", "Crime Branch"), ("eow", "EOW"), ("metro", "Metro"), ("railway", "RAILWAY"),
    ("spuwac", "SPUWAC"), ("spl-cell", "Spl Cell"), ("vigilance", "Vigilance"),
]

TOTAL_COLUMN = 54
# 2022 headline columns: (printed column number, key, legal regime of the printed head).
CATEGORY_COLUMNS_2022 = [
    (3, "murder-with-rape", "IPC"), (4, "dowry-deaths", "IPC"), (5, "abetment-to-suicide", "IPC"),
    (6, "miscarriage", "IPC"), (7, "acid-attack", "IPC"), (8, "attempt-acid-attack", "IPC"),
    (9, "cruelty-by-husband", "IPC"), (20, "human-trafficking", "IPC"), (21, "selling-minor-girls", "IPC"),
    (22, "buying-minor-girls", "IPC"), (23, "rape", "IPC"), (26, "attempt-to-rape", "IPC"),
    (29, "assault-outrage-modesty", "IPC"), (32, "insult-modesty", "IPC"), (35, "dowry-prohibition-act", "SLL"),
    (36, "immoral-traffic-act", "SLL"), (42, "domestic-violence-act", "SLL"), (43, "cyber-crimes", "SLL"),
    (46, "pocso", "SLL"), (53, "indecent-representation-act", "SLL"),
]
EXCLUDED_2022 = "Age sub-columns (parts of a head) and the Kidnapping & Abduction group (OR-06 open) are not exported."


def column_labels():
    labels = {}
    for row in csv.DictReader(open(OUT / "district-column-labels.csv", encoding="utf-8")):
        labels[(int(row["year"]), int(row["column_number"]))] = row["printed_label"]
    return labels


def cross_check_2022():
    return {int(r["district_column"]): r for r in csv.DictReader(open(OUT / "district-2022-vs-table-3a2.csv", encoding="utf-8"))}


def source_urls():
    return {r["local_file"]: r["official_source_url"] for r in csv.DictReader(open(OUT / "ncrb-source-inventory.csv", encoding="utf-8"))}


def delhi_rows(path):
    rows = read_xlsx(path)["District Data Report"]
    start = next(i for i, r in enumerate(rows) if r and re.match(r"(?i)state:\s*delhi", r[0]))
    end = next(i for i, r in enumerate(rows) if i > start and r and re.match(r"(?i)state:", r[0]))
    section = rows[start + 1:end]
    units = {r[1].strip(): r for r in section if r and r[0].strip().isdigit()}
    total = next(r for r in section if len(r) > 1 and re.match(r"(?i)total district", r[1].strip()))
    return rows[0][0].strip(), rows[start][0].strip(), units, total


def printed(row, column):
    value = row[column - 1].strip() if column - 1 < len(row) else ""
    if not re.fullmatch(r"\d+", value):
        raise SystemExit(f"Non-numeric printed value {value!r} in column {column}")
    return value


def main():
    labels, cross, urls = column_labels(), cross_check_2022(), source_urls()
    sources, values = [], []
    expected = {label for _, label, _ in GEOGRAPHIC} | {label for _, label in NON_GEOGRAPHIC}
    for year in YEARS:
        path = only_file(FILES[year])
        title, section_label, units, total_row = delhi_rows(path)
        if set(units) != expected:
            raise SystemExit(f"{year}: unexpected Delhi units {sorted(set(units) ^ expected)}")
        if labels[(year, TOTAL_COLUMN)] != "Total Crime against Women (IPC+SLL)":
            raise SystemExit(f"{year}: total column label changed")
        unit_sum = sum(int(printed(r, TOTAL_COLUMN)) for r in units.values())
        printed_total = int(printed(total_row, TOTAL_COLUMN))
        if not unit_sum == printed_total == PRODUCTION[year]:
            raise SystemExit(f"{year}: totals do not reconcile ({unit_sum}, {printed_total}, {PRODUCTION[year]})")
        sources.append({
            "sourceKey": f"NCRB-DISTRICT-CAW-{year}", "year": year, "titlePrinted": title,
            "delhiSectionLabel": section_label, "worksheet": "District Data Report",
            "fileName": path.name, "sha256": sha256(path), "sourceUrl": urls[path.name], "retrievedOn": "2026-11-10",
            "reconciliation": {"sumOf23Units": unit_sum, "printedTotalDistricts": printed_total, "delhiUtProductionTotal": PRODUCTION[year]},
        })
        columns = [(TOTAL_COLUMN, "total", "ALL")] + (CATEGORY_COLUMNS_2022 if year == 2022 else [])
        for column, key, _ in columns:
            if year == 2022 and column != TOTAL_COLUMN and cross[column]["result"] != "MATCH":
                raise SystemExit(f"2022 column {column} did not match Table 3A.2")
            for unit_label, row in units.items():
                values.append({"year": year, "unit": unit_label, "category": key, "column": column, "originalValue": printed(row, column)})

    categories = [{
        "key": "total", "column": TOTAL_COLUMN, "labelOriginal": labels[(2022, TOTAL_COLUMN)],
        "label": "Total crime against women", "legalRegime": "ALL", "years": list(YEARS),
        "validation": "District units sum exactly to the printed district total and to the Delhi UT total (Table 3A.1) for 2020, 2021 and 2022.",
    }]
    for column, key, regime in CATEGORY_COLUMNS_2022:
        original = labels[(2022, column)]
        categories.append({
            "key": key, "column": column, "labelOriginal": original, "label": original.split(" > ")[0],
            "legalRegime": regime, "years": [2022],
            "validation": f"The sum of all Delhi units equals Table 3A.2 ({cross[column]['table_3a2_code']}) in Crime in India 2022.",
        })

    dataset = {
        "datasetKey": "ncrb_delhi_police_district_crime_against_women",
        "description": "Registered cases of crime against women by Delhi police district, as printed in NCRB's district-wise tables.",
        "measure": "registered_cases",
        "measureNote": "The files do not print an incidence or victims label. Their totals equal the Delhi registered-case totals in Table 3A.1, so the values are treated as registered cases.",
        "builtBy": "docs/research/ncrb-research-pipeline/build_district_map_dataset.py",
        "lastVerified": "2026-11-10",
        "licence": "No explicit NCRB reuse licence has been found (OR-12). Figures are reproduced with attribution; the source files are not redistributed.",
        "excluded": [EXCLUDED_2022, "2020-2021 category columns were not checked against a state table and are not exported.", "2014-2016 use a 12-district system and are not exported."],
        "units": [{"key": k, "labelOriginal": o, "label": d, "kind": "police_district"} for k, o, d in GEOGRAPHIC]
        + [{"key": k, "labelOriginal": o, "label": o, "kind": "non_geographic"} for k, o in NON_GEOGRAPHIC],
        "categories": categories,
        "sources": sources,
        "values": values,
    }
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(dataset, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {TARGET.relative_to(ROOT)}: {len(values)} values, {len(categories)} categories, {len(sources)} sources")


if __name__ == "__main__":
    main()
