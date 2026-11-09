import { useState } from 'react';
import { GapAwareLineChart } from '../../charts/GapAwareLineChart/GapAwareLineChart';
import { DataTable } from '../../components/DataTable/DataTable';
import { Panel } from '../../components/Panel/Panel';
import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { getDelhiUtAnnualSeries } from '../../data';
import { STATUS_KIND, statusKindFor, TABLE_TOTALS_CHECKED_LABEL } from '../../data/status';
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
  .join('; ')}. Table 3A.1 totals have been checked. Further validation is pending.`;

const displayedNotesFor = (statistic) =>
  statistic.validationNotes
    .filter((note) => note.display)
    .map((note) => note.text)
    .join(' ');

const MOBILE_2024_NOTE =
  'Delhi UT and Delhi City totals are identical in the source data. The reason is unexplained; these reporting units should not be assumed to be equivalent.';

const has2024EqualityCaveat = series.some(({ statistic }) =>
  statistic?.validationNotes.some((note) => note.code === 'UT_CITY_IDENTICAL_2024'),
);

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
          {TABLE_TOTALS_CHECKED_LABEL}
          {displayedNotesFor(row.statistic) && (
            <span className={styles.rowCaveat}>. {displayedNotesFor(row.statistic)}</span>
          )}
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
        <>
          <a href={row.statistic.sourceUrl} target="_blank" rel="noreferrer">
            {row.statistic.edition}, Table {row.statistic.tableNumber}, full-report PDF p.
            {row.statistic.pdfPage} (not rechecked)
          </a>
          . Checked against {row.statistic.evidence.fileName}, extract p.
          {row.statistic.evidence.extractPage}.
        </>
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
        tooltipDetail={() => TABLE_TOTALS_CHECKED_LABEL}
      />

      <div className={styles.footer}>
        <p className={styles.source}>
          Source: NCRB, <cite>Crime in India</cite>, Table 3A.1. Each year uses the latest table
          extract checked. The line breaks at 2019, and nothing is estimated.
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
          {has2024EqualityCaveat && (
            <p className={styles.mobileCaveat}>
              <strong>2024 note:</strong> {MOBILE_2024_NOTE}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
