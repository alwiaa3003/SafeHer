import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';
import { apiResponse, dataSources, validationChecks } from '../test/apiFixture';
import { geographyResponse } from '../test/geographyFixture';
import { jsonResponse } from '../test/trendFixture';

const renderPage = () => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/data-sources'] })} />);
const ready = () => screen.findByRole('region', { name: 'Source catalogue' });
const entry = (name) => screen.getByRole('article', { name });
const catalogue = () => within(screen.getByRole('region', { name: 'Source catalogue' }));

function stubWith({ sources = dataSources(), checks = validationChecks() } = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const u = String(url);
    if (u.startsWith('/api/data-sources')) return jsonResponse({ data: sources, meta: {} });
    if (u.startsWith('/api/validation')) return jsonResponse({ data: checks, meta: {} });
    if (u.includes('/api/geography')) return geographyResponse(url);
    return apiResponse(url);
  }));
}

describe('Data & Sources', () => {
  it('loads sources, validation and geography from the API once each', async () => {
    renderPage();
    await ready();
    expect(screen.getByRole('heading', { level: 1, name: 'Data & Sources' })).toBeInTheDocument();
    expect(document.title).toBe('Data & Sources · SafeHer');
    expect(fetch.mock.calls.map(([u]) => u).sort()).toEqual(['/api/data-sources?limit=100', '/api/geography?limit=100', '/api/validation?limit=100']);
    const overview = within(screen.getByLabelText('Source overview'));
    expect(overview.getByText('Source records').nextSibling).toHaveTextContent('5');
    expect(overview.getByText('Crime statistics sources').nextSibling).toHaveTextContent('4');
    expect(overview.getByText('Geographic boundary sources').nextSibling).toHaveTextContent('1');
    expect(overview.getByText('Validation records').nextSibling).toHaveTextContent('18Pass: 9 · Pending: 9');
  });

  it('renders one catalogue entry per API source, using its stored identity', async () => {
    renderPage();
    await ready();
    expect(catalogue().getAllByRole('article')).toHaveLength(5);
    for (const s of dataSources()) expect(entry(s.sourceName)).toHaveTextContent(s.publisher);
    expect(entry('Crime in India 2018')).toHaveTextContent('Production annual totals for 2016, 2017, 2018');
  });

  it('distinguishes the 2019 additional-tables spreadsheet from printed report tables', async () => {
    renderPage();
    await ready();
    const s2019 = entry('Crime in India 2019 Additional Tables');
    expect(s2019).toHaveTextContent('NCRB additional-tables spreadsheet, not a printed report page');
    expect(s2019).toHaveTextContent('Official NCRB download, retrieved 2026-11-10');
    expect(s2019).toHaveTextContent('Production annual totals for 2019');
    expect(entry('Crime in India 2024')).toHaveTextContent('Report table, checked against a one-page extract');
  });

  it('shows the OSM source as a context-only boundary with attribution', async () => {
    renderPage();
    await ready();
    const osm = entry('OpenStreetMap relation 1942586');
    expect(osm).toHaveTextContent('Geographic boundary');
    expect(osm).toHaveTextContent('OpenStreetMap relation 1942586, version 152');
    expect(osm).toHaveTextContent('Crime Map outline (osm-relation-1942586-v152), context only');
    expect(osm).toHaveTextContent('© OpenStreetMap contributors');
    expect(osm).not.toHaveTextContent('Years covered');
  });

  it('uses stored URLs for external links, opening safely in a new tab', async () => {
    renderPage();
    await ready();
    for (const s of dataSources()) {
      const link = within(entry(s.sourceName)).getByRole('link', { name: /opens in a new tab/ });
      expect(link).toHaveAttribute('href', s.sourceUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('marks missing optional metadata as not recorded', async () => {
    const [first] = dataSources();
    stubWith({ sources: [{ ...first, sourceUrl: null, reportingPeriod: null, publicationYear: null, notes: null, editionBasis: null, extract: null }] });
    renderPage();
    await ready();
    const e = entry(first.sourceName);
    expect(within(e).getAllByText('Not recorded').length).toBeGreaterThanOrEqual(4);
    expect(within(e).queryByRole('link')).toBeNull();
    expect(within(e).queryByLabelText(/Qualifications/)).toBeNull();
  });

  it('shows validation records exactly as recorded, including pending checks', async () => {
    renderPage();
    await ready();
    const table = within(screen.getByRole('table', { name: 'Validation records by rule and year' }));
    expect(table.getAllByRole('row')).toHaveLength(19);
    expect(table.getAllByText('Pending')).toHaveLength(9);
    expect(table.getAllByText('Pass')).toHaveLength(9);
    expect(table.getAllByText('Not yet checked')).toHaveLength(9);
    const row2019 = table.getAllByRole('cell', { name: '2019' }).map((c) => c.closest('tr')).find((r) => r.textContent.startsWith('TOT-4'));
    expect(row2019).toHaveTextContent('PendingCrime in India 2019 Additional Tables');
    expect(row2019).toHaveTextContent(/No 2019 Table 3A\.2 source has been obtained/);
  });

  it('never turns failed or unrecognised results into success', async () => {
    const checks = validationChecks();
    checks[0] = { ...checks[0], result: 'FAIL' };
    checks[1] = { ...checks[1], result: 'NOT_APPLICABLE' };
    checks[2] = { ...checks[2], result: 'MYSTERY' };
    stubWith({ checks });
    renderPage();
    await ready();
    const table = within(screen.getByRole('table', { name: 'Validation records by rule and year' }));
    expect(table.getByText('Fail')).toBeInTheDocument();
    expect(table.getByText('Not applicable')).toBeInTheDocument();
    expect(table.getByText('Unrecognised (MYSTERY)').closest('[data-status]')).toHaveAttribute('data-status', 'unavailable');
    expect(table.getByText('Fail').closest('[data-status]')).toHaveAttribute('data-status', 'incomplete');
  });

  it('filters the catalogue, shows an empty state and resets', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    const reset = catalogue().getByRole('button', { name: 'Reset filters' });
    expect(reset).toBeDisabled();

    await user.selectOptions(catalogue().getByLabelText('Source type'), 'geographic_boundary');
    expect(catalogue().getAllByRole('article')).toHaveLength(1);
    expect(catalogue().getByRole('status')).toHaveTextContent('Showing 1 of 5 sources');

    await user.selectOptions(catalogue().getByLabelText('Validation result'), 'PENDING');
    expect(catalogue().queryAllByRole('article')).toHaveLength(0);
    expect(catalogue().getByText('No source matches these filters.')).toBeInTheDocument();

    await user.click(reset);
    expect(catalogue().getAllByRole('article')).toHaveLength(5);
    expect(catalogue().getByLabelText('Source type')).toHaveValue('');

    await user.selectOptions(catalogue().getByLabelText('Publisher'), 'National Crime Records Bureau');
    expect(catalogue().getAllByRole('article')).toHaveLength(4);
  });

  it('separates production, context-only and documented research evidence', async () => {
    renderPage();
    await ready();
    const ev = within(screen.getByRole('region', { name: 'Production, research-only and contextual evidence' }));
    expect(ev.getByRole('region', { name: 'In production' })).toHaveTextContent('4 crime-statistics sources supply');
    expect(ev.getByRole('region', { name: 'Context only' })).toHaveTextContent('1 boundary record is marked context only');
    expect(ev.getByRole('region', { name: 'Research only' })).toHaveTextContent('not database records');
  });

  it('states licensing honestly, using the licence returned by the API', async () => {
    renderPage();
    await ready();
    const lic = screen.getByRole('region', { name: 'Licensing and attribution' });
    expect(lic).toHaveTextContent('No explicit reuse licence has been established');
    expect(within(lic).getByRole('link', { name: 'Open Data Commons Open Database License (ODbL) 1.0' })).toHaveAttribute('href', 'https://opendatacommons.org/licenses/odbl/1-0/');
    expect(lic).toHaveTextContent('© OpenStreetMap contributors');
    expect(lic).toHaveTextContent('not by the data licence');
    expect(lic).toHaveTextContent('not a verified official download');
  });

  it('shows loading and error states, and retries', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('down'); }));
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading source and validation records');
    expect(await screen.findByRole('alert')).toHaveTextContent('data service is unavailable');
    stubWith();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await ready()).toBeInTheDocument();
  });

  it('has no detectable accessibility violations once loaded', async () => {
    const { container } = renderPage();
    await ready();
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
