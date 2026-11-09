import { useState } from 'react';
import { GapAwareLineChart } from '../../charts/GapAwareLineChart/GapAwareLineChart';
import { DataTable } from '../../components/DataTable/DataTable';
import { Panel } from '../../components/Panel/Panel';
import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { getDelhiUtAnnualSeries } from '../../data';
import { PENDING_PDF_LABEL, STATUS_KIND, statusKindFor } from '../../data/status';
import styles from './AnnualTrendPanel.module.css';

const series = getDelhiUtAnnualSeries();
const format = (value) => value.toLocaleString('en-IN');

const points = series.map(({ year, statistic }) => ({
  label: String(year),
  value: statistic ? statistic.numericValue : null,
}));

const notes = [
  { index: series.findIndex((r) => r.year === 2020), text: 'COVID-19 year', align: 'center' },
  { index: series.findIndex((r) => r.year === 2024), text: 'New criminal laws, Jul 2024', align: 'right' },
];

const ariaLabel = `Line chart of registered crimes against women in Delhi UT. ${series
  .map(({ year, statistic }) => `${year}: ${statistic ? format(statistic.numericValue) : 'unavailable'}`)
  .join('; ')}. All figures are incomplete, pending manual PDF verification.`;

const columns = [
  { key: 'year', header: 'Year', render: (row) => row.year },
  {
    key: 'value',
    header: 'Registered cases',
    numeric: true,
    render: (row) => (row.statistic ? format(row.statistic.numericValue) : '—'),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) =>
      row.statistic ? (
        <StatusLabel kind={statusKindFor(row.statistic.validationStatus)}>
          {PENDING_PDF_LABEL}
        </StatusLabel>
      ) : (
        <StatusLabel kind={STATUS_KIND.UNAVAILABLE} />
      ),
  },
  {
    key: 'source',
    header: 'Source',
    render: (row) =>
      row.statistic ? (
        <a href={row.statistic.sourceUrl} target="_blank" rel="noreferrer">
          {row.statistic.edition}, Table {row.statistic.tableNumber}, PDF p.{row.statistic.pdfPage}
        </a>
      ) : (
        `Expected: ${row.coverage.expectedSource}`
      ),
  },
];

export function AnnualTrendPanel() {
  const [showTable, setShowTable] = useState(false);

  return (
    <Panel
      title="Annual registered cases"
      description="Crimes against women registered in Delhi UT, by calendar year."
    >
      <GapAwareLineChart
        points={points}
        ariaLabel={ariaLabel}
        unit="registered cases"
        yMax={20000}
        yStep={5000}
        gapText={['Not', 'obtained']}
        notes={notes}
        tooltipDetail={() => PENDING_PDF_LABEL}
      />

      <div className={styles.footer}>
        <p className={styles.source}>
          Source: NCRB, <cite>Crime in India</cite>, Table 3A.1. Each year uses the latest edition
          read. The line breaks at 2019, and nothing is estimated.
        </p>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={showTable}
          onClick={() => setShowTable((shown) => !shown)}
        >
          {showTable ? 'Hide table' : 'View as table'}
        </button>
      </div>

      {showTable && (
        <div className={styles.table}>
          <DataTable
            caption="Registered crimes against women in Delhi UT, with source details"
            columns={columns}
            rows={series}
            getRowKey={(row) => row.year}
          />
        </div>
      )}
    </Panel>
  );
}
