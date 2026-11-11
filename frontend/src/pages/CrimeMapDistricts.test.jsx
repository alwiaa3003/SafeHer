import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { GeoJSON } from 'react-leaflet';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';
import { MISSING_FILL, RAMP, ZERO_FILL } from '../features/districts/districtScale';
import { INTERPRETATION } from '../features/districts/DistrictPanel';
import { apiResponse } from '../test/apiFixture';
import { publicBoundaryCollection } from '../data';
import { tileConfig } from '../features/geography/tiles';
import { districtResponse, PUBLISHED_BOUNDARY, REVIEW_BOUNDARY, testDistrictBoundaries } from '../test/districtFixture';
import { geographyResponse } from '../test/geographyFixture';
import { jsonResponse } from '../test/trendFixture';

const NON_GEOGRAPHIC = ['Crime Branch', 'EOW', 'Metro', 'RAILWAY', 'SPUWAC', 'Spl Cell', 'Vigilance'];
const DISTRICTS = ['Central', 'Dwarka', 'East', 'IGI Airport', 'New Delhi', 'North', 'North-East', 'North-West', 'Outer', 'Outer North', 'Rohini', 'Shahdara', 'South', 'South-East', 'South-West', 'West'];

beforeEach(() => {
  vi.clearAllMocks();
});

const leaflet = () => globalThis.__leaflet;

// districts: options passed to the district fixture (boundaries, boundary status, omitted values).
function stub({ districts = {}, place } = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const u = String(url);
    if (u.startsWith('/api/police-districts/')) return districtResponse(url, districts);
    if (place && u.startsWith('/api/places/search')) return jsonResponse({ data: [place], meta: {} });
    if (u.includes('/api/geography')) return geographyResponse(url);
    return apiResponse(url);
  }));
}
const withPolygons = (extra = {}) => stub({ districts: { boundaries: testDistrictBoundaries(), boundary: REVIEW_BOUNDARY, ...extra } });

function renderPage() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  return render(<RouterProvider router={router} />);
}

// The district layer is the GeoJSON drawn with a FeatureCollection.
const districtCalls = () => GeoJSON.mock.calls.map(([props]) => props).filter((p) => p.data?.type === 'FeatureCollection');
const districtLayer = () => districtCalls().at(-1);
async function drawn() {
  await waitFor(() => expect(districtCalls().length).toBeGreaterThan(0));
  return districtLayer();
}
const feature = (layer, code) => layer.data.features.find((f) => f.properties.code === code);

// A stand-in for a Leaflet path, recording the tooltip and event handlers bound to it.
function fakeLayer() {
  const layer = { handlers: {}, tooltip: null, setStyle: vi.fn() };
  layer.bindTooltip = vi.fn((html) => { layer.tooltip = html; });
  layer.on = vi.fn((handlers) => Object.assign(layer.handlers, handlers));
  return layer;
}
async function clickDistrict(code) {
  const props = await drawn();
  const layer = fakeLayer();
  props.onEachFeature(feature(props, code), layer);
  act(() => layer.handlers.click());
  return layer;
}
const districtPanel = () => within(screen.getByRole('region', { name: /^(Central|Rohini|West|Dwarka)$/ }));

describe('production safeguards', () => {
  it('a production build never draws a review copy, but keeps a published layer', () => {
    const review = { type: 'FeatureCollection', ...testDistrictBoundaries(), meta: { boundary: REVIEW_BOUNDARY } };
    const withheld = publicBoundaryCollection(review, true);
    expect(withheld.features).toEqual([]);
    expect(withheld.meta.boundary.status).toBe('unavailable');
    expect(withheld.meta.boundary.reason).toMatch(/never draws/);
    expect(publicBoundaryCollection(review, false)).toBe(review);
    const published = { ...testDistrictBoundaries(), meta: { boundary: PUBLISHED_BOUNDARY } };
    expect(publicBoundaryCollection(published, true).features).toHaveLength(16);
  });

  it('uses OSM tiles by default and a configured provider when one is set', () => {
    expect(tileConfig({})).toMatchObject({ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19 });
    expect(tileConfig({}).attribution).toContain('https://www.openstreetmap.org/copyright');
    const custom = tileConfig({ VITE_TILE_URL: 'https://tiles.example.org/{z}/{x}/{y}.png', VITE_TILE_ATTRIBUTION: '© Example, © OpenStreetMap contributors', VITE_TILE_MAX_ZOOM: '18' });
    expect(custom).toEqual({ url: 'https://tiles.example.org/{z}/{x}/{y}.png', attribution: '© Example, © OpenStreetMap contributors', maxZoom: 18 });
    // A provider without its own attribution still credits OpenStreetMap.
    expect(tileConfig({ VITE_TILE_URL: 'https://tiles.example.org/{z}/{x}/{y}.png' }).attribution).toContain('OpenStreetMap');
  });

  it('credits a published boundary layer and its licence in the key, with no review warning', async () => {
    stub({ districts: { boundaries: testDistrictBoundaries(), boundary: PUBLISHED_BOUNDARY } });
    renderPage();
    await drawn();
    const key = within(await screen.findByRole('region', { name: /Registered cases · 2022/ }));
    expect(key.getByText(/Boundaries: Test Provider\./)).toBeInTheDocument();
    expect(key.getByRole('link', { name: 'CC BY 4.0 (test)' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    expect(key.queryByText(/review copy/)).not.toBeInTheDocument();
  });
});

describe('police-district choropleth', () => {
  it('draws all 16 districts and no non-geographic unit', async () => {
    withPolygons();
    renderPage();
    const props = await drawn();
    const names = props.data.features.map((f) => f.properties.name).sort();
    expect(names).toEqual([...DISTRICTS].sort());
    expect(names.some((n) => NON_GEOGRAPHIC.includes(n))).toBe(false);
    expect(props.bubblingMouseEvents).toBe(false);
  });

  it('fills each district from its own printed value, on a light-to-dark terracotta scale', async () => {
    withPolygons();
    renderPage();
    const props = await drawn();
    const fills = props.data.features.map((f) => props.style(f).fillColor);
    expect(fills.every((f) => RAMP.includes(f))).toBe(true);
    // 2022 totals: New Delhi 103 is among the lowest; South-East 1,284 is the highest.
    expect(props.style(feature(props, 'new-delhi')).fillColor).toBe(RAMP[1]);
    expect(props.style(feature(props, 'south-east')).fillColor).toBe(RAMP[4]);
    const layer = fakeLayer();
    props.onEachFeature(feature(props, 'central'), layer);
    expect(layer.tooltip).toBe('<strong>Central</strong><br>625 registered cases');
  });

  it('opens a district panel with the count, year, category, source, precision and notice', async () => {
    withPolygons();
    renderPage();
    await clickDistrict('central');
    const panel = districtPanel();
    expect(panel.getByRole('heading', { name: 'Central' })).toBeInTheDocument();
    expect(panel.getByText('625')).toBeInTheDocument();
    expect(panel.getByText('registered cases in 2022')).toBeInTheDocument();
    expect(panel.getByText('Total crime against women', { selector: 'dd' })).toBeInTheDocument();
    expect(panel.getByText('Total Crime against Women (IPC+SLL)', { selector: 'dd' })).toBeInTheDocument();
    expect(panel.getByText('Police district', { selector: 'dd' })).toBeInTheDocument();
    expect(panel.getByText(INTERPRETATION)).toBeInTheDocument();
    expect(panel.getByRole('link', { name: 'NCRB District-wise Crime against Women 2022' })).toHaveAttribute('href', 'https://www.ncrb.mha.gov.in/uploads/files/3-DistrictwiseCrimeagainstWomen20221.xlsx');
    expect(panel.getByText(/row "Central", column 54/)).toBeInTheDocument();
    expect(panel.getByText('Change since 2021').nextSibling).toHaveTextContent('−20 (−3.1%)');
    expect(screen.getByText('Central police district selected. 625 registered cases in 2022.')).toBeInTheDocument();
    expect(districtLayer().selectedCode ?? null).toBeNull();
    expect(districtLayer().style(feature(districtLayer(), 'central'))).toMatchObject({ weight: 3.5, color: '#26211c' });
  });

  it('updates the map, legend and panel when the year changes', async () => {
    const user = userEvent.setup();
    withPolygons();
    renderPage();
    await clickDistrict('central');
    const before = districtCalls().length;
    await user.click(screen.getByRole('button', { name: '2021' }));
    expect(screen.getByRole('button', { name: '2021' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Registered cases · 2021' })).toBeInTheDocument();
    expect(districtPanel().getByText('645')).toBeInTheDocument();
    expect(districtPanel().getByText('Change since 2020').nextSibling).toHaveTextContent('+165 (+34.4%)');
    expect(districtCalls().length).toBeGreaterThan(before);
    await user.click(screen.getByRole('button', { name: '2020' }));
    expect(districtPanel().getByText('480')).toBeInTheDocument();
    expect(districtPanel().getByText(/No earlier validated year/)).toBeInTheDocument();
  });

  it('updates the map and panel when the category changes, without inventing other years', async () => {
    const user = userEvent.setup();
    withPolygons();
    renderPage();
    await clickDistrict('central');
    await user.click(screen.getByRole('button', { name: 'Categories' }));
    await user.click(await screen.findByRole('radio', { name: /Rape \(Sec\. 376 IPC\)/ }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/police-districts/statistics?category=rape', expect.anything()));
    expect(await districtPanel().findByText('111')).toBeInTheDocument();
    expect(screen.getByText('Rape (Sec. 376 IPC)', { selector: 'p' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: '2020' }));
    expect(districtPanel().getByText('Not available')).toBeInTheDocument();
    expect(districtPanel().getByText(/checked for 2022 only\. This is not the same as zero\./)).toBeInTheDocument();
    const layer = districtLayer();
    expect(layer.data.features.every((f) => layer.style(f).fillColor === MISSING_FILL)).toBe(true);
    expect(screen.getByText(/This category is validated for 2022 only/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show 2022' }));
    expect(districtPanel().getByText('111')).toBeInTheDocument();
  });

  it('shows a missing figure as unavailable, never as zero', async () => {
    withPolygons({ omit: ['central|2022', 'west|2022'] });
    renderPage();
    await clickDistrict('central');
    const layer = districtLayer();
    expect(layer.style(feature(layer, 'central')).fillColor).toBe(MISSING_FILL);
    expect(layer.style(feature(layer, 'west'))).toMatchObject({ fillColor: MISSING_FILL, dashArray: '4 3' });
    expect(districtPanel().getByText('Not available')).toBeInTheDocument();
    expect(districtPanel().queryByText('0')).toBeNull();
    expect(screen.getByText(/Not available \(no validated figure; not zero\)/)).toBeInTheDocument();
  });

  it('shows a printed zero as zero, distinct from missing', async () => {
    const user = userEvent.setup();
    withPolygons();
    renderPage();
    await drawn();
    await user.click(screen.getByRole('button', { name: 'Categories' }));
    await user.click(await screen.findByRole('radio', { name: /Murder with Rape\/Gang Rape/ }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(districtLayer().style(feature(districtLayer(), 'central')).fillColor).toBe(ZERO_FILL));
    expect(screen.getByText('0 cases')).toBeInTheDocument();
    await clickDistrict('central');
    expect(districtPanel().getByText('0')).toBeInTheDocument();
    expect(districtPanel().getByText('registered cases in 2022')).toBeInTheDocument();
  });

  it('labels review-only boundaries in the key', async () => {
    withPolygons();
    renderPage();
    await drawn();
    expect(screen.getByRole('note')).toHaveTextContent(/GSDL local review copy.*not licensed for publication/);
  });
});

describe('district search', () => {
  it('offers an exactly named police district and selects it', async () => {
    const user = userEvent.setup();
    withPolygons();
    renderPage();
    await drawn();
    await user.type(screen.getByRole('searchbox'), 'Rohini district{Enter}');
    const result = await screen.findByRole('button', { name: /^Rohini\s*Police district · NCRB figures$/ });
    await user.click(result);
    expect(screen.getByRole('region', { name: 'Rohini' })).toBeInTheDocument();
    expect(leaflet().map.flyToBounds).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ maxZoom: 13 }));
  });

  it('selects the district that contains a searched place, and says the figure is district-wide', async () => {
    const user = userEvent.setup();
    const place = { id: 'p', name: 'Test Place', label: 'Test Place, Delhi', latitude: 28.525, longitude: 77.025 };
    stub({ districts: { boundaries: testDistrictBoundaries(), boundary: REVIEW_BOUNDARY }, place });
    renderPage();
    await drawn();
    await user.type(screen.getByRole('searchbox'), 'Test Place{Enter}');
    await user.click(await screen.findByRole('button', { name: /Test Place/ }));
    const panel = within(screen.getByRole('region', { name: 'Central' }));
    expect(panel.getByText(/Test Place lies in this police district\. The figure is for the whole district, not this place\./)).toBeInTheDocument();
  });

  it('does not offer a district for partial names', async () => {
    const user = userEvent.setup();
    withPolygons();
    renderPage();
    await drawn();
    await user.type(screen.getByRole('searchbox'), 'Roh{Enter}');
    await screen.findByRole('list', { name: 'Search results' });
    expect(screen.queryByRole('list', { name: 'Police districts' })).toBeNull();
  });
});

describe('without a publishable boundary', () => {
  it('draws no districts, explains why, and offers the figures as a table', async () => {
    const user = userEvent.setup();
    stub();
    renderPage();
    const notice = await screen.findByRole('region', { name: 'District boundaries cannot be shown yet' });
    expect(notice).toHaveTextContent(/All Rights Reserved/);
    expect(districtCalls()).toEqual([]);
    expect(screen.queryByRole('list', { name: 'Colour classes' })).toBeNull();
    expect(screen.getByText(/No district shapes are drawn, so there is no colour key/)).toBeInTheDocument();
    await user.click(within(notice).getByRole('button', { name: 'View district figures' }));
    const table = within(screen.getByRole('region', { name: 'District figures' }));
    const rows = table.getAllByRole('table')[0].querySelectorAll('tbody tr');
    expect([...rows].map((r) => r.querySelector('th').textContent)).toEqual([...DISTRICTS].sort((a, b) => a.localeCompare(b)));
    expect(table.getByRole('heading', { name: 'Units not shown on the map' })).toBeInTheDocument();
    for (const unit of NON_GEOGRAPHIC) expect(table.getByText(unit)).toBeInTheDocument();
    expect(table.getByText(/All 23 units together: 14,247/)).toBeInTheDocument();
    await user.click(table.getByRole('button', { name: 'West' }));
    expect(within(screen.getByRole('region', { name: 'West' })).getByText('957')).toBeInTheDocument();
  });

  it('shows an error and no figures when the district service fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const u = String(url);
      if (u.startsWith('/api/police-districts/')) return jsonResponse({ error: { code: 'DOWN' } }, 503);
      if (u.includes('/api/geography')) return geographyResponse(url);
      return apiResponse(url);
    }));
    renderPage();
    expect(await screen.findByText(/District figures could not be loaded, so none are shown/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Registered cases ·/ })).toBeNull();
  });
});

describe('layout and accessibility', () => {
  it('starts with the key collapsed on phones and gives the district panel a sheet toggle', async () => {
    vi.stubGlobal('matchMedia', (query) => ({ matches: query.includes('max-width: 800px'), media: query, addEventListener() {}, removeEventListener() {} }));
    withPolygons();
    renderPage();
    const toggle = await screen.findByRole('button', { name: 'Expand map key' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await clickDistrict('central');
    expect(screen.getByRole('button', { name: 'Collapse district details' })).toHaveAttribute('aria-expanded', 'true');
  });

  it.each([['with a district selected', true], ['with the table open', false]])('has no detectable axe violations %s', async (_label, district) => {
    const user = userEvent.setup();
    withPolygons();
    const { container } = renderPage();
    await drawn();
    if (district) await clickDistrict('central');
    else await user.click(screen.getByRole('button', { name: /View figures as a table/ }));
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
