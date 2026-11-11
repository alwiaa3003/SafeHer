"""Cross-checks annual Delhi figures across official and third-party-hosted copies,
and summarises NCRB district-wise files for Delhi. Research output only."""
import csv
import json
import re
from collections import Counter

from common import (OUT, PRODUCTION, RETRIEVED, SOURCES, VOLUMES, annual_3a1_row, delhi_row, only_file, pdf_text_pages, read_xlsx, sha256, to_int, write_csv, write_json)

CITY = r"Delhi City"
result = {}

state_rows = list(read_xlsx(only_file("state-caw-2014-2019")).values())[0]
city_rows = list(read_xlsx(only_file("city-caw-2014-2019")).values())[0]
YEARS = [2014, 2015, 2016, 2017, 2018, 2019]
def row_named(rows, name):
    return next(r for r in rows if len(r) > 1 and r[1].strip() == name)
def triples(row):
    return {y: tuple(to_int(row[2 + 3 * i + j]) for j in range(3)) for i, y in enumerate(YEARS)}
state = triples(row_named(state_rows, "Delhi"))
city = triples(row_named(city_rows, "Delhi City"))

official_files = {
    "state-caw-2014-2019": 2019, "state-caw-2021": 2021, "state-caw-2022": 2022,
}
evidence = []
for y, (a, b, total) in state.items():
    evidence.append({
        "year": y, "source": "NCRB additional table, State/UT Cases Registered under Crimes against Women 2014-2019 (official xlsx)",
        "source_class": "official", "printed_unit_label": "Delhi", "value": total, "components": f"Cr.PC 156(3) {a} + police stations {b}",
        "components_sum_ok": a + b == total, "production_value": PRODUCTION.get(y, ""), "matches_production": ("" if y not in PRODUCTION else total == PRODUCTION[y]),
    })
for slug, y in (("state-caw-2021", 2021), ("state-caw-2022", 2022)):
    rows = list(read_xlsx(only_file(slug)).values())[0]
    r = row_named(rows, "Delhi")
    a, b, total = (to_int(x) for x in r[2:5])
    evidence.append({
        "year": y, "source": f"NCRB additional table, State/UT Cases Registered under Crimes against Women {y} (official xlsx)",
        "source_class": "official", "printed_unit_label": "Delhi", "value": total, "components": f"Cr.PC 156(3) {a} + police stations {b}",
        "components_sum_ok": a + b == total, "production_value": PRODUCTION.get(y, ""), "matches_production": total == PRODUCTION.get(y),
    })

copy = only_file("cii-2021-v1-en-endnow-copy")
pages = pdf_text_pages(copy)
copy_page = next(i + 1 for i, p in enumerate(pages) if re.search(r"Crime against Women \(IPC\+SLL\) - 2019-2021", p) and re.search(r"(?m)^\s*\d+\s+Delhi\s+\d", p))
line = next(l for l in pages[copy_page - 1].splitlines() if re.match(r"\s*\d+\s+Delhi\s+\d", l))
c19, c20, c21, pop, rate, cs = line.split()[2:8]
for y, v in ((2019, c19), (2020, c20), (2021, c21)):
    evidence.append({
        "year": y, "source": f"Crime in India 2021 Volume I, Table 3A.1, PDF p.{copy_page} (English; third-party-hosted copy of the NCRB report)",
        "source_class": "third_party_hosted_copy", "printed_unit_label": "Delhi", "value": int(v), "components": "",
        "components_sum_ok": "", "production_value": PRODUCTION.get(y, ""), "matches_production": ("" if y not in PRODUCTION else int(v) == PRODUCTION[y]),
    })

# Compares the whole 2019 column of the official file with the copy of the printed table.
state_2019 = {r[1].strip(): to_int(r[19]) for r in state_rows if len(r) > 19 and r[0].strip().isdigit()}
# Row names and numbers sit on different text lines in the copy, so its 2019 column is compared as a set of values.
copy_values = []
for line in pages[copy_page - 1].splitlines():
    m = re.match(r"\s*(?:\d+\s+)?[A-Za-z&\.\* ]*?(\d+)\s+(\d+)\s+(\d+)\s+\d+\.\d", line)
    if m and not re.search(r"(?i)total", line):
        copy_values.append(int(m.group(1)))
from collections import Counter as _C
official_counter, copy_counter = _C(state_2019.values()), _C(copy_values)
only_official = sorted((official_counter - copy_counter).elements())
only_copy = sorted((copy_counter - official_counter).elements())
shared = list(state_2019)
differences = {"only_in_official_file": only_official, "only_in_copy": only_copy}
copy_2019 = copy_values

# Delhi UT figures across the editions held locally.
editions = {"2018": [2016, 2017, 2018], "2022": [2020, 2021, 2022], "2023": [2021, 2022, 2023], "2024": [2022, 2023, 2024]}
cross = []
for edition, years in editions.items():
    volume = pdf_text_pages(SOURCES / VOLUMES[edition])
    page = next(i + 1 for i, p in enumerate(volume) if re.search(r"TABLE\s+3A\.1\b", p) and re.search(r"(?m)^\s*\d+\s+Delhi", p))
    name = f"CII {edition} Table 3A.1, PDF p.{page} ({years[0]}-{years[-1]})"
    found = annual_3a1_row(SOURCES / VOLUMES[edition], volume[page - 1], page, years)[:3]
    for y, v in zip(years, found):
        cross.append({"year": y, "edition_table_page": name, "value_read": to_int(v), "production_value": PRODUCTION.get(y), "matches_production": to_int(v) == PRODUCTION.get(y)})
for y, v in ((2019, c19), (2020, c20), (2021, c21)):
    cross.append({"year": y, "edition_table_page": f"CII 2021 p.{copy_page} (2019-21, third-party-hosted copy)", "value_read": int(v), "production_value": PRODUCTION.get(y, ""), "matches_production": "" if y not in PRODUCTION else int(v) == PRODUCTION[y]})
write_csv("ncrb-annual-cross-edition-check.csv", list(cross[0].keys()), cross)
write_csv("ncrb-2019-evidence.csv", list(evidence[0].keys()), evidence)

# CII 2021 Table 3A.2 total, for a research-only TOT-4 note.
t3a2 = [i + 1 for i, p in enumerate(pages) if re.search(r"(?i)TABLE 3A\.2", p) and re.search(r"(?m)^\s*\d+\s+Delhi\b", p)]
tot3a2 = []
for i in t3a2[-3:]:
    for l in pages[i - 1].splitlines():
        if re.match(r"\s*\d+\s+Delhi\b", l):
            tot3a2.append((i, l.split()[2:]))

# UT and City, 3B.1 pages in each local volume.
unit = [{"year": y, "delhi_ut": state[y][2], "delhi_city": city[y][2], "ut_minus_city": state[y][2] - city[y][2], "basis": "official xlsx files 2014-2019"} for y in YEARS]
for edition, years in (("2022", [2020, 2021, 2022]), ("2024", [2022, 2023, 2024])):
    vol = pdf_text_pages(SOURCES / VOLUMES[edition])
    p = next(i for i, t in enumerate(vol) if re.search(r"TABLE 3B\.1", t) and re.search(r"Delhi City\s+\d", t))
    l = next(x for x in vol[p].splitlines() if re.search(r"Delhi City\s+\d", x))
    nums = re.findall(r"\d+", l.split("Delhi City")[1])[:3]
    for y, n in zip(years, nums):
        unit.append({"year": y, "delhi_ut": PRODUCTION[y], "delhi_city": int(n), "ut_minus_city": PRODUCTION[y] - int(n), "basis": f"CII {edition} Table 3B.1, PDF p.{p + 1}"})
write_csv("ncrb-delhi-ut-vs-city.csv", list(unit[0].keys()), unit)

NON_GEOGRAPHIC = {"crime branch", "eow", "metro", "railway", "spl cell", "spuwac", "vigilance"}
FILES = {2014: "district-caw-2014", 2015: "district-caw-2015", 2016: "district-caw-2016", 2020: "district-caw-2020", 2021: "district-caw-2021", 2022: "district-caw-2022"}
GSDL = {"airport", "central", "dwarka", "east", "new delhi", "north", "north east", "north west", "outer", "outer north", "rohini", "shahdara", "south", "south east", "south west", "west"}
norm = lambda s: re.sub(r"\s+", " ", s.replace("-", " ").replace("IGI Airport", "airport")).strip().lower()
district_rows, recon = [], []
for year, slug in FILES.items():
    rows = read_xlsx(only_file(slug))["District Data Report"]
    header = rows[1]
    tcol = next((i for i, h in enumerate(header) if re.fullmatch(r"(?i)total crimes against women", h.strip())), None)
    if tcol is None:
        tcol = next(i for sublist in rows[1:5] for i, h in enumerate(sublist) if re.search(r"(?i)total crime against women", h.strip()))
    s = next(i for i, r in enumerate(rows) if r and re.match(r"(?i)state:\s*delhi", r[0]))
    e = next(i for i, r in enumerate(rows) if i > s and r and re.match(r"(?i)state:", r[0]))
    units = [r for r in rows[s + 1:e] if r and r[0].strip().isdigit() and not re.match(r"(?i)total", r[1])]
    tot = next(r for r in rows[s + 1:e] if len(r) > 1 and re.match(r"(?i)total district", r[1]))
    values = {}
    for r in units:
        name = r[1].strip()
        kind = "non_geographic" if norm(name) in NON_GEOGRAPHIC else "geographic_police_district"
        v = to_int(r[tcol]) if len(r) > tcol else None
        values[name] = v
        district_rows.append({"year": year, "printed_unit": name, "unit_kind": kind, "total_crime_against_women": v})
    sum_units = sum(v for v in values.values() if v is not None)
    printed_total = to_int(tot[tcol])
    non_geo = sum(v for k, v in values.items() if norm(k) in NON_GEOGRAPHIC and v is not None)
    geo_names = {norm(k) for k in values if norm(k) not in NON_GEOGRAPHIC}
    official_state = state[year][2] if year in state else PRODUCTION.get(year)
    recon.append({
        "year": year, "total_column_header": header[tcol][:60] or "Total Crime against Women", "units": len(units),
        "geographic_units": len(geo_names), "non_geographic_units": len(units) - len(geo_names), "sum_of_units": sum_units,
        "printed_total_districts": printed_total, "state_ut_total": official_state,
        "sum_equals_printed": sum_units == printed_total, "printed_equals_state_ut": printed_total == official_state,
        "non_geographic_share_pct": round(100 * non_geo / printed_total, 1) if printed_total else "",
        "names_missing_from_gsdl": ";".join(sorted(geo_names - GSDL)), "gsdl_names_missing_here": ";".join(sorted(GSDL - geo_names)),
        "sha256": sha256(only_file(slug)),
    })
    if len(values) != len(set(values)):
        print("duplicate units", year)
write_csv("ncrb-district-delhi-totals.csv", list(district_rows[0].keys()), district_rows)
write_csv("ncrb-district-reconciliation.csv", list(recon[0].keys()), recon)

hdr14 = read_xlsx(only_file("district-caw-2014"))["District Data Report"][1]
result["district_2014_total_like_columns"] = [h for h in hdr14 if re.search(r"(?i)total", h)][:30]
hdr20 = read_xlsx(only_file("district-caw-2020"))["District Data Report"]
result.update({
    "copy_of_cii2021": {"sha256": sha256(copy), "table_3a1_pdf_page": copy_page, "delhi_line": [c19, c20, c21, pop, rate, cs]},
    "state_2019_vs_copy": {"states_compared": len(shared), "differences": differences, "official_rows": len(state_2019), "copy_rows": len(copy_2019)},
    "cii2021_3a2_delhi_lines_last_pages": tot3a2,
    "state_file_totals_2019": {"all_india": 405861, "note": "Printed in the official xlsx."},
})
write_json("ncrb-annual-analysis.json", result)
print(json.dumps(result, ensure_ascii=False)[:1400])
for r in recon:
    print(r)
print(unit)
print(evidence[3:6])
print("2020 header sample", [x[:30] for x in hdr20[1][-6:]], [x[:30] for x in hdr20[2][-6:]])
print([c for c in cross if c["matches_production"] is False])
