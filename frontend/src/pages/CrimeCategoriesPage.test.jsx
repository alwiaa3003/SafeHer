import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';

const renderPage = () => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/crime-categories'] })} />);
const ready = () => screen.findByRole('region', { name: 'Category analysis availability' });

describe('Crime Categories', () => {
  it('reads availability from the API and reports no category observations', async () => {
    renderPage();
    const panel = within(await ready());
    expect(panel.getByText('Annual totals published').nextSibling).toHaveTextContent('9 years, 2016–2024');
    expect(panel.getByText('Approved category-level observations').nextSibling).toHaveTextContent('None');
    expect(panel.getByText('Source labels on record').nextSibling).toHaveTextContent('4');
    const urls = fetch.mock.calls.map(([url]) => url);
    expect(urls).toEqual(expect.arrayContaining(['/api/crimes/categories?limit=100', '/api/validation?limit=100&checkName=TOT-4', '/api/crimes?limit=100&reportingUnitType=state_ut']));
  });

  it('shows no fabricated category figures, shares or charts', async () => {
    renderPage();
    await ready();
    const text = screen.getByRole('main').textContent;
    expect(text).not.toMatch(/\d{1,3},\d{3}/);
    expect(text).not.toMatch(/\d+(\.\d+)?%/);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByLabelText('Category comparison not available')).toHaveTextContent('Not available: no approved category data');
  });

  it('lists source labels as labels, with comparability as recorded', async () => {
    renderPage();
    await ready();
    const table = within(screen.getByRole('table', { name: 'Source labels and their comparability' }));
    expect(table.getAllByRole('row')).toHaveLength(5);
    expect(table.getAllByText('Not assessed')).toHaveLength(4);
    expect(table.getAllByText('Annual total only')).toHaveLength(4);
    expect(table.getByText(/Statement on Cases Registered In Police Stations/)).toBeInTheDocument();
    expect(table.getByText('2014–2019')).toBeInTheDocument();
  });

  it('shows TOT-4 as pending for every year, using the recorded explanations', async () => {
    renderPage();
    await ready();
    const table = within(screen.getByRole('table', { name: 'TOT-4 validation records' }));
    expect(table.getAllByRole('row')).toHaveLength(10);
    expect(table.getAllByText('Pending')).toHaveLength(9);
    expect(table.queryByText('Pass')).toBeNull();
    expect(table.getByText(/No 2019 Table 3A.2 source has been obtained/)).toBeInTheDocument();
  });

  it('labels Table 3A.2 findings as research, not production data', async () => {
    renderPage();
    await ready();
    const research = screen.getByRole('region', { name: 'Table 3A.2 research status' });
    expect(research).toHaveTextContent('Research only');
    expect(research).toHaveTextContent('Not production data');
    const rows = within(within(research).getByRole('table')).getAllByRole('row');
    expect(rows.map((r) => r.textContent)).toEqual([
      expect.stringContaining('Edition'),
      expect.stringContaining('Crime in India 2018Fail'),
      expect.stringContaining('Crime in India 2022Fail'),
      expect.stringContaining('Crime in India 2023Pass with note'),
      expect.stringContaining('Crime in India 2024Pass'),
    ]);
    expect(within(research).getAllByText('Outstanding')).toHaveLength(5);
  });

  it('handles an API error without showing figures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('down'); }));
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading source and validation records');
    expect(await screen.findByRole('alert')).toHaveTextContent('data service is unavailable');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
