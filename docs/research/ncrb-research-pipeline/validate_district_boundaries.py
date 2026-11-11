"""Reads GSDL's public Delhi Police district layer (read-only ArcGIS REST queries), stores
the response in the Git-ignored source folder, and checks it against the NCRB police units
and the verified OSM Delhi outline. Research only: nothing is published or imported."""
import csv
import json
import math
import re
import subprocess
from pathlib import Path

from common import OUT, ROOT, RETRIEVED, sha256, write_csv, write_json

SERVICE = "https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer"
LAYER = f"{SERVICE}/0"
FOLDER = RETRIEVED / "gsdl-police-districts"
UA = "Mozilla/5.0 (research; SafeHer academic project)"


def get(url, name):
    FOLDER.mkdir(parents=True, exist_ok=True)
    target = FOLDER / name
    if not target.exists():
        subprocess.run(["curl", "-s", "-L", "-m", "90", "-A", UA, "-o", str(target), url], check=True)
    return json.loads(target.read_text(encoding="utf-8"))


service = get(f"{SERVICE}?f=json", "service.json")
layer = get(f"{LAYER}?f=json", "layer.json")
features = get(f"{LAYER}/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson", "districts.geojson")

osm = json.loads((ROOT / "backend/data/geography/delhi-boundary.geojson").read_text(encoding="utf-8"))
osm_ring = [tuple(p[:2]) for p in osm["geometry"]["coordinates"][0]]


def inside(pt, ring):
    x, y = pt
    hit = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit


def polygons(geom):
    raw = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    # The service returns [lon, lat, z]; only longitude and latitude are used.
    return [[[tuple(p[:2]) for p in ring] for ring in poly] for poly in raw]


def in_feature(pt, geom):
    for poly in polygons(geom):
        if inside(pt, poly[0]) and not any(inside(pt, hole) for hole in poly[1:]):
            return True
    return False


def ring_area_km2(ring):
    lat0 = math.radians(sum(p[1] for p in ring) / len(ring))
    kx, ky = 111.320 * math.cos(lat0), 110.574
    s = sum((x1 * kx) * (y2 * ky) - (x2 * kx) * (y1 * ky) for (x1, y1), (x2, y2) in zip(ring, ring[1:]))
    return abs(s) / 2


NCRB_GEOGRAPHIC = ["Central", "Dwarka", "East", "IGI Airport", "New Delhi", "North", "North-East", "North-West", "Outer", "Outer North", "Rohini", "Shahdara", "South", "South-East", "South-West", "West"]
norm = lambda s: re.sub(r"[^a-z]+", " ", s.lower().replace("igi airport", "airport")).strip()

rows, problems = [], []
feats = features.get("features", [])
for f in feats:
    props, geom = f["properties"], f["geometry"]
    name = str(props.get("DISTRICT", "")).strip()
    rings = [ring for poly in polygons(geom) for ring in poly]
    closed = all(r[0] == r[-1] for r in rings)
    lons = [p[0] for r in rings for p in r]
    lats = [p[1] for r in rings for p in r]
    area = sum(ring_area_km2(poly[0]) - sum(ring_area_km2(h) for h in poly[1:]) for poly in polygons(geom))
    xs = [p[0] for p in polygons(geom)[0][0]]
    ys = [p[1] for p in polygons(geom)[0][0]]
    centre = (sum(xs) / len(xs), sum(ys) / len(ys))
    match = [u for u in NCRB_GEOGRAPHIC if norm(u) == norm(name)]
    rows.append({
        "gsdl_district": name, "range": props.get("RANGE", ""), "printed_area_sqkm": props.get("AREA__SQKM", ""),
        "geometry_type": geom["type"], "coordinate_dimensions": len(geom["coordinates"][0][0] if geom["type"] == "Polygon" else geom["coordinates"][0][0][0]), "parts": len(polygons(geom)), "vertices": sum(len(r) for r in rings), "rings_closed": closed,
        "lon_range": f"{min(lons):.4f}–{max(lons):.4f}", "lat_range": f"{min(lats):.4f}–{max(lats):.4f}",
        "computed_area_km2": round(area, 1), "vertex_centroid_inside_osm_delhi": inside(centre, osm_ring),
        "ncrb_unit_by_name": match[0] if match else "", "name_match_method": "normalised name (IGI Airport = AIRPORT)" if match else "no match",
    })

# Coverage test on a grid inside the OSM outline: each point should fall in exactly one district.
lon_min = min(p[0] for p in osm_ring); lon_max = max(p[0] for p in osm_ring)
lat_min = min(p[1] for p in osm_ring); lat_max = max(p[1] for p in osm_ring)
step = 0.01
grid = {"inside_osm": 0, "covered_once": 0, "uncovered": 0, "overlapping": 0, "outside_osm_but_covered": 0}
y = lat_min
while y <= lat_max:
    x = lon_min
    while x <= lon_max:
        n = sum(1 for f in feats if in_feature((x, y), f["geometry"]))
        if inside((x, y), osm_ring):
            grid["inside_osm"] += 1
            grid["covered_once" if n == 1 else "uncovered" if n == 0 else "overlapping"] += 1
        elif n:
            grid["outside_osm_but_covered"] += 1
        x += step
    y += step

names = {r["ncrb_unit_by_name"] for r in rows if r["ncrb_unit_by_name"]}
summary = {
    "service": {k: service.get(k) for k in ("serviceDescription", "description", "copyrightText", "currentVersion", "spatialReference")},
    "document_info": service.get("documentInfo"),
    "layer": {k: layer.get(k) for k in ("name", "type", "geometryType", "copyrightText", "description", "editFieldsInfo", "editingInfo")},
    "layer_fields": [f["name"] for f in layer.get("fields", [])],
    "date_fields": [f["name"] for f in layer.get("fields", []) if f.get("type") == "esriFieldTypeDate"],
    "feature_count": len(feats),
    "ncrb_units_matched_by_name": len(names), "ncrb_units_unmatched": sorted(set(NCRB_GEOGRAPHIC) - names),
    "sum_computed_area_km2": round(sum(r["computed_area_km2"] for r in rows), 1), "osm_outline_area_km2_recorded": 1487.3,
    "grid_coverage_0.01deg": grid,
    "files": {p.name: {"bytes": p.stat().st_size, "sha256": sha256(p)} for p in FOLDER.iterdir()},
    "retrieved": "2026-11-10",
}
write_csv("district-boundary-validation.csv", list(rows[0].keys()) if rows else ["none"], rows)
write_json("district-boundary-summary.json", summary)
print(json.dumps(summary, ensure_ascii=False, indent=1)[:3000])
for r in rows:
    print(r["gsdl_district"], r["range"], r["parts"], r["vertices"], r["rings_closed"], r["computed_area_km2"], r["printed_area_sqkm"], r["vertex_centroid_inside_osm_delhi"], r["ncrb_unit_by_name"])
