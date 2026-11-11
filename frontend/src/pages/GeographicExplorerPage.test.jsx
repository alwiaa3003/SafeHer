import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { CircleMarker, GeoJSON, MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';
import { apiResponse } from '../test/apiFixture';
import { geographyResponse, testUnit } from '../test/geographyFixture';

// The Leaflet mocks record calls; each test starts from none.
beforeEach(() => {
  vi.clearAllMocks();
});

const leaflet = () => globalThis.__leaflet;
function renderPage(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
}
const ready = () => screen.findByTestId('map');
const locationRegion = () => screen.queryByRole('region', { name: 'Selected location' });
const panel = () => within(screen.getByRole('region', { name: 'Selected location' }));
const clickMap = (lat, lng) => act(() => leaflet().handlers.click({ latlng: { lat, lng } }));

function stub(overrides = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const u = String(url);
    for (const [prefix, handler] of Object.entries(overrides)) if (u.startsWith(prefix)) return handler(url);
    if (u.includes('/api/geography')) return geographyResponse(url);
    return apiResponse(url);
  }));
}

describe('full-screen map', () => {
  it('is the homepage, fills the page with OSM tiles and attribution, and opts out of the reading layout', async () => {
    renderPage();
    await ready();
    expect(screen.getByRole('heading', { level: 1, name: 'Crime Map' })).toBeInTheDocument();
    expect(document.title).toBe('Crime Map · SafeHer');
    expect(screen.getByRole('main').className).toMatch(/mainFull/);
    const tiles = TileLayer.mock.lastCall[0];
    expect(tiles.url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(tiles.attribution).toContain('https://www.openstreetmap.org/copyright');
    expect(tiles.referrerPolicy).toBe('strict-origin-when-cross-origin');
    expect(ZoomControl.mock.lastCall[0]).toMatchObject({ position: 'bottomright' });
    expect(MapContainer.mock.lastCall[0]).toMatchObject({ zoom: 11, minZoom: 9, keyboard: true });
  });

  it('redirects the old Map Explorer address to the Crime Map', async () => {
    const { router } = renderPage('/geographic-explorer');
    await ready();
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Crime Map' })).toBeInTheDocument();
  });

  it('starts with only the search bar and compact tools: no location panel, no markers', async () => {
    renderPage();
    await ready();
    expect(screen.getByRole('search', { name: 'Search places in Delhi' })).toBeInTheDocument();
    const tools = within(screen.getByRole('toolbar', { name: 'Map tools' }));
    await tools.findByRole('button', { name: '2022' });
    expect(tools.getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent.trim())).toEqual(['2020', '2021', '2022', 'Categories', 'Layers', 'Select map centre']);
    expect(locationRegion()).toBeNull();
    expect(CircleMarker).not.toHaveBeenCalled();
  });

  it('without a publishable district boundary, draws only the verified OSM outline', async () => {
    renderPage();
    await ready();
    await waitFor(() => expect(GeoJSON).toHaveBeenCalled());
    const drawn = GeoJSON.mock.calls.map(([props]) => props.data.geometry);
    expect(new Set(drawn.map((g) => JSON.stringify(g)))).toEqual(new Set([JSON.stringify(testUnit.geometry)]));
    expect(leaflet().map.fitBounds).toHaveBeenCalled();
  });

  it('shows no incident markers and, once a place is selected, states why', async () => {
    renderPage();
    await ready();
    clickMap(28.6, 77.1);
    expect(CircleMarker.mock.calls.every(([props]) => props.interactive === false)).toBe(true);
    expect(panel().getByText('No verified incident records are available for any location in SafeHer.')).toBeInTheDocument();
    expect(panel().getByText(/does not indicate that a place is\s+safe or unsafe/)).toBeInTheDocument();
  });
});

describe('search', () => {
  it('searches on submit only, then flies to and selects the chosen place', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    const input = screen.getByRole('searchbox', { name: 'Search places in Delhi' });
    await user.type(input, 'India Gate');
    expect(fetch.mock.calls.some(([u]) => String(u).startsWith('/api/places/search'))).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(fetch).toHaveBeenCalledWith('/api/places/search?q=India%20Gate', expect.anything());
    await user.click(await screen.findByRole('button', { name: /Test Landmark/ }));
    // The fly-to keeps the place clear of the floating search bar and the location panel.
    expect(leaflet().map.flyToBounds).toHaveBeenCalledWith(
      [[28.59, 77.09], [28.61, 77.11]],
      expect.objectContaining({ maxZoom: 17, paddingTopLeft: expect.any(Array), paddingBottomRight: expect.any(Array) }),
    );
    expect(panel().getByText('28.60000° N, 77.10000° E', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText(/Search by/)).toHaveTextContent('Nominatim');
  });

  it('handles no results, short queries and an unavailable service', async () => {
    const user = userEvent.setup();
    stub({ '/api/places/search': async () => { throw new TypeError('down'); } });
    renderPage();
    await ready();
    const input = screen.getByRole('searchbox');
    await user.type(input, 'a{Enter}');
    expect(await screen.findByText('Enter at least two characters.')).toBeInTheDocument();
    await user.type(input, 'bc{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Place search is unavailable right now');
  });

  it('reports when nothing is found', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    await user.type(screen.getByRole('searchbox'), 'nowhere{Enter}');
    expect(await screen.findByText(/No places found in Delhi/)).toBeInTheDocument();
  });
});

describe('selecting a location', () => {
  it('shows coordinates, place name, outline status and crime-data availability separately', async () => {
    renderPage();
    await ready();
    await waitFor(() => expect(GeoJSON).toHaveBeenCalled());
    clickMap(28.6, 77.1);
    const p = panel();
    expect(p.getByRole('heading', { name: 'Selected location' })).toBeInTheDocument();
    expect(p.getByText('28.60000° N, 77.10000° E', { selector: 'dd' })).toBeInTheDocument();
    expect(await p.findByText('Test Road, Test Neighbourhood, Delhi', { selector: 'dd' })).toBeInTheDocument();
    expect(p.getByText('Inside the Delhi outline (OpenStreetMap, context only)')).toBeInTheDocument();
    expect(p.getByText(/Police district/).nextSibling).toHaveTextContent('Not identified');
    expect(within(screen.getByRole('region', { name: 'Place' })).queryByText(/incident/)).toBeNull();
    expect(screen.getByRole('region', { name: 'Crime records' })).toHaveTextContent('No verified incident records');
    expect(CircleMarker.mock.lastCall[0].center).toEqual([28.6, 77.1]);
  });

  it('brings a clicked point clear of the panel', async () => {
    renderPage();
    await ready();
    clickMap(28.6, 77.1);
    expect(leaflet().map.panInside).toHaveBeenLastCalledWith([28.6, 77.1], expect.objectContaining({ paddingTopLeft: expect.any(Array) }));
  });

  it('updates the panel when another location is selected', async () => {
    renderPage();
    await ready();
    await waitFor(() => expect(GeoJSON).toHaveBeenCalled());
    clickMap(28.6, 77.1);
    expect(panel().getByText('28.60000° N, 77.10000° E', { selector: 'dd' })).toBeInTheDocument();
    clickMap(28.3, 77.5);
    expect(panel().getByText('28.30000° N, 77.50000° E', { selector: 'dd' })).toBeInTheDocument();
    expect(panel().getByText(/Outside the Delhi outline/)).toBeInTheDocument();
    expect(screen.getAllByRole('region', { name: 'Selected location' })).toHaveLength(1);
  });

  it('does not look up place names outside the Delhi region', async () => {
    renderPage();
    await ready();
    clickMap(29.3, 77.0);
    expect(panel().getByText('Not looked up: outside the Delhi region')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(fetch.mock.calls.some(([u]) => String(u).startsWith('/api/places/reverse'))).toBe(false);
  });

  it('lets keyboard users select the map centre, and close the details', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    const centre = screen.getByRole('button', { name: 'Select map centre' });
    await user.click(centre);
    expect(panel().getByText('28.61390° N, 77.20900° E', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText(/Location selected at 28\.61390° N/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close location details' }));
    expect(locationRegion()).toBeNull();
    expect(centre).toHaveFocus();
  });

  it('collapses and expands the details sheet', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    clickMap(28.6, 77.1);
    const toggle = screen.getByRole('button', { name: 'Collapse location details' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Expand location details' })).toHaveAttribute('aria-expanded', 'false');
    // The header still says where the selection is while collapsed.
    expect(panel().getByText(/28\.60000° N|Test Road/, { selector: 'p' })).toBeInTheDocument();
  });
});

describe('floating panels', () => {
  it('offers only the validated district categories, with NCRB labels and the years each covers', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Categories' }));
    const cats = within(screen.getByRole('region', { name: 'Crime category' }));
    const radios = await cats.findAllByRole('radio');
    expect(radios).toHaveLength(21);
    expect(cats.getByRole('radio', { name: /Total crime against women/ })).toBeChecked();
    expect(cats.getByRole('radio', { name: /Dowry Deaths \(Sec\. 304B IPC\)/ })).toHaveAccessibleName(/2022 only/);
    expect(cats.queryByRole('radio', { name: /Kidnapping/ })).toBeNull();
    expect(cats.queryByRole('radio', { name: /Girls \(Below 18/ })).toBeNull();
    expect(cats.getByText(/Kidnapping & Abduction of Women is left out/)).toBeInTheDocument();
    expect(cats.getByText(/Categories overlap and are not added together/)).toBeInTheDocument();
  });

  it('switches base map, toggles the outline, and keeps incident markers disabled', async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Layers' }));
    const layers = within(screen.getByRole('region', { name: 'Map layers' }));
    await user.click(layers.getByRole('radio', { name: /Standard/ }));
    expect(container.querySelector('[data-base-style]')).toHaveAttribute('data-base-style', 'standard');
    const incident = layers.getByRole('checkbox', { name: /Verified incident markers/ });
    expect(incident).toBeDisabled();
    expect(incident).toHaveAccessibleDescription(/0 eligible records/);
    const outline = layers.getByRole('checkbox', { name: /Delhi outline/ });
    const drawnBefore = GeoJSON.mock.calls.length;
    await user.click(outline);
    expect(outline).not.toBeChecked();
    expect(GeoJSON.mock.calls.length).toBe(drawnBefore);
  });

  it('closes a panel with Escape and returns focus to its button', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    const button = screen.getByRole('button', { name: 'Layers' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: 'Map layers' })).toBeNull();
    expect(button).toHaveFocus();
  });
});

describe('states and safeguards', () => {
  it('keeps the map usable when the outline cannot load', async () => {
    const user = userEvent.setup();
    stub({ '/api/geography': async () => { throw new TypeError('down'); } });
    renderPage();
    await ready();
    expect(await screen.findByText(/The Delhi outline could not be loaded/)).toBeInTheDocument();
    expect(GeoJSON).not.toHaveBeenCalled();
    stub();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(GeoJSON).toHaveBeenCalled());
    expect(screen.queryByText(/The Delhi outline could not be loaded/)).toBeNull();
  });

  it('shows no scores, rankings or safety labels, and says so', async () => {
    renderPage();
    await ready();
    await screen.findByRole('heading', { name: 'Registered cases · 2022' });
    clickMap(28.6, 77.1);
    const text = screen.getByRole('main').textContent;
    expect(text).not.toMatch(/risk score|hotspot|heatmap|safest|most dangerous|unsafe area|ranked|rank \d/i);
    expect(text).toMatch(/Not a safety score\./);
  });

  it('cites the outline source and licence', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    await waitFor(() => expect(GeoJSON).toHaveBeenCalled());
    clickMap(28.6, 77.1);
    await user.click(screen.getByText('Sources and limitations'));
    expect(screen.getByRole('link', { name: 'OpenStreetMap relation 1942586' })).toHaveAttribute('href', testUnit.provenance.sourceUrl);
    expect(screen.getByRole('link', { name: 'Usage policy' })).toHaveAttribute('href', 'https://operations.osmfoundation.org/policies/nominatim/');
  });

  it.each([['initially', false], ['with a location selected', true]])('has no detectable axe violations %s', async (_label, withSelection) => {
    const { container } = renderPage();
    await ready();
    if (withSelection) clickMap(28.6, 77.1);
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
