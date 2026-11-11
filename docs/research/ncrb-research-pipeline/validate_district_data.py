"""District-level validation: Delhi rows of the official NCRB district crime-against-women
files, unit classification, reconciliation, internal formulas and a 2022 cross-check
against the Table 3A.2 research extract. Research output only; nothing touches production."""
import csv
import re
from collections import defaultdict

from common import OUT, PRODUCTION, REVIEW, only_file, read_xlsx, sha256, to_int, write_csv, write_json

FILES = {2014: "district-caw-2014", 2015: "district-caw-2015", 2016: "district-caw-2016", 2020: "district-caw-2020", 2021: "district-caw-2021", 2022: "district-caw-2022"}
STATE_TOTALS = {}
state_rows = list(read_xlsx(only_file("state-caw-2014-2019")).values())[0]
delhi = next(r for r in state_rows if len(r) > 1 and r[1].strip() == "Delhi")
for i, y in enumerate(range(2014, 2020)):
    STATE_TOTALS[y] = to_int(delhi[4 + 3 * i])
STATE_TOTALS.update({y: PRODUCTION[y] for y in (2020, 2021, 2022)})
NON_GEOGRAPHIC = {"crime branch", "eow", "metro", "railway", "spl cell", "spuwac", "vigilance"}
URLS = {r["local_file"]: r["official_source_url"] for r in csv.DictReader(open(OUT / "ncrb-source-inventory.csv", encoding="utf-8"))}
norm = lambda s: re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def header_labels(rows, width, header_rows):
    """Full label for each column: parent heading plus sub-headings, as printed."""
    labels = []
    for j in range(width):
        parts, last = [], None
        for r in header_rows:
            cell = rows[r][j].strip() if j < len(rows[r]) else ""
            if not cell:
                # A merged parent heading is printed once, at its first column.
                k = j
                while k >= 0 and (k >= len(rows[r]) or not rows[r][k].strip()):
                    k -= 1
                cell = rows[r][k].strip() if r == header_rows[0] and k >= 0 and k != j and j <= span_end(rows, r, k, width) else ""
            if cell and cell != last:
                parts.append(re.sub(r"\s+", " ", cell))
                last = cell
        labels.append(" > ".join(parts))
    return labels


def span_end(rows, r, k, width):
    j = k + 1
    while j < width and (j >= len(rows[r]) or not rows[r][j].strip()):
        j += 1
    return j - 1


inventory, unit_rows, recon, formula_rows, column_rows = [], [], [], [], []
category_matrix = {}
for year, slug in FILES.items():
    path = only_file(slug)
    book = read_xlsx(path)
    rows = book["District Data Report"]
    width = max(len(r) for r in rows)
    modern = year >= 2020
    header_rows = [1, 2, 3] if modern else [1]
    labels = header_labels(rows, width, header_rows)
    text_rows = sorted({" ".join(c for c in r if c).strip() for i, r in enumerate(rows) if i > 4 and r and not re.match(r"^\s*\d", r[0]) and not re.match(r"(?i)state:|total", " ".join(r[:2]).strip()) and 0 < len([c for c in r if c]) <= 3})
    s = next(i for i, r in enumerate(rows) if r and re.match(r"(?i)state:\s*delhi", r[0]))
    e = next(i for i, r in enumerate(rows) if i > s and r and re.match(r"(?i)state:", r[0]))
    section = rows[s + 1:e]
    units = [r + [""] * (width - len(r)) for r in section if r and r[0].strip().isdigit() and not re.match(r"(?i)total", r[1])]
    total_row = next(r + [""] * (width - len(r)) for r in section if len(r) > 1 and re.match(r"(?i)total district", r[1].strip()))
    tcol = next(j for j, l in enumerate(labels) if re.fullmatch(r"(?i)total crimes? against women( \(ipc\+sll\))?", l.split(" > ")[0]))
    first_value_col = 3 if not modern else 2

    inventory.append({
        "year": year, "file": path.name, "official_url": URLS.get(path.name, ""), "sha256": sha256(path), "retrieved": "2026-11-10",
        "worksheets": "; ".join(f"{k} ({len(v)} rows)" for k, v in book.items()), "title": rows[0][0], "delhi_section_label": rows[s][0],
        "value_columns": tcol - first_value_col + 1, "total_column": labels[tcol], "footnotes": " | ".join(text_rows),
        "measure_printed": "Not stated in the file (no incidence/victims label)", "licence": "No explicit NCRB reuse licence found",
    })
    values = {}
    for r in units:
        name = r[1].strip()
        kind = "non_geographic" if norm(name) in NON_GEOGRAPHIC else "geographic_police_district"
        cells = {labels[j]: r[j] for j in range(first_value_col, tcol + 1)}
        values[name] = (kind, cells)
        unit_rows.append({"year": year, "printed_unit": name, "unit_kind": kind, "printed_total": r[tcol],
                          "blank_cells": sum(1 for v in cells.values() if v == ""), "non_numeric_cells": sum(1 for v in cells.values() if v and to_int(v) is None)})

    def total_of(kind=None):
        return sum(to_int(c[labels[tcol]]) or 0 for k, c in values.values() if kind is None or k == kind)
    all_units, geo, nongeo = total_of(), total_of("geographic_police_district"), total_of("non_geographic")
    printed = to_int(total_row[tcol])
    state = STATE_TOTALS[year]
    extra = {}
    if "Sheet1" in book and book["Sheet1"]:
        extra = {r[0].strip(): to_int(r[1]) for r in book["Sheet1"] if len(r) > 1}
    recon.append({
        "year": year, "units": len(values), "geographic_units": sum(1 for k, _ in values.values() if k != "non_geographic"),
        "non_geographic_units": sum(1 for k, _ in values.values() if k == "non_geographic"),
        "sum_all_units": all_units, "sum_geographic": geo, "sum_non_geographic": nongeo,
        "non_geographic_share_pct": round(100 * nongeo / all_units, 2), "printed_total_districts": printed,
        "delhi_ut_total": state, "units_minus_printed_total": all_units - printed, "units_minus_delhi_ut": all_units - state,
        "printed_total_minus_delhi_ut": printed - state, "sheet1_delhi_value": extra.get("Delhi UT", ""),
        "reconciles": all_units == printed == state,
    })

    # Printed sub-total formulas in the headings, e.g. "Rape (Col.24+Col.25)", checked per unit.
    colno = {int(rows[4][j]): j for j in range(width) if modern and j < len(rows[4]) and rows[4][j].strip().isdigit()}
    if modern:
        for j, l in enumerate(labels):
            own = l.split(" > ")[-1]
            plus = re.search(r"\(Col\.?\s*(\d+)\s*((?:\+\s*(?:Col\.?\s*)?\d+\s*)+)\)", own)
            ranges = re.findall(r"Col\.?\s*(\d+)\s+to\s+Col\.?\s*(\d+)", own.split("(")[-1] if "(" in own else "")
            if plus:
                numbers = [int(plus.group(1))] + [int(x) for x in re.findall(r"\d+", plus.group(2))]
            elif ranges:
                numbers = [n for a, b in ranges for n in range(int(a), int(b) + 1)]
            else:
                continue
            parent_no = int(rows[4][j])
            # A heading prints the sum of the named columns.
            kids = [colno[n] for n in numbers if n in colno]
            bad = []
            for name, (_, cells) in values.items():
                r = next(u for u in units if u[1].strip() == name)
                got = sum(to_int(r[k]) or 0 for k in kids)
                if to_int(r[j]) != got:
                    bad.append(f"{name}: printed {r[j]}, sum {got}")
            formula_rows.append({"year": year, "heading_col": parent_no, "heading": l[:90], "children_cols": "+".join(str(int(rows[4][k])) for k in kids),
                                 "units_checked": len(values), "units_failing": len(bad), "failures": "; ".join(bad)[:400]})
        # Top-level headings (those with their own column in the first header row) against the printed total.
        top = [j for j in range(first_value_col, tcol) if j < len(rows[1]) and rows[1][j].strip()]
        top_cols = []
        for j in top:
            sub = [k for k in range(j, span_end(rows, 1, j, tcol)) ] if True else []
            # Use the column that carries the heading's own total: first column of its span.
            top_cols.append(j)
        bad = []
        for r in units:
            got = sum(to_int(r[k]) or 0 for k in top_cols)
            if got != to_int(r[tcol]):
                bad.append(f"{r[1].strip()}: total {r[tcol]}, top-level sum {got}")
        formula_rows.append({"year": year, "heading_col": int(rows[4][tcol]), "heading": "Total vs sum of first-row headings (first column of each heading)", "children_cols": "+".join(str(int(rows[4][k])) for k in top_cols),
                             "units_checked": len(units), "units_failing": len(bad), "failures": "; ".join(bad)[:400]})
    for j in range(first_value_col, tcol + 1):
        column_rows.append({"year": year, "column_number": rows[4][j] if modern else j + 1, "printed_label": labels[j],
                            "delhi_sum_all_units": sum(to_int(c[labels[j]]) or 0 for _, c in values.values()),
                            "delhi_sum_geographic": sum(to_int(c[labels[j]]) or 0 for k, c in values.values() if k != "non_geographic")})
    category_matrix[year] = values

# 2022 cross-check: Delhi sums of district columns against the Table 3A.2 (2022) Delhi row.
t3a2 = [r for r in csv.DictReader(open(REVIEW / "delhi_table_3a2.csv", encoding="utf-8-sig")) if r["edition"] == "2022"]
t3a2.sort(key=lambda r: int(r["order"]) if r.get("order") else int(r["firstCol"]))
# The district file prints no IPC or SLL subtotal column, so those two Table 3A.2 rows are set aside.
aligned_3a2 = [r for r in t3a2 if r["code"] not in ("T_IPC", "T_SLL")]
district_2022 = [c for c in column_rows if c["year"] == 2022]
SECTION = re.compile(r"\b\d{3}[A-B]?\b")
AGE = lambda s: "women" if re.search(r"(?i)women \(", s) else "girls" if re.search(r"(?i)girls \(", s) else ""


def label_check(district_label, t_row):
    """Structural agreement: same age group, and any printed section numbers agree, unless a known label difference."""
    leaf = district_label.split(" > ")[-1]
    if AGE(leaf) != AGE(t_row["label"]):
        return "age_group_differs"
    a, b = set(SECTION.findall(leaf)), set(SECTION.findall(t_row["label"]))
    if a and b and a != b:
        return f"section_label_differs ({'/'.join(sorted(a))} vs {'/'.join(sorted(b))})"
    words = lambda s: {w for w in norm(s).split() if len(w) > 3 and not w.isdigit()}
    if not (words(leaf) & words(t_row["label"])) and not (words(district_label.split(' > ')[0]) & words(t_row["label"])) and not AGE(leaf):
        return "no_shared_words"
    return "consistent"


cross = []
if len(district_2022) == len(aligned_3a2):
    for c, t in zip(district_2022, aligned_3a2):
        i = to_int(t["I"])
        check = label_check(c["printed_label"], t)
        cross.append({"district_column": c["column_number"], "district_label": c["printed_label"][:100], "table_3a2_code": t["code"],
                      "table_3a2_label": t["label"][:90], "label_check": check, "district_sum": c["delhi_sum_all_units"],
                      "table_3a2_incidence": i, "result": "MATCH" if i == c["delhi_sum_all_units"] else "DIFFERENT"})
else:
    cross.append({"district_column": "", "district_label": f"{len(district_2022)} district columns vs {len(aligned_3a2)} Table 3A.2 rows", "table_3a2_code": "", "table_3a2_label": "", "label_check": "count_mismatch", "district_sum": "", "table_3a2_incidence": "", "result": "NOT_ALIGNED"})

write_csv("district-file-inventory.csv", list(inventory[0].keys()), inventory)
write_csv("district-unit-rows.csv", list(unit_rows[0].keys()), unit_rows)
write_csv("district-reconciliation-detail.csv", list(recon[0].keys()), recon)
write_csv("district-formula-checks.csv", list(formula_rows[0].keys()), formula_rows)
write_csv("district-column-labels.csv", list(column_rows[0].keys()), column_rows)
write_csv("district-2022-vs-table-3a2.csv", list(cross[0].keys()), cross)

# 2016 unallocated cases: does Sheet1 equal printed total minus unit sum for every state?
rows16 = read_xlsx(only_file("district-caw-2016"))
report = rows16["District Data Report"]
sheet1 = {r[0].strip(): to_int(r[1]) for r in rows16["Sheet1"] if len(r) > 1}
states, cur, units = {}, None, []
for r in report:
    if r and re.match(r"(?i)state:", r[0]):
        cur = r[0].split(":", 1)[1].strip(); states[cur] = {"units": 0, "printed": None}
    elif cur and len(r) > 23 and r[0].strip().isdigit() and not re.match(r"(?i)total", r[1]):
        states[cur]["units"] += to_int(r[23]) or 0
    elif cur and len(r) > 23 and re.match(r"(?i)total district", r[1].strip()):
        states[cur]["printed"] = to_int(r[23])
agree = {k: (v["printed"] - v["units"], sheet1.get(k)) for k, v in states.items() if v["printed"] is not None}
summary = {
    "reconciliation": recon,
    "formula_failures": sum(f["units_failing"] for f in formula_rows),
    "formula_checks": len(formula_rows),
    "cross_check_2022": {k: sum(1 for c in cross if c["result"] == k) for k in ("MATCH", "DIFFERENT", "NOT_ALIGNED")},
    "cross_check_label_checks": {k: sum(1 for c in cross if c["label_check"] == k) for k in sorted({c["label_check"] for c in cross})},
    "sheet1_2016_equals_unallocated": {"states_compared": len(agree), "states_agreeing": sum(1 for a, b in agree.values() if a == b), "disagreeing": {k: v for k, v in agree.items() if v[0] != v[1]}},
}
write_json("district-validation-summary.json", summary)
for r in recon:
    print(r)
print({k: v for k, v in summary.items() if k != "reconciliation"})
for c in cross:
    if c["result"] != "MATCH" or c["label_check"] != "consistent":
        print("  cross", c)
for f in formula_rows:
    if f["units_failing"]:
        print("  formula", f)
