import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, vi } from 'vitest';
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

vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(({ children }) => createElement('div', { 'data-testid': 'map' }, children)),
  TileLayer: vi.fn(() => null),
  GeoJSON: vi.fn(() => null),
}));

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => (String(url).includes('/api/geography') ? geographyResponse(url) : trendResponse())),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
