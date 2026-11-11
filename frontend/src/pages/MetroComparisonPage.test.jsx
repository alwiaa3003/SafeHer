import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';
import { jsonResponse } from '../test/trendFixture';

const renderPage = () => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/metro-comparison'] })} />);

describe('Metro Comparison', () => {
  it('asks the API for metro-city records and shows an empty state when there are none', async () => {
    renderPage();
    expect(await screen.findByText('Metro comparison is not available yet')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/crimes?limit=100&reportingUnitType=metro_city', expect.anything());
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('shows no fabricated cities, values or rankings', async () => {
    renderPage();
    await screen.findByText('Metro comparison is not available yet');
    const text = screen.getByRole('main').textContent;
    expect(text).not.toMatch(/\d{1,3},\d{3}/);
    expect(text).not.toMatch(/Mumbai|Kolkata|Chennai|Bengaluru|Hyderabad|rank(ed|ing) \d/i);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('disables controls that have nothing valid to select', async () => {
    renderPage();
    await screen.findByText('Metro comparison is not available yet');
    const city = screen.getByLabelText('City');
    expect(city).toBeDisabled();
    expect(screen.getByLabelText('Year')).toBeDisabled();
    expect(city).toHaveAccessibleDescription(/disabled because there is nothing valid to select/);
  });

  it('keeps Delhi UT and Delhi City distinct', async () => {
    renderPage();
    await screen.findByText('Metro comparison is not available yet');
    expect(screen.getByLabelText('Metro data status')).toHaveTextContent('Delhi UT is not Delhi City');
    const units = within(screen.getByRole('region', { name: 'Delhi UT and Delhi City' }));
    expect(units.getByRole('heading', { name: 'Delhi UT' })).toBeInTheDocument();
    expect(units.getByText(/Not in SafeHer's published data/)).toBeInTheDocument();
  });

  it('does not publish a comparison even if unreviewed records appear', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [{ id: 'x', reportingUnit: 'Delhi City', reportingUnitType: 'metro_city', registeredCases: 1 }] })));
    renderPage();
    expect(await screen.findByText('Comparison view pending review')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeDisabled();
  });

  it('handles an API error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('down'); }));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('No figures are shown');
  });
});
