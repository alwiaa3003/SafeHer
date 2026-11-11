# SafeHer deployment guide

- **Date:** 10 November 2026
- **Status:** technically ready to deploy, **not deployed**.
- **Before any public deployment:**
  - the NCRB publication question (Gate A) must be resolved;
  - the owner must choose a tile provider (Gate D) and hosting (Gate E);
  - the owner must approve the database import (Gate C).

Nothing here has been created on any external service.

## 1. Recommended architecture

```
                 https://<site>                      https://<api>  (or <site>/api via a proxy)
Browser ──► Static host: frontend/dist ──fetch──► Node host: backend (npm start)
   │          (SPA rewrite to index.html)                │
   └──► Tile provider (VITE_TILE_URL)                    ├──► MongoDB Atlas (MONGODB_URI)
                                                         └──► Nominatim (GEOCODER_URL)
```

**Why this shape:**
- **The frontend is a static build.** Any static host or CDN can serve it cheaply and cache it.
- **The API is a small stateless Node process.** It needs one instance: the geocoder rate limit and cache are per process. With more instances, each would make its own Nominatim requests. Keep one instance, or move to a self-hosted or commercial geocoder.
- **The database is MongoDB Atlas,** the database the project already targets.
- **Same-origin option:** serving `/api` from the same origin, through a host rewrite or proxy, removes CORS configuration. Leave `VITE_API_BASE_URL` empty and keep `CORS_ORIGINS` minimal.

**Host types that fit, to be chosen by the owner after checking current terms and costs:**
- **Static:** Netlify, Cloudflare Pages, Vercel, GitHub Pages, or any web server.
- **Node API:** Render, Railway, Fly.io, a university server or a VPS.

Free tiers often sleep idle services, so the first request may be slow. The API tolerates this: it starts without the database and reconnects every 5 seconds.

## 2. Build and start commands

| Part | Command | Output or entry point |
|---|---|---|
| Frontend | `cd frontend && npm ci && npm run build` | `frontend/dist/` (static files; `index.html` plus `assets/`) |
| Backend | `cd backend && npm ci --omit=dev && npm start` | `node src/server.js` |
| Health check | `GET /api/health` | 200 `{ status: "ok" }` when the database is connected; 503 while it is connecting |

The static host must rewrite unknown paths to `/index.html`, so routes such as `/methodology` load directly.

## 3. Production configuration

**Backend (set on the host, never in Git):**

```
NODE_ENV=production
MONGODB_URI=<from Atlas: a database user limited to the SafeHer database>
PORT=<the host's port, often provided>
CORS_ORIGINS=https://<site origin>
TRUST_PROXY=1                       # most platforms put one proxy in front
GEOCODER_CONTACT=<project contact URL or email>   # Nominatim asks for identification
RATE_LIMIT_API=600
RATE_LIMIT_PLACES=20
# SAFEHER_REVIEW_DISTRICT_BOUNDARIES must NOT be set: the server refuses to start if it is.
```

**Frontend (build-time; public values only):**

```
VITE_API_BASE_URL=https://<api origin>    # empty if /api is same-origin
VITE_TILE_URL=<chosen provider template>  # see section 6
VITE_TILE_ATTRIBUTION=<provider credit and © OpenStreetMap contributors>
VITE_TILE_MAX_ZOOM=<provider max>
```

**Never put a database credential in a `VITE_` variable:** everything in them ships to browsers. A tile API key in `VITE_TILE_URL` is visible to users, as with every browser map. Restrict it to the site's domain in the provider's dashboard.

**Atlas:**
- Create a database user with readWrite on the SafeHer database only.
- Allow network access from the API host's outbound addresses. If the host has no fixed address, use the narrowest option Atlas offers and document it.

## 4. Deployment procedure (after approval)

1. **Locally:**
   - `npm test` and `npm run lint` in both packages, plus `npm run build`;
   - `npm run import:police-districts:check`.
2. **Database:** follow [the import readiness report](research/safeher-atlas-import-readiness.md).
   - Back up first.
   - Run `npm run seed` and `npm run geo:import` if the database is new.
   - Run the district import (`--dry-run`, then `--approved`), then `--verify`.
   - Each step needs approval.
3. **API:** deploy the backend with the variables above. Confirm `/api/health` returns 200.
4. **Frontend:** build with the `VITE_` variables, then deploy `dist/` with the SPA rewrite.
5. **Checks:** run the post-deployment checks in section 7.

## 5. Rollback

- **Frontend:** redeploy the previous `dist/` build. Static hosts keep earlier deploys, or keep the previous build artefact.
- **API:** redeploy the previous commit. The API has no migrations, so code rollback is independent of data.
- **Database:**
  - imports only insert, so a code rollback never needs a data rollback;
  - to remove the district import, use the targeted filters in the import readiness report;
  - to undo anything else, restore the pre-import Atlas backup.
- **Emergency:** stopping the API turns the site into an error state that shows no figures. It does not fall back to invented data.

## 6. Map tiles (Gate D)

The default `tile.openstreetmap.org` is fine for development and small private demonstrations. Its [usage policy](https://operations.osmfoundation.org/policies/tiles/) says:
- availability is best-effort, with no SLA;
- heavy use can be blocked without notice;
- commercial or donation-seeking sites should expect access to be withdrawn.

Options, from current published terms (checked 10 November 2026). **Verify before choosing; SafeHer has no accounts.**

| Option | Terms found | Key / account | Fit for SafeHer |
|---|---|---|---|
| **CARTO basemaps** (e.g. Positron light, Voyager) | Free non-commercial up to 5 M tile requests a month; free commercial up to 1 M. Attribution to CARTO and OpenStreetMap must stay visible ([FAQ](https://docs.carto.com/faqs/carto-basemaps)) | Raster tiles now need a free CARTO API key | Good: a light style matching SafeHer's palette, generous non-commercial limit, raster (works with the existing Leaflet layer) |
| **Stadia Maps** | Free tier for development, evaluation and non-commercial (including academic) use: 200,000 credits a month, no card; commercial use needs a paid plan ([docs](https://docs.stadiamaps.com/limits), [pricing](https://stadiamaps.com/pricing/)) | Account, domain or API key | Good for an academic site at low volume |
| **MapTiler Cloud** | Free plan limited to non-commercial use, with monthly session and request quotas; maps are suspended when exceeded ([terms](https://www.maptiler.com/cloud/terms/)). Quota figures differ between sources, so check the pricing page | Account and API key | Workable; the quota is tighter |
| **Thunderforest** | Free hobby plan: 150,000 tile requests a month; paid from about $125 a month ([pricing](https://thunderforest.com/pricing)) | Account and API key | Small quota; styles less suited to the palette |
| **Self-hosted** (Protomaps PMTiles extract for Delhi on static storage) | ODbL produced work; "© OpenStreetMap" attribution required; no per-request fees beyond storage and bandwidth ([docs](https://docs.protomaps.com/basemaps/downloads)) | None | Most independent, but needs a vector renderer (e.g. the protomaps-leaflet plugin). That is new frontend work; it is not done |

**Recommendation:** for an academic, non-commercial public launch, use CARTO's light raster basemap, or Stadia, with a domain-restricted key. Set:
- `VITE_TILE_URL` to the provider's template, including the key parameter;
- `VITE_TILE_ATTRIBUTION`, for example `© CARTO, © OpenStreetMap contributors`;
- `VITE_TILE_MAX_ZOOM`.

No code change is needed.

## 7. Post-deployment checks

- [ ] `GET /api/health` returns 200 with `database.status: connected`.
- [ ] `/api/police-districts/meta` lists 3 years, 21 categories, 16 districts and 7 units, and `boundary.status` is `unavailable` (until licensed).
- [ ] `/api/police-districts/boundaries` returns `features: []`.
- [ ] Response headers include `content-security-policy`, `strict-transport-security` and `x-content-type-options`, and no `x-powered-by`.
- [ ] A request from a non-allowed origin gets no `access-control-allow-origin`.
- [ ] The homepage loads the map with tiles and attribution. The boundary notice and the district table work.
- [ ] One place search works. Typing alone sends no request.
- [ ] Crime Trends, Data & Sources and Methodology load directly by URL (SPA rewrite).
- [ ] Mobile (about 390 px): the menu opens, the panels fit, and there is no horizontal scroll.
- [ ] No `SAFEHER_REVIEW_DISTRICT_BOUNDARIES` in the host environment, and no GSDL file in the deployed artefacts.

## 8. Operations

- **Logs:** the API logs startup, database connection state and unexpected-error messages only. Connection strings are masked. Requests and search terms are never logged.
- **Limits:** 600 requests per 15 minutes per client, and 20 place searches per minute. Adjust them with the environment variables.
- **Updates:** a data change follows the pipeline: rebuild, check, then the insert-only import. Figures are never edited in the database by hand.
