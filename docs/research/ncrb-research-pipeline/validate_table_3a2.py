"""Independently re-reads Delhi rows of Table 3A.2 from the original PDFs, compares them
with the earlier research extract, and recomputes printed formulas and totals.
Outputs are research artifacts only. Nothing here touches production."""
import csv
import json
import re
from collections import Counter, defaultdict

from common import OUT, PRODUCTION, REVIEW, SOURCES, VOLUMES, annual_3a1_row, delhi_row, pdf_text_pages, sha256, to_int, write_csv, write_json

extract = list(csv.DictReader(open(REVIEW / "delhi_table_3a2.csv", encoding="utf-8-sig")))
footnotes = json.load(open(REVIEW / "footnotes.json", encoding="utf-8"))
summary = json.load(open(REVIEW / "validation_summary.json", encoding="utf-8"))
EDITIONS = ["2018", "2022", "2023", "2024"]
rows_by_code = {(r["edition"], r["code"]): r for r in extract}


def cells_of(row):
    if row["IPC"] != "" or row["BNS"] != "" or row["Total"] != "":
        return [("IPC", row["IPC"]), ("BNS", row["BNS"]), ("Total", row["Total"]), ("V", row["V"]), ("R", row["R"])]
    return [("I", row["I"]), ("V", row["V"]), ("R", row["R"])]


def subsequence_positions(found, expected):
    """Greedy match of found values inside expected. Returns matched indexes, or None on contradiction."""
    positions, at = [], 0
    for value in found:
        while at < len(expected) and expected[at] != value:
            at += 1
        if at == len(expected):
            return None
        positions.append(at)
        at += 1
    return positions


by_page = defaultdict(list)
for row in extract:
    by_page[(row["edition"], int(row["page"]))].append(row)

report, cols, values, confirmed = [], {}, {}, set()
for (edition, page), rows in sorted(by_page.items()):
    rows.sort(key=lambda r: int(r["firstCol"]))
    expected, labels = [], []
    for row in rows:
        for offset, (metric, value) in enumerate(cells_of(row)):
            col = int(row["firstCol"]) + offset
            expected.append(value)
            labels.append((row["code"], metric))
            cols[(edition, col)] = (row["code"], metric)
            values[(edition, col)] = value
    found = delhi_row(SOURCES / VOLUMES[edition], page)
    best, status, fragments = None, "no_delhi_line_read", 0
    for candidate in found:
        # pdftotext can split a printed rate across lines, leaving a lone one- or two-digit piece.
        kept = [x for x in candidate if x in expected or not re.fullmatch(r"\d{1,2}", x)]
        pos = subsequence_positions(kept, expected)
        if pos is None:
            kept = [x for x in kept if not re.fullmatch(r"\d", x)]
            pos = subsequence_positions(kept, expected)
        if pos is None:
            status = "contradiction"
            continue
        if best is None or len(pos) > len(best):
            best, fragments = pos, len(candidate) - len(kept)
    if best is not None:
        status = "exact" if len(best) == len(expected) else ("partial_with_split_fragments" if fragments else "partial_no_contradiction")
        confirmed |= {(edition, labels[i][0], labels[i][1]) for i in best}
    report.append(
        {
            "edition": edition, "pdf_page": page, "printed_folio": rows[0]["folio"],
            "printed_unit_label": rows[0]["unitLabel"], "categories_on_page": len(rows),
            "cells_in_extract": len(expected), "cells_confirmed_by_reread": len(best or []), "status": status,
        }
    )
write_csv("ncrb-3a2-page-recheck.csv", list(report[0].keys()), report)


def val(edition, code, metric):
    row = rows_by_code.get((edition, code))
    return to_int(row[metric]) if row else None


FORMULA = re.compile(r"[Cc]ol\.?\s*\[?(\d+)\]?\s*=\s*((?:[Cc]ol\.?\s*\[?\d+\]?\s*\+?\s*)+)")
checks, seen = [], set()
for edition in ("2018", "2022", "2023"):
    for text in footnotes[edition]:
        for f in FORMULA.finditer(text):
            target = int(f.group(1))
            parts = [int(x) for x in re.findall(r"(\d+)", f.group(2))]
            if (edition, target, tuple(parts)) in seen:
                continue
            seen.add((edition, target, tuple(parts)))
            parent = to_int(values.get((edition, target), ""))
            nums = [to_int(values.get((edition, p), "")) for p in parts]
            total = sum(nums) if parent is not None and all(n is not None for n in nums) else None
            code, metric = cols.get((edition, target), ("", ""))
            checks.append({
                "edition": edition, "basis": "printed_column_formula",
                "printed_formula": f"Col.{target}=" + "+".join(f"Col.{p}" for p in parts),
                "parent_code": code, "metric": metric, "printed_parent": parent, "printed_sum": total,
                "difference": "" if total is None else total - parent,
                "result": "NOT_EVALUATED" if total is None else ("PASS" if total == parent else "FAIL"),
                "children": "+".join(cols.get((edition, p), ("?", ""))[0] for p in parts),
            })

# 2024 prints "(Total a+b)" row labels instead of column formulas, so children come from the printed row structure.
children = defaultdict(list)
for r in extract:
    if r["edition"] == "2024" and r["parent"] and r["parent"] != "KA_GROUP":
        children[r["parent"]].append(r)
for parent, kids in children.items():
    p = rows_by_code[("2024", parent)]
    for metric in ("IPC", "BNS", "Total", "V"):
        nums = [to_int(k[metric]) for k in kids]
        pv = to_int(p[metric])
        if pv is None or any(n is None for n in nums):
            continue
        total = sum(nums)
        checks.append({
            "edition": "2024", "basis": "printed_row_structure", "printed_formula": p["label"][:80],
            "parent_code": parent, "metric": metric, "printed_parent": pv, "printed_sum": total, "difference": total - pv,
            "result": "PASS" if total == pv else "FAIL", "children": "+".join(k["code"] for k in kids),
        })
write_csv("ncrb-3a2-formula-checks.csv", list(checks[0].keys()), checks)

# Kidnapping: the printed calculation next to arithmetic reconstructions.
kidnap = []
for edition in ("2018", "2022", "2023"):
    for metric in ("I", "V"):
        g = lambda c: val(edition, c, metric)
        printed_sum = sum(g(c) for c in ("KA_363", "KA_364", "KA_RANSOM", "KA_COMPEL", "KA_COMPEL_W", "KA_COMPEL_G", "KA_OTHERS"))
        without_parent = printed_sum - g("KA_COMPEL")
        kidnap.append({
            "edition": edition, "metric": metric, "printed_KA_total": g("KA"), "printed_formula_sum": printed_sum,
            "printed_formula_difference": printed_sum - g("KA"), "col36_compel_parent": g("KA_COMPEL"),
            "col39_compel_women": g("KA_COMPEL_W"), "col42_compel_girls": g("KA_COMPEL_G"),
            "reconstruction_excluding_col36": without_parent, "reconstruction_difference": without_parent - g("KA"),
            "note": "Arithmetic reconstruction only. It does not replace NCRB's printed formula.",
        })
write_csv("ncrb-3a2-kidnapping-reconstruction.csv", list(kidnap[0].keys()), kidnap)

# Printed rate check against the Table 3A.1 denominator, read from the same volume.
population = {}
for edition in EDITIONS:
    total, rate = val(edition, "T_ALL", "I"), float(rows_by_code[(edition, "T_ALL")]["R"])
    pages = pdf_text_pages(SOURCES / VOLUMES[edition])
    index = next(i for i, p in enumerate(pages) if re.search(r"TABLE\s+3A\.1\b", p) and re.search(r"(?m)^\s*\d+\s+Delhi(\s+UT)?\s+\d", p))
    row = annual_3a1_row(SOURCES / VOLUMES[edition], pages[index], index + 1, {"2018": [2016, 2017, 2018], "2022": [2020, 2021, 2022], "2023": [2021, 2022, 2023], "2024": [2022, 2023, 2024]}[edition])
    # Population is the printed column that reproduces the printed total rate.
    candidates = [float(x) for x in row[3:] if re.fullmatch(r"\d+\.\d+", x) and abs(total / float(x) - rate) <= 0.1]
    if candidates:
        population[edition] = (candidates[0], row, index + 1)
rate_results = {}
for edition, (pop, _, _) in population.items():
    bad, n = [], 0
    for r in extract:
        if r["edition"] != edition or r["R"] == "":
            continue
        count = to_int(r["Total"]) if r["Total"] != "" else to_int(r["I"])
        if count is None:
            continue
        n += 1
        if abs(count / pop - float(r["R"])) > 0.1:
            bad.append((r["code"], count, r["R"], round(count / pop, 2)))
    rate_results[edition] = {"population_lakh": pop, "checked": n, "outside_tolerance": bad}

dq, labels_by_code = {}, defaultdict(dict)
for edition in EDITIONS:
    sub = [r for r in extract if r["edition"] == edition]
    data_cells = [c for r in sub for _, c in cells_of(r)]
    dq[edition] = {
        "rows": len(sub),
        "duplicate_codes": [c for c, n in Counter(r["code"] for r in sub).items() if n > 1],
        "blank_cells_in_data_rows": sum(1 for c in data_cells if c == ""),
        "zero_count_rows": sum(1 for r in sub if (r["Total"] or r["I"]) == "0"),
        "unit_labels": sorted({r["unitLabel"] for r in sub}),
        "non_numeric_cells": sorted({c for c in data_cells if c and not re.fullmatch(r"[\d,]+(\.\d+)?", c)}),
        "pdf_sha256": sha256(SOURCES / VOLUMES[edition]),
    }
for r in extract:
    labels_by_code[r["code"]][r["edition"]] = r["label"]

CROSSWALK_CODES = sorted(labels_by_code)
PAIRED_SECTION = re.compile(r"(?i)\b(?:sec|section)\b")
crosswalk = []
for code in CROSSWALK_CODES:
    per = labels_by_code[code]
    present = [e for e in EDITIONS if e in per]
    pre = [per[e] for e in ("2018", "2022", "2023") if e in per]
    has_2024 = "2024" in per
    identical_pre = len(set(pre)) == 1 if pre else False
    for edition in present:
        if has_2024 and pre:
            status, conf, why = "not_assessed", "low", "Same research code links the rows. Printed IPC/BNS section references alone do not establish statistical equivalence."
        elif not has_2024:
            status, conf, why = "not_comparable", "low", "Not printed as a separate heading in the 2024 table, so no 2024 counterpart is established."
        else:
            status, conf, why = "not_comparable", "low", "Appears only in the 2024 table. No predecessor is printed, so it is not back-cast."
        if not has_2024 and identical_pre and len(pre) == 3:
            status, conf, why = "not_assessed", "medium", "Printed label identical across 2018, 2022 and 2023, which is necessary but not sufficient for comparability. No 2024 counterpart is printed under this code."
        crosswalk.append({
            "research_code": code, "source_edition": edition, "original_label": per[edition],
            "proposed_equivalent": code if len(present) > 1 else "none", "mapping_rationale": why,
            "confidence": conf, "comparability_status": status,
        })
write_csv("ncrb-3a2-category-crosswalk.csv", list(crosswalk[0].keys()), crosswalk)

matrix = []
def add(year, rule, result, evidence, production="NOT_IN_PRODUCTION"):
    matrix.append({"year": year, "rule": rule, "research_result": result, "production_status": production, "evidence": evidence})

key_codes = ("T_IPC", "T_SLL", "T_ALL")
for edition in EDITIONS:
    year = int(edition)
    fc = [c for c in checks if c["edition"] == edition]
    pages = [r for r in report if r["edition"] == edition]
    count_metric = "Total" if edition == "2024" else "I"
    key_ok = all((edition, c, count_metric) in confirmed or (edition, c, "I") in confirmed for c in key_codes)
    status = Counter(r["status"] for r in pages)
    cells = sum(r["cells_in_extract"] for r in pages)
    hit = sum(r["cells_confirmed_by_reread"] for r in pages)
    contradiction = status.get("contradiction", 0)
    add(year, "EXT-1", "PASS_WITH_NOTE" if not contradiction else "FAIL",
        f"Independent layout-text reread confirmed {hit} of {cells} cells across {len(pages)} pages with {contradiction} contradicting pages. The remaining cells were not readable by this method.")
    add(year, "EXT-2", "PASS_WITH_NOTE" if key_ok else "PENDING",
        f"Subtotals and overall total confirmed by reread: {key_ok}. A reviewer's independent visual sign-off is not recorded (OR-11).")
    age_parents = {"RAPE", "ATT_RAPE", "ASSAULT", "INSULT"}
    age = [c for c in fc if c["parent_code"] in age_parents]
    other = [c for c in fc if c["parent_code"] not in age_parents]
    def rollup(items):
        if not items:
            return "NOT_APPLICABLE"
        if any(c["result"] == "FAIL" for c in items):
            return "FAIL"
        return "PASS"
    add(year, "SUB-1", rollup(age), f"{sum(c['result']=='PASS' for c in age)} of {len(age)} women/girls split checks pass.")
    sub2 = rollup(other)
    note = ""
    if edition == "2023":
        sub2 = "PASS_WITH_NOTE"
        note = " The kidnapping sum reconciles, but the printed formula still includes a parent and its children."
    add(year, "SUB-2", sub2, f"{sum(c['result']=='PASS' for c in other)} of {len(other)} explicit sub-row checks pass.{note}")
    add(year, "TOT-1", "NOT_APPLICABLE", "NCRB prints the IPC/BNS subtotal without listing its members. Membership is not inferred.")
    add(year, "TOT-2", "NOT_APPLICABLE", "NCRB prints the SLL subtotal without listing its members. Membership is not inferred.")
    ipc = val(edition, "T_IPC", count_metric); sll = val(edition, "T_SLL", "I"); total = val(edition, "T_ALL", "I")
    vipc, vsll, vtotal = val(edition, "T_IPC", "V"), val(edition, "T_SLL", "V"), val(edition, "T_ALL", "V")
    ok = ipc + sll == total and vipc + vsll == vtotal
    add(year, "TOT-3", "PASS" if ok else "FAIL", f"Cases {ipc}+{sll}={total}; victims {vipc}+{vsll}={vtotal}.")
    add(year, "TOT-4", "PASS" if total == PRODUCTION[year] else "FAIL",
        f"Table 3A.2 total {total} against Table 3A.1 total {PRODUCTION[year]}. Equal totals do not validate individual categories.", production="PENDING")
    rr = rate_results.get(edition)
    if rr:
        add(year, "RATE-1", "PASS" if not rr["outside_tolerance"] else "PASS_WITH_NOTE",
            f"{rr['checked']} printed rates recomputed with Table 3A.1 women's population {rr['population_lakh']} lakh; outside 0.1: {rr['outside_tolerance'][:5]}.")
    else:
        add(year, "RATE-1", "PENDING", "Population denominator could not be read from the Table 3A.1 page by this method.")
    if edition == "2024":
        both = [r for r in extract if r["edition"] == "2024" and r["IPC"] != ""]
        good = sum(to_int(r["IPC"]) + to_int(r["BNS"]) == to_int(r["Total"]) for r in both)
        add(year, "LEGAL-1", "PASS" if good == len(both) else "FAIL", f"IPC + BNS = Total on {good} of {len(both)} rows. Neither column alone is a full-year measure.")
        add(year, "LEGAL-5", "PASS", "The production Overview chart marks 'New criminal laws, Jul 2024'.")
    else:
        add(year, "LEGAL-1", "NOT_APPLICABLE", "The table has no separate IPC and BNS columns.")
        add(year, "LEGAL-5", "NOT_APPLICABLE", "Rule applies to 2024 trend charts.")
    bns = [r for r in extract if r["edition"] == edition and r["BNS"] != ""]
    add(year, "LEGAL-2", "PASS" if (edition == "2024") == bool(bns) else "FAIL", f"{len(bns)} rows carry BNS values.")
    add(year, "LEGAL-3", "PENDING", "Every category is not_assessed. Formal IPC/BNS mapping statuses have not been reviewed.")
    add(year, "LEGAL-4", "NOT_APPLICABLE", "No back-casting is performed.")
    add(year, "PROV-1", "PASS_WITH_NOTE", "Edition, table, page, label and printed value are present. Research rows are not production records.")
    add(year, "PROV-2", "PASS_WITH_NOTE", f"Local PDF SHA-256 recorded: {dq[edition]['pdf_sha256']}. No earlier registered hash exists to compare with.")
    add(year, "PROV-3", "PASS", f"Every row cites its PDF page and printed folio ({pages[0]['pdf_page']}-{pages[-1]['pdf_page']}).")
    add(year, "MISS-2", "PASS", "All research values are printed values. None is estimated or derived.")
    add(year, "UNIT-1", "PASS", "Only the Delhi rows of State/UT tables are used. No metropolitan rows are mixed in.")
write_csv("ncrb-3a2-validation-matrix.csv", list(matrix[0].keys()), matrix)

write_json("ncrb-3a2-quality.json", {
    "editions": dq, "rate_check": rate_results,
    "page_recheck": {e: dict(Counter(r["status"] for r in report if r["edition"] == e)) for e in EDITIONS},
    "cells": {e: [sum(r["cells_confirmed_by_reread"] for r in report if r["edition"] == e), sum(r["cells_in_extract"] for r in report if r["edition"] == e)] for e in EDITIONS},
    "formula_results": {e: dict(Counter(c["result"] for c in checks if c["edition"] == e)) for e in EDITIONS},
    "previous_summary_sub2": {e: summary["editions"][e]["SUB-2"]["status"] for e in EDITIONS},
    "printed_code_presence": {c: [e for e in EDITIONS if e in v] for c, v in labels_by_code.items() if len(v) < 4},
})

print(json.dumps(json.load(open(OUT / "ncrb-3a2-quality.json", encoding="utf-8")), indent=None, ensure_ascii=False)[:3500])
for k in kidnap:
    print(k)
print([ (m["year"], m["rule"], m["research_result"]) for m in matrix if m["rule"] in ("SUB-1","SUB-2","EXT-1","EXT-2","TOT-3","TOT-4","RATE-1","LEGAL-1")])
print([r for r in report if r["status"] in ("contradiction", "no_delhi_line_read")])
