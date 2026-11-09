# Geographic Explorer boundary source

Researched and retrieved 9 November 2026.

## Decision

SafeHer uses OpenStreetMap relation 1942586 as a contextual outline of Delhi. It was chosen because its identity and licence can be verified, unlike the GSDL layers, which state no open licence.

## Boundary identity

| Item | Verified value |
|---|---|
| Source | [OpenStreetMap relation 1942586](https://www.openstreetmap.org/relation/1942586) |
| Retrieval endpoint | `https://api.openstreetmap.org/api/0.6/relation/1942586/full.json` |
| Element | relation 1942586 |
| OSM version at retrieval | 152 |
| Last edited | 2026-08-08T10:40:29Z, changeset 187127298 |
| Retrieved | 2026-11-09T09:14:11.950Z |
| Tags | `type=boundary`, `boundary=administrative`, `admin_level=4`, `border_type=state`, `name=Delhi`, `ISO3166-2=IN-DL`, `ref=DL`, `ref:LGD:state=7`, `wikidata=Q9357528` |
| Members | 119 outer ways, 13 subarea relations, 1 label node, 1 admin-centre node |
| Geometry | Polygon, one outer ring, no holes, 880 positions |
| CRS | EPSG:4326 (WGS 84), `[longitude, latitude]` |
| Approximate area | 1,487 km², a project calculation used only as a sanity check |

The relation was found through Nominatim and confirmed against the OSM API. Overpass returned a 502 during research, so it is not used.

## Licence and attribution

- **Data:** ODbL 1.0. Attribution: © OpenStreetMap contributors. See [OSM copyright](https://www.openstreetmap.org/copyright) and the [attribution guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines).
- **Tiles:** separately governed by the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/). The site uses normal interactive viewing with visible attribution, a valid Referer, and no bulk download or tile caching. Availability is best-effort, and the service can be withdrawn. A public deployment with meaningful traffic should use a tile provider.
- **Redistribution:** the geometry is unchanged apart from ring assembly. Anyone redistributing it, or a database derived from it, must keep it under the ODbL. NCRB collections are stored separately and are not merged with the geometry. Whether a future combined dataset is a Derivative or Collective Database should be reviewed at that point. The [OSM licence FAQ](https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ) notes that its guidance is not legal advice.

## Limitations

- OSM is volunteer-maintained and is not a legally authoritative boundary.
- "Verified" in SafeHer means that source identity, tags, licence, geometry and coordinates were checked. It does not mean a survey-grade or official boundary.
- The outline has not been shown to match NCRB's "Delhi UT" or "Delhi City" reporting units. It must not be used to spatially locate NCRB counts.
- The relation's subarea members are not used. Delhi-wide NCRB totals must never be divided among any smaller unit.

## Rejected sources

| Source | Reason |
|---|---|
| GSDL police, revenue and ward layers | No open licence confirmed |
| DataMeet Delhi outline | Scraped from another map, so provenance is weak |
| GADM | Redistribution requires permission |
| geoBoundaries | Sub-state units not needed; district data pre-dates the 13-district scheme |

## Refreshing the boundary

```
cd backend
npm run geo:fetch
```

This is a dry run. It fetches the relation and stops if the relation ID or its identifying tags differ from those in `src/geography/osmBoundary.js`.

After reviewing the OSM history for any change:

```
node scripts/fetch-delhi-boundary.js --write
npm test
npm run geo:import -- --supersede
```

Safeguards:

- A different relation, level or name is rejected.
- A change in area above 5% stops the refresh unless `--accept-area-change` is passed after review.
- Without `--supersede`, the import refuses to replace the current version.
- `--supersede` marks the old version non-current and keeps it. It never deletes it.
- A different geometry under the same OSM version is reported as a conflict.

Never hand-edit the snapshot. Its SHA-256 hash is checked on import.
