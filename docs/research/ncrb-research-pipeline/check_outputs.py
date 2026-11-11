"""Validates generated research files: parseable, expected rows, arithmetic, hashes."""
import csv
import json

from common import OUT, PRODUCTION, ROOT, only_file, sha256

failures = []
def check(name, ok, detail=""):
    print(("PASS" if ok else "FAIL"), name, detail)
    if not ok:
        failures.append(name)

expected = {"ncrb-3a2-page-recheck.csv": 76, "ncrb-3a2-category-crosswalk.csv": 227, "ncrb-3a2-kidnapping-reconstruction.csv": 6, "ncrb-district-reconciliation.csv": 6, "ncrb-annual-cross-edition-check.csv": 15, "safeher-feature-feasibility.csv": 12}
for name, n in expected.items():
    rows = list(csv.DictReader(open(OUT / name, encoding="utf-8")))
    check(f"row count {name}", len(rows) == n, str(len(rows)))
for f in OUT.glob("*.csv"):
    rows = list(csv.reader(open(f, encoding="utf-8")))
    check(f"rectangular {f.name}", all(len(r) == len(rows[0]) for r in rows))
for f in OUT.glob("*.json"):
    json.loads(f.read_text(encoding="utf-8"))
    check(f"json {f.name}", True)

cross = list(csv.DictReader(open(OUT / "ncrb-annual-cross-edition-check.csv", encoding="utf-8")))
check("cross-edition no production mismatch", all(r["matches_production"] != "False" for r in cross))
ev = [r for r in csv.DictReader(open(OUT / "ncrb-2019-evidence.csv", encoding="utf-8")) if r["year"] == "2019"]
check("2019 values agree", {r["value"] for r in ev} == {"13395"}, str(len(ev)))
check("no value proposed as production 2019 elsewhere", 2019 not in PRODUCTION)
matrix = list(csv.DictReader(open(OUT / "ncrb-3a2-validation-matrix.csv", encoding="utf-8")))
check("TOT-4 production column stays pending", all(r["production_status"] == "PENDING" for r in matrix if r["rule"] == "TOT-4"))
cw = list(csv.DictReader(open(OUT / "ncrb-3a2-category-crosswalk.csv", encoding="utf-8")))
check("no crosswalk row claims comparability", {r["comparability_status"] for r in cw} <= {"not_assessed", "not_comparable"})
inv = list(csv.DictReader(open(OUT / "ncrb-source-inventory.csv", encoding="utf-8")))
bad = [r["local_file"] for r in inv if r["sha256"] and not next(ROOT.glob(f"docs/source-reports/**/{r['local_file']}"), None)]
check("inventory local files exist", not bad, str(bad))
for r in inv:
    if r["sha256"]:
        p = next(ROOT.glob(f"docs/source-reports/**/{r['local_file']}"))
        if sha256(p) != r["sha256"]:
            failures.append(r["local_file"])
check("inventory hashes match", not failures or all("inventory" not in x for x in failures))
print("FAILURES:", failures)
raise SystemExit(1 if failures else 0)
