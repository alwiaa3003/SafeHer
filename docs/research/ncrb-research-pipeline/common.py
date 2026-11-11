"""Shared helpers for the NCRB research pipeline. Standard library only.

Source PDFs and spreadsheets stay in the Git-ignored docs/source-reports/ folder.
Nothing here connects to a database or writes outside docs/research/data/.
"""
import csv
import hashlib
import html
import json
import re
import subprocess
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCES = ROOT / "docs" / "source-reports"
RETRIEVED = SOURCES / "retrieved-2026-11-10"
REVIEW = ROOT / "docs" / "research" / "table-3a2-review"
OUT = ROOT / "docs" / "research" / "data"
PDFTOTEXT = r"C:\Program Files\Git\mingw64\bin\pdftotext.exe"

VOLUMES = {
    "2018": "CrimeinIndia2018-VolumeI.pdf",
    "2022": "CrimeinIndia2022-VolumeI.pdf",
    "2023": "CrimeinIndia2023-PartI.pdf",
    "2024": "CrimeinIndia2024-VolumeI.pdf",
}
PRODUCTION = {2016: 15310, 2017: 13076, 2018: 13640, 2020: 10093, 2021: 14277, 2022: 14247, 2023: 13439, 2024: 13396}


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def only_file(slug):
    files = [p for p in (RETRIEVED / slug).iterdir() if p.is_file()]
    if len(files) != 1:
        raise RuntimeError(f"Expected one file in {slug}")
    return files[0]


def pdf_text_pages(path):
    out = subprocess.run([PDFTOTEXT, "-layout", str(path), "-"], capture_output=True, check=True).stdout
    return out.decode("utf-8", "replace").split("\f")


WORD = re.compile(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>')


def pdf_words(path, page):
    with tempfile.TemporaryDirectory() as folder:
        target = Path(folder) / "page.html"
        subprocess.run(
            [PDFTOTEXT, "-bbox", "-f", str(page), "-l", str(page), str(path), str(target)], capture_output=True, check=True
        )
        out = target.read_text(encoding="utf-8", errors="replace")
    return [(float(a), float(b), float(c), float(d), html.unescape(t)) for a, b, c, d, t in WORD.findall(out)]


def delhi_row(path, page, unit=r"Delhi(?:UT)?"):
    """Numbers on the Delhi line(s) of one page, read from pdftotext layout text."""
    out = subprocess.run(
        [PDFTOTEXT, "-layout", "-f", str(page), "-l", str(page), str(path), "-"], capture_output=True, check=True
    ).stdout.decode("utf-8", "replace")
    rows = []
    for line in out.splitlines():
        m = re.match(rf"\s*\d*\s*{unit}\b(.*)$".replace("(?:UT)?", r"(?:\s+UT)?"), line)
        if m:
            vals = [t for t in m.group(1).split() if re.fullmatch(r"-?[\d,]+(?:\.\d+)?|-|N\.?A\.?", t)]
            if vals:
                rows.append(vals)
    return rows


def annual_3a1_row(path, page_text, page, years):
    """Table 3A.1 Delhi numbers. In some editions the numbers sit on a different text line
    from the Delhi label, so the printed production values locate that line."""
    rows = [r for r in delhi_row(path, page) if len(r) >= 3]
    if rows:
        return rows[0]
    triple = r"\s+".join(str(PRODUCTION[y]) for y in years)
    for line in page_text.splitlines():
        if re.search(rf"(?<!\d){triple}(?!\d)", line):
            return [x for x in re.split(r"\s+", line[re.search(triple, line).start():].strip()) if re.fullmatch(r"[\d.]+", x)]
    return []


NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


def read_xlsx(path):
    """Returns {sheet: [row of text]}. Blank cells are ''. The file is read as data only."""
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")))
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = {r.get("Id"): r.get("Target") for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}
    book = {}
    for sheet in wb.find("m:sheets", NS):
        target = rels[sheet.get(REL)].lstrip("/")
        target = target if target.startswith("xl/") else "xl/" + target
        rows = []
        for r in ET.fromstring(z.read(target)).iter(f"{{{NS['m']}}}row"):
            row = []
            for c in r.findall("m:c", NS):
                col = 0
                for ch in re.match(r"[A-Z]+", c.get("r")).group(0):
                    col = col * 26 + ord(ch) - 64
                while len(row) < col:
                    row.append("")
                v = c.find("m:v", NS)
                if c.get("t") == "s" and v is not None:
                    row[col - 1] = shared[int(v.text)]
                elif c.get("t") == "inlineStr":
                    row[col - 1] = "".join(x.text or "" for x in c.iter(f"{{{NS['m']}}}t"))
                elif v is not None:
                    row[col - 1] = v.text
            rows.append(row)
        book[sheet.get("name")] = rows
    return book


def write_csv(name, fields, rows):
    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / name, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"wrote {name}: {len(rows)} rows")


def write_json(name, data):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {name}")


def to_int(text):
    return int(text.replace(",", "")) if re.fullmatch(r"-?[\d,]+", text or "") else None
