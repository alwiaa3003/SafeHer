import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';
import { geographyResponse, testUnit } from '../test/geographyFixture';
import { jsonResponse } from '../test/trendFixture';

function renderPage() {
  const router = createMemoryRouter(routes, { initialEntries: ['/geographic-explorer'] });
  return render(<RouterProvider router={router} />);
}

const notice = () => screen.getByRole('complementary', { name: 'Map limitations' });

describe('Geographic Explorer states', () => {
  it('shows a loading state and the limitations notice', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    renderPage();
    expect(await screen.findByText('Loading the Delhi boundary…')).toBeInTheDocument();
    expect(notice()).toHaveTextContent('Geographic context only');
    expect(screen.queryByTestId('map')).toBeNull();
  });

  it('renders the map when verified geometry is available', async () => {
    renderPage();
    expect(await screen.findByTestId('map')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/geography?geographyType=state_ut&limit=1', expect.anything());
    expect(fetch).toHaveBeenCalledWith(`/api/geography/${testUnit.id}`, expect.anything());
  });

  it('shows an error state when the API is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('geography service is unavailable');
    expect(screen.queryByTestId('map')).toBeNull();
  });

  it('treats a 503 as an error and recovers on retry', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(jsonResponse({ error: { code: 'DATABASE_UNAVAILABLE' } }, 503))
        .mockImplementation(async (url) => geographyResponse(url)),
    );
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByTestId('map')).toBeInTheDocument();
  });

  it('shows an empty state when no verified boundary exists', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [], meta: { total: 0 } })));
    renderPage();
    expect(await screen.findByText(/No verified boundary has been loaded/)).toBeInTheDocument();
    expect(screen.queryByTestId('map')).toBeNull();
  });
});

describe('map configuration', () => {
  it('draws an unfilled boundary fitted to its bounds', async () => {
    renderPage();
    await screen.findByTestId('map');
    const { bounds } = MapContainer.mock.lastCall[0];
    expect(bounds.getWest()).toBeCloseTo(77);
    expect(bounds.getNorth()).toBeCloseTo(28.7);
    const props = GeoJSON.mock.lastCall[0];
    expect(props.data.geometry).toEqual(testUnit.geometry);
    expect(props.data.properties).toEqual({});
    expect(props.style.fill).toBe(false);
  });

  it('attributes OpenStreetMap on the tile layer', async () => {
    renderPage();
    await screen.findByTestId('map');
    const props = TileLayer.mock.lastCall[0];
    expect(props.attribution).toContain('https://www.openstreetmap.org/copyright');
    expect(props.url).toContain('tile.openstreetmap.org');
  });
});

describe('information panel', () => {
  it('states source, version, licence and attribution', async () => {
    renderPage();
    await screen.findByTestId('map');
    const panel = within(screen.getByRole('region', { name: 'About this map' }));
    expect(panel.getByRole('link', { name: 'OpenStreetMap relation 1942586' })).toHaveAttribute('href', testUnit.provenance.sourceUrl);
    expect(panel.getByText(/152, last edited 8 August 2026/)).toBeInTheDocument();
    expect(panel.getByText(/© OpenStreetMap contributors/)).toBeInTheDocument();
    expect(panel.getByRole('link', { name: /Open Database License/ })).toHaveAttribute('href', testUnit.provenance.licence.url);
    expect(panel.getByText(/totals for Delhi as a whole/)).toBeInTheDocument();
  });

  it('shows no crime figures, scores or rankings', async () => {
    renderPage();
    await screen.findByTestId('map');
    const text = screen.getByRole('main').textContent;
    expect(text).not.toMatch(/\d{1,3},\d{3}/);
    expect(text).not.toMatch(/risk score|safety score|hotspot|heatmap/i);
  });

  it('has no detectable axe violations', async () => {
    const { container } = renderPage();
    await screen.findByTestId('map');
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
