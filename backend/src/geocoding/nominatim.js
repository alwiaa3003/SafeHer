import { ApiError } from '../middleware/index.js';

// Follows the Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/):
// at most one request per second for the whole application, cached results, an
// identifying User-Agent, no autocomplete (search runs only when a user submits),
// and a base URL that can be switched to another provider or a self-hosted instance.

export const DELHI_BOUNDS = { west: 76.83, south: 28.4, east: 77.35, north: 28.89 };
export const ATTRIBUTION = {
  provider: 'Nominatim',
  attribution: '© OpenStreetMap contributors',
  licence: 'ODbL 1.0',
  policyUrl: 'https://operations.osmfoundation.org/policies/nominatim/',
};

// Parts of an address that could point at a private dwelling are never returned.
const PUBLIC_ADDRESS_PARTS = ['road', 'neighbourhood', 'quarter', 'suburb', 'city_district', 'city', 'state_district', 'state'];

export function placeSummary(address = {}) {
  const parts = PUBLIC_ADDRESS_PARTS.map((key) => address[key]).filter(Boolean);
  return {
    road: address.road ?? null,
    neighbourhood: address.neighbourhood ?? address.quarter ?? address.suburb ?? null,
    area: address.city_district ?? address.state_district ?? null,
    city: address.city ?? address.state ?? null,
    label: [...new Set(parts)].join(', ') || null,
  };
}

function searchResult(item) {
  const [south, north, west, east] = (item.boundingbox ?? []).map(Number);
  return {
    id: String(item.place_id),
    name: item.name || item.display_name.split(',')[0],
    label: placeSummary(item.address).label ?? item.display_name,
    kind: item.type ?? item.category ?? null,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    boundingBox: Number.isFinite(south) ? { south, north, west, east } : null,
  };
}

export function createNominatimGeocoder({
  baseUrl = 'https://nominatim.openstreetmap.org',
  userAgent = 'SafeHer/0.1 (academic research prototype)',
  fetchImpl = globalThis.fetch,
  minIntervalMs = 1100,
  cacheTtlMs = 24 * 60 * 60 * 1000,
  maxCacheEntries = 500,
  maxWaiting = 4,
  timeoutMs = 8000,
  now = () => Date.now(),
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  const cache = new Map();
  let queue = Promise.resolve();
  let waiting = 0;
  let lastRequestAt = -Infinity;

  function cached(key) {
    const hit = cache.get(key);
    if (!hit) return undefined;
    if (now() - hit.at > cacheTtlMs) {
      cache.delete(key);
      return undefined;
    }
    return hit.value;
  }

  function remember(key, value) {
    if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value);
    cache.set(key, { value, at: now() });
  }

  // One upstream request at a time, spaced at least minIntervalMs apart.
  function throttled(url) {
    if (waiting >= maxWaiting) {
      return Promise.reject(new ApiError(429, 'GEOCODER_BUSY', 'Place search is busy. Please try again in a moment.'));
    }
    waiting += 1;
    const run = queue.then(async () => {
      const wait = lastRequestAt + minIntervalMs - now();
      if (wait > 0) await sleep(wait);
      lastRequestAt = now();
      let response;
      try {
        response = await fetchImpl(url, {
          headers: { 'User-Agent': userAgent, Accept: 'application/json', 'Accept-Language': 'en' },
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        throw new ApiError(502, 'GEOCODER_UNAVAILABLE', 'The place search service could not be reached.');
      }
      if (!response.ok) throw new ApiError(502, 'GEOCODER_UNAVAILABLE', 'The place search service returned an error.');
      return response.json();
    });
    queue = run.catch(() => {}).finally(() => {
      waiting -= 1;
    });
    return run;
  }

  async function lookup(key, url, shape) {
    const hit = cached(key);
    if (hit !== undefined) return { value: hit, cached: true };
    const value = shape(await throttled(url));
    remember(key, value);
    return { value, cached: false };
  }

  return {
    search(query) {
      const normalised = query.trim().replace(/\s+/g, ' ').toLowerCase();
      const { west, north, east, south } = DELHI_BOUNDS;
      const params = new URLSearchParams({
        q: query.trim(), format: 'jsonv2', addressdetails: '1', limit: '6', countrycodes: 'in',
        viewbox: `${west},${north},${east},${south}`, bounded: '1',
      });
      return lookup(`s:${normalised}`, `${baseUrl}/search?${params}`, (items) => (Array.isArray(items) ? items.map(searchResult) : []));
    },
    reverse(latitude, longitude) {
      // Rounded to about 10 m, which is also the cache key.
      const lat = latitude.toFixed(4);
      const lon = longitude.toFixed(4);
      const params = new URLSearchParams({ lat, lon, format: 'jsonv2', addressdetails: '1', zoom: '17' });
      return lookup(`r:${lat},${lon}`, `${baseUrl}/reverse?${params}`, (item) => (item && !item.error ? placeSummary(item.address) : null));
    },
  };
}
