// Base-map tiles. The default is the public OpenStreetMap tile server, which is best-effort,
// has no service guarantee and may withdraw access from heavy users. A public deployment should
// set VITE_TILE_URL (and VITE_TILE_ATTRIBUTION) to a provider whose terms cover its traffic, or
// to a self-hosted tile server. See docs/research/safeher-district-map-production-readiness.md.
const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function tileConfig(env = import.meta.env) {
  const url = env.VITE_TILE_URL?.trim();
  if (!url) return { url: OSM_URL, attribution: OSM_ATTRIBUTION, maxZoom: 19 };
  // A custom provider still shows OSM-derived data, so its attribution must be given explicitly.
  const attribution = env.VITE_TILE_ATTRIBUTION?.trim() || OSM_ATTRIBUTION;
  const maxZoom = Number(env.VITE_TILE_MAX_ZOOM) || 19;
  return { url, attribution, maxZoom };
}
