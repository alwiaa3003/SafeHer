import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Line } from 'react-chartjs-2';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';
import { buildTrendSeries, jsonResponse, trendResponse } from '../test/trendFixture';

const VALUES = [15310, 13076, 13640, 13395, 10093, 14277, 14247, 13439, 13396];

function renderPage() {
  return render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/crime-trends'] })} />);
}
const ready = () => screen.findByRole('img', { name: /Line chart/ });
const chartData = () => Line.mock.lastCall[0].data;
const summary = () => within(screen.getByLabelText('Summary for the selected range'));
const yoyTable = () => within(screen.getByRole('table', { name: 'Year-over-year change in registered cases' }));
const rowFor = (year) => yoyTable().getByRole('cell', { name: String(year) }).closest('tr');

describe('Crime Trends', () => {
  it('requests the existing trend endpoint once and plots all nine years, including 2019', async () => {
    renderPage();
    await ready();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/crimes/trends?reportingUnit=Delhi%20UT', expect.anything());
    expect(chartData().labels).toEqual(['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']);
    expect(chartData().datasets[0].data).toEqual(VALUES);
    expect(Line.mock.lastCall[0].options.scales.y.title).toMatchObject({ display: true, text: 'Registered cases' });
  });

  it('gives each tooltip the reporting unit and status of its own year', async () => {
    renderPage();
    await ready();
    const { afterLabel, label } = Line.mock.lastCall[0].options.plugins.tooltip.callbacks;
    expect(label({ parsed: { y: 13395 } })).toBe('13,395 registered cases');
    expect(afterLabel({ dataIndex: 3 })).toMatch(/^Delhi UT · Verified with note/);
  });

  it('shows correct summary statistics with definitions', async () => {
    renderPage();
    await ready();
    const s = summary();
    expect(s.getByText('Latest recorded total').closest('div')).toHaveTextContent('13,3962024');
    expect(s.getByText('Highest recorded total').closest('div')).toHaveTextContent('15,3102016');
    expect(s.getByText('Lowest recorded total').closest('div')).toHaveTextContent('10,0932020');
    expect(s.getByText('Change, 2016 to 2024').closest('div')).toHaveTextContent('−1,914−12.5%');
    expect(s.getByText(/does not make that the most dangerous year/)).toBeInTheDocument();
    expect(s.getByText(/does not show that safety improved/)).toBeInTheDocument();
  });

  it('lists correct year-over-year changes', async () => {
    renderPage();
    await ready();
    expect(rowFor(2016)).toHaveTextContent('First year in range');
    expect(rowFor(2017)).toHaveTextContent('13,076−2,234−14.6%Decrease');
    expect(rowFor(2019)).toHaveTextContent('13,395−245−1.8%Decrease');
    expect(rowFor(2020)).toHaveTextContent('10,093−3,302−24.7%Decrease');
    expect(rowFor(2021)).toHaveTextContent('14,277+4,184+41.5%Increase');
    expect(rowFor(2024)).toHaveTextContent('13,396−43−0.3%Decrease');
  });

  it('updates the chart, statistics and table when the range changes', async () => {
    const user = userEvent.setup();
    renderPage();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Recent 2020–2024' }));
    expect(chartData().labels).toEqual(['2020', '2021', '2022', '2023', '2024']);
    expect(summary().getByText('Highest recorded total').closest('div')).toHaveTextContent('14,2772021');
    expect(summary().getByText('Change, 2020 to 2024').closest('div')).toHaveTextContent('+3,303+32.7%');
    expect(rowFor(2020)).toHaveTextContent('First year in range');
    expect(screen.getByRole('heading', { name: 'Registered cases, 2020–2024' })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('From'), '2017');
    await user.selectOptions(screen.getByLabelText('To'), '2019');
    expect(chartData().datasets[0].data).toEqual([13076, 13640, 13395]);
    expect(screen.getByRole('button', { name: 'Recent 2020–2024' })).toHaveAttribute('aria-pressed', 'false');
    expect(summary().getByText('Lowest recorded total').closest('div')).toHaveTextContent('13,0762017');
  });

  it('describes the pattern without causal or safety claims', async () => {
    renderPage();
    await ready();
    const panel = within(screen.getByRole('region', { name: 'What the figures show' }));
    expect(panel.getByText(/Largest rise between consecutive years: 2020 to 2021 \(\+4,184, \+41\.5%\)/)).toBeInTheDocument();
    expect(panel.getByText(/Largest fall between consecutive years: 2019 to 2020 \(−3,302, −24\.7%\)/)).toBeInTheDocument();
    expect(panel.getByText(/Of 8 year-to-year changes in this range, 2 were rises and 6 were falls/)).toBeInTheDocument();
    expect(panel.getByText(/neither is claimed as a cause/)).toBeInTheDocument();
    expect(screen.getByRole('main').textContent).not.toMatch(/\b(safer|unsafe|dangerous year was|risk score)\b/i);
  });

  it('shows source details from the API, including the 2019 spreadsheet and pending TOT-4', async () => {
    renderPage();
    await ready();
    const sources = within(screen.getByRole('region', { name: 'Sources and validation' }));
    expect(sources.getByRole('link', { name: 'Crime in India 2019 Additional Tables' })).toBeInTheDocument();
    expect(sources.getByText('Official NCRB spreadsheet, no report page')).toBeInTheDocument();
    expect(sources.getAllByText(/^pending \(/)).toHaveLength(4);
    expect(sources.getByText(/405,861 in the official spreadsheet and 405,326/)).toBeInTheDocument();
    expect(sources.getByText(/third-party-hosted copy of that report/)).toBeInTheDocument();
    expect(screen.getByLabelText('How to read these figures')).toHaveTextContent('Registered cases, not risk');
  });

  it('never shows a missing year as zero', async () => {
    const series = buildTrendSeries().map((row) => (row.year === 2019 ? { ...row, availability: 'missing', statistic: null } : row));
    vi.stubGlobal('fetch', vi.fn(async () => trendResponse(series)));
    renderPage();
    await ready();
    expect(chartData().datasets[0].data[3]).toBeNull();
    expect(rowFor(2019)).toHaveTextContent('Not available');
    expect(rowFor(2020)).toHaveTextContent('Not calculated: a year is missing');
    expect(rowFor(2019)).not.toHaveTextContent(/\b0\b/);
  });

  it('shows loading and error states with no figures, and can retry', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('down')).mockResolvedValue(trendResponse()));
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading annual figures');
    expect(await screen.findByRole('alert')).toHaveTextContent('no figures are shown');
    expect(screen.getByRole('main').textContent).not.toMatch(/\d{2},\d{3}/);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await ready()).toBeInTheDocument();
  });

  it('treats an empty series as empty, not as zeros', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: { series: [] } })));
    renderPage();
    expect(await screen.findByText(/No annual figures have been loaded/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Summary for the selected range')).toBeNull();
  });
});
