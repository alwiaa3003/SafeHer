import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Line } from 'react-chartjs-2';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routes } from '../app/routes';
import { getDelhiUtAnnualSeries } from '../data';
import { delhiUtCoverage, delhiUtStatistics } from '../data/ncrbDelhiUt';
import { PENDING_PDF_LABEL } from '../data/status';

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

function renderOverview() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  return render(<RouterProvider router={router} />);
}

describe('Delhi UT data module', () => {
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

  it('marks nothing as verified', () => {
    delhiUtStatistics.forEach((s) => {
      expect(s.validationStatus).toBe('pending');
    });
  });

  it('records 2019 as coverage and never as a statistic', () => {
    expect(delhiUtStatistics.some((s) => s.year === 2019)).toBe(false);
    expect(delhiUtCoverage.map((c) => c.year)).toEqual([2019]);
    const row = getDelhiUtAnnualSeries().find((r) => r.year === 2019);
    expect(row.statistic).toBeNull();
    expect(row.coverage.status).toBe('missing_pending_source');
  });
});

describe('Overview chart', () => {
  it('plots a line with no area fill and a true 2019 break', () => {
    renderOverview();
    const { data } = Line.mock.lastCall[0];
    const dataset = data.datasets[0];
    expect(dataset.fill).toBe(false);
    expect(dataset.spanGaps).toBe(false);
    expect(data.labels[3]).toBe('2019');
    expect(dataset.data[3]).toBeNull();
    expect(dataset.data).toHaveLength(9);
  });

  it('describes the gap to screen readers', () => {
    renderOverview();
    expect(screen.getByRole('img', { name: /2019: unavailable/ })).toBeInTheDocument();
  });
});

describe('Overview content', () => {
  it('shows Delhi UT as a fixed unit with no way to change it', () => {
    renderOverview();
    expect(screen.getByLabelText('Scope of this page')).toHaveTextContent('Delhi UT');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('main').textContent).not.toMatch(/Delhi City[^.]*\d{2},\d{3}/);
  });

  it('applies the required label and no Verified status', async () => {
    const user = userEvent.setup();
    const { container } = renderOverview();
    expect(screen.getAllByText(PENDING_PDF_LABEL).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'View as table' }));
    expect(container.querySelector('[data-status="verified"]')).toBeNull();
  });

  it('table lists figures with sources and marks 2019 unavailable', async () => {
    const user = userEvent.setup();
    renderOverview();
    const toggle = screen.getByRole('button', { name: 'View as table' });
    await user.click(toggle);

    const table = within(
      screen.getByRole('table', { name: /with source details/ }),
    );
    expect(table.getAllByRole('row')).toHaveLength(10);
    expect(
      table.getAllByRole('link', { name: /Crime in India 2018, Table 3A.1, PDF p.241/ }),
    ).toHaveLength(3);

    const row2019 = table.getByRole('cell', { name: '2019' }).closest('tr');
    expect(row2019).toHaveTextContent('Unavailable');
    expect(row2019).toHaveTextContent('Expected: Crime in India 2021');
    expect(row2019.querySelector('a')).toBeNull();

    expect(screen.getByRole('button', { name: 'Hide table' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('shows no category breakdown or unverified category labels', () => {
    renderOverview();
    const panel = screen.getByRole('region', { name: 'Crime categories' });
    expect(panel).toHaveTextContent('Not shown until source-verified');
    expect(within(panel).queryByRole('img')).toBeNull();
    expect(screen.getByRole('main').textContent).not.toMatch(
      /Cruelty|Assault on|Outraging|Kidnapping/,
    );
    expect(Line).toHaveBeenCalled();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('includes coverage, methodology link and no account controls', () => {
    renderOverview();
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
