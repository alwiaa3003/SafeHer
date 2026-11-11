import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { createNominatimGeocoder, placeSummary } from '../src/geocoding/nominatim.js';

const ok = (body) => ({ ok: true, json: async () => body });
const SEARCH_ITEM = {
  place_id: 101, lat: '28.6129', lon: '77.2295', name: 'India Gate', display_name: 'India Gate, Rajpath, New Delhi, Delhi, 110001, India',
  type: 'monument', category: 'historic', boundingbox: ['28.6120', '28.6138', '77.2286', '77.2304'],
  address: { historic: 'India Gate', road: 'Kartavya Path', suburb: 'Chanakya Puri', city: 'New Delhi', state: 'Delhi', postcode: '110001' },
};
const REVERSE_ITEM = { address: { house_number: '12', road: 'Example Marg', neighbourhood: 'Lajpat Nagar II', city_district: 'South East Delhi', city: 'Delhi', postcode: '110024' } };

// A fake clock: sleeping advances time instead of waiting.
function clock() {
  let t = 0;
  return { now: () => t, sleep: async (ms) => { t += ms; } };
}

function setup(fetchImpl, options = {}) {
  const c = clock();
  const geocoder = createNominatimGeocoder({ fetchImpl, now: c.now, sleep: c.sleep, ...options });
  return { app: createApp({ geocoder }), geocoder, clock: c };
}

describe('place search API', () => {
  it('searches within Delhi and returns public fields with attribution', async () => {
    const fetchImpl = vi.fn(async () => ok([SEARCH_ITEM]));
    const { app } = setup(fetchImpl);
    const res = await request(app).get('/api/places/search?q=India%20Gate');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{
      id: '101', name: 'India Gate', label: 'Kartavya Path, Chanakya Puri, New Delhi, Delhi', kind: 'monument',
      latitude: 28.6129, longitude: 77.2295, boundingBox: { south: 28.612, north: 28.6138, west: 77.2286, east: 77.2304 },
    }]);
    expect(res.body.meta).toMatchObject({ provider: 'Nominatim', attribution: '© OpenStreetMap contributors', cached: false });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('/search?');
    expect(url).toContain('bounded=1');
    expect(url).toContain('viewbox=76.83%2C28.89%2C77.35%2C28.4');
    expect(url).toContain('countrycodes=in');
    expect(init.headers['User-Agent']).toMatch(/^SafeHer\//);
  });

  it('works while the database is down', async () => {
    const { app } = setup(vi.fn(async () => ok([])));
    const res = await request(app).get('/api/places/search?q=Saket');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('caches repeated searches and never sends them upstream twice', async () => {
    const fetchImpl = vi.fn(async () => ok([SEARCH_ITEM]));
    const { app } = setup(fetchImpl);
    await request(app).get('/api/places/search?q=India%20Gate');
    const again = await request(app).get('/api/places/search?q=%20india%20%20gate%20');
    expect(again.body.meta.cached).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('spaces upstream requests at least 1.1 seconds apart', async () => {
    const times = [];
    let geocoderClock;
    const fetchImpl = vi.fn(async () => { times.push(geocoderClock.now()); return ok([]); });
    const { geocoder, clock: c } = setup(fetchImpl);
    geocoderClock = c;
    await Promise.all(['a1', 'b2', 'c3'].map((q) => geocoder.search(q)));
    expect(times).toEqual([0, 1100, 2200]);
  });

  it('refuses rather than queues when too many requests are waiting', async () => {
    const { app } = setup(vi.fn(() => new Promise(() => {})), { maxWaiting: 1 });
    void request(app).get('/api/places/search?q=first').then(() => {});
    await new Promise((r) => setTimeout(r, 20));
    const res = await request(app).get('/api/places/search?q=second');
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('GEOCODER_BUSY');
  });

  it('returns 502 without internals when the provider fails', async () => {
    const down = setup(vi.fn(async () => { throw new TypeError('network'); }));
    const res = await request(down.app).get('/api/places/search?q=Rohini');
    expect(res.status).toBe(502);
    expect(res.body.error).toEqual({ code: 'GEOCODER_UNAVAILABLE', message: 'The place search service could not be reached.' });
    const bad = setup(vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    expect((await request(bad.app).get('/api/places/search?q=Rohini')).status).toBe(502);
  });

  it.each([
    ['/api/places/search', 400],
    ['/api/places/search?q=a', 400],
    [`/api/places/search?q=${'x'.repeat(121)}`, 400],
    ['/api/places/search?q=Saket&limit=50', 400],
    ['/api/places/reverse?lat=28.6', 400],
    ['/api/places/reverse?lat=19.07&lon=72.87', 400],
    ['/api/places/reverse?lat=abc&lon=77.2', 400],
  ])('validates %s', async (path, status) => {
    const fetchImpl = vi.fn();
    const { app } = setup(fetchImpl);
    expect((await request(app).get(path)).status).toBe(status);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('reverse lookup API', () => {
  it('returns area names but never house numbers or postcodes', async () => {
    const fetchImpl = vi.fn(async () => ok(REVERSE_ITEM));
    const { app } = setup(fetchImpl);
    const res = await request(app).get('/api/places/reverse?lat=28.567891&lon=77.243219');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ road: 'Example Marg', neighbourhood: 'Lajpat Nagar II', area: 'South East Delhi', city: 'Delhi', label: 'Example Marg, Lajpat Nagar II, South East Delhi, Delhi' });
    expect(JSON.stringify(res.body)).not.toMatch(/110024|"12"/);
    expect(fetchImpl.mock.calls[0][0]).toContain('lat=28.5679&lon=77.2432');
  });

  it('returns null when nothing is found', async () => {
    const { app } = setup(vi.fn(async () => ok({ error: 'Unable to geocode' })));
    const res = await request(app).get('/api/places/reverse?lat=28.6&lon=77.2');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe('placeSummary', () => {
  it('handles a missing address', () => {
    expect(placeSummary(undefined)).toEqual({ road: null, neighbourhood: null, area: null, city: null, label: null });
  });
});
