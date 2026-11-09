import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Line } from 'react-chartjs-2';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '../app/routes';
import { buildTrendSeries, jsonResponse, trendResponse } from '../test/trendFixture';
import { delhiUtCoverage, delhiUtStatistics } from '../data/ncrbDelhiUt';
import { StatusLabel } from '../components/StatusLabel/StatusLabel';
import { statusKindFor, TABLE_TOTALS_CHECKED_LABEL } from '../data/status';

const EXPECTED = {
  2016: '15310',
  2017: '13076',
  2018: '13640',
  2020: '10093',
  2021: '14277',
  2022: '14247',
  2023: '13439',
  2024: '13396',
};

function renderPage() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  return render(<RouterProvider router={router} />);
}

async function renderOverview() {
  const view = renderPage();
  await screen.findByRole('img', { name: /Line chart/ });
  return view;
}

describe('Overview API integration', () => {
  const FIGURES = /\d{2},\d{3}/;

  it('requests the Delhi UT series and shows the API values', async () => {
    await renderOverview();
    expect(fetch).toHaveBeenCalledWith(
      '/api/crimes/trends?reportingUnit=Delhi%20UT',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
    expect(Line.mock.lastCall[0].data.datasets[0].data).toEqual([
      15310, 13076, 13640, null, 10093, 14277, 14247, 13439, 13396,
    ]);
  });

  it('shows a loading state with no figures', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    renderPage();
    expect(await screen.findByText('Loading annual figures…')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Line chart/ })).toBeNull();
    expect(screen.getByLabelText('Scope of this page')).toHaveTextContent('Loading status…');
  });

  it('shows an error and no fallback figures when the backend is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    renderPage();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('no figures are shown');
    expect(screen.getByRole('main').textContent).not.toMatch(FIGURES);
    expect(screen.queryByRole('img', { name: /Line chart/ })).toBeNull();
    expect(screen.getByLabelText('Scope of this page')).not.toHaveTextContent('Verified with note');
  });

  it('treats a server error response as an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: { code: 'DATABASE_UNAVAILABLE' } }, 503)));
    renderPage();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('recovers when retry succeeds', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('down')).mockResolvedValue(trendResponse()));
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('img', { name: /Line chart/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an empty state with no invented figures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => trendResponse([])));
    renderPage();
    expect(await screen.findByText(/No annual figures have been loaded/)).toBeInTheDocument();
    expect(screen.getByRole('main').textContent).not.toMatch(FIGURES);
  });
});

describe('Overview status rendering', () => {
  const withStatus = (statusFor) =>
    buildTrendSeries().map((row) =>
      row.statistic
        ? { ...row, statistic: { ...row.statistic, validationStatus: statusFor(row.year) } }
        : row,
    );

  const renderWith = async (statusFor) => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn(async () => trendResponse(withStatus(statusFor))));
    const view = renderPage();
    await screen.findByRole('img', { name: /Line chart/ });
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    return view;
  };

  const tableRow = (year) =>
    within(screen.getByRole('table', { name: /with source details/ }))
      .getByRole('cell', { name: String(year) })
      .closest('tr');

  it.each([
    ['pending', 'Pending – validation not complete'],
    ['failed', 'Failed validation'],
    ['conflict', 'Conflict – needs review'],
  ])('shows %s from the API and no verified label', async (status, label) => {
    await renderWith(() => status);
    expect(screen.getByLabelText('Scope of this page')).toHaveTextContent(label);
    expect(tableRow(2024)).toHaveTextContent(label);
    expect(screen.getByRole('img', { name: /Line chart/ })).toHaveAccessibleName(expect.stringContaining(label));
    expect(tableRow(2024)).not.toHaveTextContent('Verified');
    expect(screen.getByLabelText('Scope of this page')).not.toHaveTextContent('Verified');
  });

  it.each([undefined, 'some_new_status'])('does not crash or confirm an unknown status: %s', async (status) => {
    await renderWith(() => status);
    expect(screen.getByLabelText('Scope of this page')).toHaveTextContent('Status unknown');
    expect(tableRow(2018)).toHaveTextContent('Status unknown');
    expect(tableRow(2018)).not.toHaveTextContent('Verified');
  });

  it('shows each year its own status and a mixed summary', async () => {
    await renderWith((year) => (year === 2020 ? 'failed' : 'verified_with_note'));
    expect(screen.getByLabelText('Scope of this page')).toHaveTextContent('Mixed validation status');
    expect(tableRow(2020)).toHaveTextContent('Failed validation');
    expect(tableRow(2021)).toHaveTextContent(TABLE_TOTALS_CHECKED_LABEL);
  });

  it('gives each chart tooltip the status of its own year', async () => {
    await renderWith((year) => (year === 2020 ? 'failed' : 'verified_with_note'));
    const { afterLabel } = Line.mock.lastCall[0].options.plugins.tooltip.callbacks;
    expect(afterLabel({ dataIndex: 4 })).toBe('Failed validation');
    expect(afterLabel({ dataIndex: 5 })).toBe(TABLE_TOTALS_CHECKED_LABEL);
  });
});

describe('Delhi UT data module', () => {
  it('no longer says Table 3A.2 or the 2023 volume is not held, and keeps TOT-4 pending', () => {
    delhiUtStatistics.forEach((s) => {
      const metadata = JSON.stringify([s.validationNotes, s.validationChecks, s.sourceHistory]);
      expect(metadata).not.toMatch(/has not been obtained and checked|No extract of this table is held/);
      expect(s.validationChecks['TOT-4'].status).toBe('pending');
    });
  });

  it('holds exactly the figures read from NCRB', () => {
    const actual = Object.fromEntries(
      delhiUtStatistics.map((s) => [s.year, s.originalValue]),
    );
    expect(actual).toEqual(EXPECTED);
  });

  it('keeps full provenance on every statistic', () => {
    delhiUtStatistics.forEach((s) => {
      expect(s.reportingUnit).toBe('Delhi UT');
      expect(s.crimeCategory).toBeTruthy();
      expect(s.categoryLabelOriginal).toMatch(/Crime against Women/);
      expect(s.edition).toMatch(/^Crime in India \d{4}$/);
      expect(s.tableNumber).toBe('3A.1');
      expect(s.pdfPage).toBeGreaterThan(0);
      expect(s.sourceReference).toBe(
        `${s.sourceReference.split('-T')[0]}-T3A.1-p${s.pdfPage}`,
      );
      expect(s.sourceUrl).toMatch(/^https:\/\/www\.ncrb\.mha\.gov\.in\//);
      expect(s.numericValue).toBe(Number(s.originalValue));
    });
  });

  it('marks all eight totals verified_with_note, with TOT-4 still pending', () => {
    expect(delhiUtStatistics).toHaveLength(8);
    delhiUtStatistics.forEach((s) => {
      expect(s.validationStatus).toBe('verified_with_note');
      expect(s.validationChecks['EXT-2'].status).toBe('passed');
      expect(s.validationChecks['TOT-4'].status).toBe('pending');
      expect(s.validationNotes.map((n) => n.code)).toContain('TOT4_PENDING_TABLE_3A2');
    });
  });

  it('records the extract evidence with its hash and extract page', () => {
    delhiUtStatistics.forEach((s) => {
      expect(s.evidence.path).toBe(`docs/source-reports/${s.evidence.fileName}`);
      expect(s.evidence.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(s.evidence.extractPage).toBe(1);
    });
  });

  it('marks full-report pages as not independently rechecked', () => {
    delhiUtStatistics.forEach((s) => {
      expect(s.pdfPageStatus).toBe('not_independently_rechecked');
      expect(s.validationNotes.map((n) => n.code)).toContain('FULL_REPORT_PAGE_NOT_RECHECKED');
    });
  });

  it('keeps the original geography labels printed in each extract', () => {
    const labels = Object.fromEntries(
      delhiUtStatistics.map((s) => [s.year, s.reportingUnitLabelOriginal]),
    );
    expect(labels).toEqual({
      2016: 'Delhi UT',
      2017: 'Delhi UT',
      2018: 'Delhi UT',
      2020: 'Delhi',
      2021: 'Delhi',
      2022: 'Delhi',
      2023: 'Delhi',
      2024: 'Delhi',
    });
  });

  it('attributes 2021 to the 2020-2022 table and keeps the old source as history', () => {
    const s2021 = delhiUtStatistics.find((s) => s.year === 2021);
    expect(s2021.edition).toBe('Crime in India 2022');
    expect(s2021.categoryLabelOriginal).toBe('Crime against Women (IPC+SLL) - 2020-2022');
    expect(s2021.evidence.fileName).toBe('women_2020-22.pdf');
    expect(s2021.sourceReference).toBe('CII2022-V1-T3A.1-p259');
    expect(s2021.sourceHistory[0]).toMatchObject({
      edition: 'Crime in India 2023',
      status: 'superseded',
    });
  });

  it('retains the unexplained 2024 Delhi UT and Delhi City caveat only on 2024', () => {
    const withCaveat = delhiUtStatistics.filter((s) =>
      s.validationNotes.some((n) => n.code === 'UT_CITY_IDENTICAL_2024'),
    );
    expect(withCaveat.map((s) => s.year)).toEqual([2024]);
  });

  it('records 2019 as coverage and never as a statistic', () => {
    expect(delhiUtStatistics.some((s) => s.year === 2019)).toBe(false);
    expect(delhiUtCoverage.map((c) => c.year)).toEqual([2019]);
    const row = buildTrendSeries().find((r) => r.year === 2019);
    expect(row.statistic).toBeNull();
    expect(row.coverage.status).toBe('missing_pending_source');
  });
});

describe('Overview chart', () => {
  it('plots a line with no area fill and a true 2019 break', async () => {
    await renderOverview();
    const { data } = Line.mock.lastCall[0];
    const dataset = data.datasets[0];
    expect(dataset.fill).toBe(false);
    expect(dataset.spanGaps).toBe(false);
    expect(data.labels[3]).toBe('2019');
    expect(dataset.data[3]).toBeNull();
    expect(dataset.data).toHaveLength(9);
  });

  it('describes the gap to screen readers', async () => {
    await renderOverview();
    expect(screen.getByRole('img', { name: /2019: unavailable/ })).toBeInTheDocument();
  });
});

describe('Overview content', () => {
  it('shows Delhi UT as a fixed unit with no way to change it', async () => {
    await renderOverview();
    expect(screen.getByLabelText('Scope of this page')).toHaveTextContent('Delhi UT');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('main').textContent).not.toMatch(/Delhi City[^.]*\d{2},\d{3}/);
  });

  it('says totals are checked, more validation is pending, and drops the old wording', async () => {
    const user = userEvent.setup();
    await renderOverview();
    expect(screen.getByLabelText('Scope of this page')).toHaveTextContent(
      TABLE_TOTALS_CHECKED_LABEL,
    );

    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const text = screen.getByRole('main').textContent;
    expect(text).toMatch(/validation is not complete/);
    expect(text).not.toMatch(/Pending manual PDF/i);
    expect(text).not.toMatch(/No figure is marked Verified/);
  });

  it('uses the partial treatment and never a check mark for verified_with_note', async () => {
    const user = userEvent.setup();
    const { container } = await renderOverview();
    await user.click(screen.getByRole('button', { name: 'View as table' }));

    expect(container.querySelector('[data-status="verified"]')).toBeNull();
    expect(container.querySelector('.lucide-circle-check')).toBeNull();
    // Strip (1) + table rows (8) + coverage ranges (2).
    expect(container.querySelectorAll('[data-status="verified_with_note"]')).toHaveLength(11);

    const coverage = within(screen.getByRole('region', { name: 'Evidence coverage' }));
    expect(coverage.getAllByText('Totals checked – validation pending')).toHaveLength(2);
    expect(coverage.queryByText('Verified with note')).toBeNull();
  });

  it('keeps green and the check mark for fully validated records', () => {
    const { container } = render(<StatusLabel kind={statusKindFor('verified')} />);
    const label = container.querySelector('[data-status="verified"]');
    expect(label).toHaveTextContent('Verified');
    expect(label.className).toMatch(/verified/);
    expect(label.querySelector('.lucide-circle-check')).not.toBeNull();
  });

  it('adds the 2024 mobile note below the table only when the table is open', async () => {
    const user = userEvent.setup();
    await renderOverview();
    const note = /Delhi UT and Delhi City totals are identical in the source data\. The reason is unexplained; these reporting units should not be assumed to be equivalent\./;
    expect(screen.getByRole('main').textContent).not.toMatch(note);

    await user.click(screen.getByRole('button', { name: 'View as table' }));
    expect(screen.getByText('2024 note:').closest('p').textContent).toMatch(note);
  });

  it('shows the 2024 caveat in the table row for 2024 only', async () => {
    const user = userEvent.setup();
    await renderOverview();
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = within(screen.getByRole('table', { name: /with source details/ }));
    const caveat = /identical for 2024, and this is unexplained/;
    expect(table.getByRole('cell', { name: '2024' }).closest('tr').textContent).toMatch(caveat);
    expect(table.getByRole('cell', { name: '2023' }).closest('tr').textContent).not.toMatch(caveat);
  });

  it('table lists figures with sources and marks 2019 unavailable', async () => {
    const user = userEvent.setup();
    await renderOverview();
    const toggle = screen.getByRole('button', { name: 'View as table' });
    await user.click(toggle);

    const table = within(
      screen.getByRole('table', { name: /with source details/ }),
    );
    expect(table.getAllByRole('row')).toHaveLength(10);
    expect(
      table.getAllByRole('link', {
        name: /Crime in India 2018, Table 3A.1, full-report PDF p.\s*241 \(not rechecked\)/,
      }),
    ).toHaveLength(3);
    expect(table.getByRole('cell', { name: '2021' }).closest('tr')).toHaveTextContent(
      'Crime in India 2022',
    );
    expect(table.getByRole('cell', { name: '2021' }).closest('tr')).toHaveTextContent(
      'Checked against women_2020-22.pdf, extract p.1',
    );

    const row2019 = table.getByRole('cell', { name: '2019' }).closest('tr');
    expect(row2019).toHaveTextContent('Unavailable');
    expect(row2019).toHaveTextContent('Expected: Crime in India 2021');
    expect(row2019.querySelector('a')).toBeNull();

    expect(screen.getByRole('button', { name: 'Hide table' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('shows no category breakdown or unverified category labels', async () => {
    await renderOverview();
    const panel = screen.getByRole('region', { name: 'Crime categories' });
    expect(panel).toHaveTextContent('Not shown until source-verified');
    expect(within(panel).queryByRole('img')).toBeNull();
    expect(screen.getByRole('main').textContent).not.toMatch(
      /Cruelty|Assault on|Outraging|Kidnapping/,
    );
    expect(Line).toHaveBeenCalled();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('includes coverage, methodology link and no account controls', async () => {
    await renderOverview();
    const coverage = screen.getByRole('region', { name: 'Evidence coverage' });
    expect(within(coverage).getByText('2019')).toBeInTheDocument();
    const note = screen.getByRole('complementary', { name: 'Methodology note' });
    expect(within(note).getByRole('link', { name: 'Methodology' })).toHaveAttribute(
      'href',
      '/methodology',
    );
    expect(screen.queryByRole('button', { name: /notification|profile|account/i })).toBeNull();
  });
});
