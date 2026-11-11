import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, vi } from 'vitest';
import { apiResponse } from './apiFixture';
import { geographyResponse } from './geographyFixture';
import { trendResponse } from './trendFixture';

window.scrollTo = vi.fn();

// jsdom has no canvas. Tests inspect the props given to the chart instead,
// and rendering is checked separately in a real browser.
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn(({ role, 'aria-label': ariaLabel }) =>
    createElement('div', { role, 'aria-label': ariaLabel }),
  ),
}));

// Leaflet needs real layout. The mock records props, and exposes the map's event handlers
// and a fake map object so tests can simulate clicks and check fly-to calls.
vi.mock('react-leaflet', () => {
  const map = {
    flyTo: vi.fn(),
    flyToBounds: vi.fn(),
    fitBounds: vi.fn(),
    getCenter: vi.fn(() => ({ lat: 28.6139, lng: 77.209 })),
    getSize: vi.fn(() => ({ x: 1200, y: 800 })),
    panInside: vi.fn(),
  };
  globalThis.__leaflet = { map, handlers: {} };
  return {
    MapContainer: vi.fn(({ children }) => createElement('div', { 'data-testid': 'map' }, children)),
    TileLayer: vi.fn(() => null),
    GeoJSON: vi.fn(() => null),
    ZoomControl: vi.fn(() => null),
    ScaleControl: vi.fn(() => null),
    CircleMarker: vi.fn(() => null),
    Tooltip: vi.fn(() => null),
    useMap: () => map,
    useMapEvents: (handlers) => {
      globalThis.__leaflet.handlers = handlers;
      return map;
    },
  };
});

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      if (String(url).includes('/api/geography')) return geographyResponse(url);
      return apiResponse(url) ?? trendResponse();
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
