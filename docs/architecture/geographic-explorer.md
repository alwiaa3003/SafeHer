# Geographic Explorer architecture

The first version is a geographic context map. It shows the outline of Delhi and holds no crime values.

## Data flow

```
OSM API
  │  npm run geo:fetch -- identity, geometry and tag checks
  ▼
backend/data/geography/delhi-boundary.geojson (22 KB, with ODbL notice)
  │  npm run geo:import -- validation, hash check, idempotent insert
  ▼
MongoDB geographicalUnits
  │  GET /api/geography, GET /api/geography/:id
  ▼
React page -> Leaflet map and information panel
```

Basemap tiles load directly from OpenStreetMap in the browser. They are not stored or proxied.

## Schema changes to `geographicalUnits`

| Field | Purpose |
|---|---|
| `adminLevel` | Verified source level |
| `provenance` | Provider, URLs, OSM element details and tags, retrieval date, licence, CRS, geometry hash |
| `verificationStatus` | `unverified` or `verified`. Verified records need geometry and complete provenance |
| `contextOnly` | Marks boundaries as context, defaulting to true |
| `isCurrent` | Allows a superseded version to be retained |

A new partial unique index permits one current unit per name and type. The existing `2dsphere` index is retained.

`source` references `dataSources`, so the OSM relation has its own entry there, keyed by relation and version.

## Validation

- `src/geography/osmBoundary.js`: identity, ring assembly, closure, numeric coordinates, a Delhi bounding box that also catches swapped axes, repeated positions, and hash.
- Mongoose: GeoJSON structure and global longitude-latitude ranges.
- MongoDB: the `2dsphere` index rejects invalid spherical geometry.

Geometry is not simplified. Holes and multiple polygons are supported, although the current boundary has neither.

## API

Both routes are read-only and return only verified, current units with geometry.

| Route | Result |
|---|---|
| `GET /api/geography` | Summaries without coordinates. Filters: `geographyType`, `page`, `limit` |
| `GET /api/geography/:id` | One unit with geometry |

Responses use the `{ data, meta }` envelope and include `GEOGRAPHIC_CONTEXT_ONLY` in `meta.caveats`. Errors use the shared handler: 400 invalid input, 404 unknown id, 503 database unavailable.

## Frontend

- `pages/GeographicExplorerPage.jsx` manages loading, error, empty and ready states.
- `features/geography/GeographyMap.jsx` is loaded lazily, so other pages do not download Leaflet.
- `features/geography/BoundaryInfo.jsx` shows provenance from the API.

## Design decisions

| Decision | Reason |
|---|---|
| Outline with no fill | A filled area can read as a measured value |
| Muted grey-warm basemap by CSS filter | Keeps attention on the outline and avoids a heatmap appearance |
| No markers, popups or crime fields | The map must not suggest located observations |
| Scroll-wheel zoom off | Prevents the map from capturing page scrolling; buttons, drag and touch remain |
| Snapshot file before import | Makes imports reproducible and reviewable without calling OSM each time |
| No crime data on geography records | Keeps boundaries and NCRB statistics separate |
