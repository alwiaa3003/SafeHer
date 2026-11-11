import { useState } from 'react';
import { GapAwareLineChart } from '../../charts/GapAwareLineChart/GapAwareLineChart';
import { DataTable } from '../../components/DataTable/DataTable';
import { Panel } from '../../components/Panel/Panel';
import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { seriesStatusDisplay, STATUS_KIND, statusDisplayFor, statusKindFor } from '../../data/status';
import styles from './AnnualTrendPanel.module.css';

const format = (value) => value.toLocaleString('en-IN');

const displayedNotesFor = (statistic) =>
  statistic.validationNotes
    .filter((note) => note.display)
    .map((note) => note.text)
    .join(' ');

const MOBILE_2024_NOTE =
  'Delhi UT and Delhi City totals are identical in the source data. The reason is unexplained; these reporting units should not be assumed to be equivalent.';

const columns = [
  { key: 'year', header: 'Year', render: (row) => row.year },
  {
    key: 'value',
    header: 'Registered cases',
    numeric: true,
    render: (row) => (row.statistic ? format(row.statistic.registeredCases) : '—'),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) =>
      row.statistic ? (
        <StatusLabel kind={statusKindFor(row.statistic.validationStatus)}>
          {statusDisplayFor(row.statistic.validationStatus).label}
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
      row.statistic?.pdfPage ? (
        <>
          <a href={row.statistic.sourceUrl} target="_blank" rel="noreferrer">
            {row.statistic.edition}, Table {row.statistic.tableNumber}, full-report PDF p.
            {row.statistic.pdfPage} (not rechecked)
          </a>
          . Checked against {row.statistic.evidence.fileName}, extract p.
          {row.statistic.evidence.extractPage}.
        </>
      ) : row.statistic ? (
        <>
          <a href={row.statistic.sourceUrl} target="_blank" rel="noreferrer">
            {row.statistic.edition}, {row.statistic.tableNumber}
          </a>
          . Official NCRB spreadsheet; no report page.
        </>
      ) : row.coverage?.expectedSource ? (
        `Expected: ${row.coverage.expectedSource}`
      ) : (
        'No source recorded'
      ),
  },
];

function TrendContent({ series }) {
  const [showTable, setShowTable] = useState(false);

  const points = series.map(({ year, statistic }) => ({
    label: String(year),
    value: statistic ? statistic.registeredCases : null,
  }));
  const notes = [
    { year: 2020, text: 'COVID-19 year', align: 'center' },
    { year: 2024, text: 'New criminal laws, Jul 2024', align: 'right' },
  ]
    .map(({ year, ...note }) => ({ ...note, index: series.findIndex((row) => row.year === year) }))
    .filter((note) => note.index >= 0);
  const ariaLabel = `Line chart of registered crimes against women in Delhi UT. ${series
    .map(({ year, statistic }) => `${year}: ${statistic ? format(statistic.registeredCases) : 'unavailable'}`)
    .join('; ')}. Data status: ${seriesStatusDisplay(series).label}.`;
  const gapYears = series.filter((row) => !row.statistic).map((row) => row.year);
  const has2024EqualityCaveat = series.some(({ statistic }) =>
    statistic?.validationNotes.some((note) => note.code === 'UT_CITY_IDENTICAL_2024'),
  );

  return (
    <>
      <GapAwareLineChart
        points={points}
        ariaLabel={ariaLabel}
        unit="registered cases"
        yMax={20000}
        yStep={5000}
        gapText={['Not', 'obtained']}
        notes={notes}
        tooltipDetail={(index) => statusDisplayFor(series[index]?.statistic?.validationStatus).label}
      />

      <div className={styles.footer}>
        <p className={styles.source}>
          Source: NCRB, <cite>Crime in India</cite>, Table 3A.1, and for 2019 NCRB&apos;s official
          2014–2019 spreadsheet. Each year uses the latest source checked.{' '}
          {gapYears.length > 0 && `The line breaks at ${gapYears.join(', ')}, and `}
          {gapYears.length > 0 ? 'nothing is estimated.' : 'Nothing is estimated.'}
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
    </>
  );
}

export function AnnualTrendPanel({ trend }) {
  return (
    <Panel
      title="Annual registered cases"
      description="Crimes against women registered in Delhi UT, by calendar year."
    >
      {trend.status === 'ready' && <TrendContent series={trend.series} />}
      {trend.status === 'loading' && (
        <p className={styles.state} role="status">
          Loading annual figures…
        </p>
      )}
      {trend.status === 'empty' && (
        <p className={styles.state} role="status">
          No annual figures have been loaded into the data service yet.
        </p>
      )}
      {trend.status === 'error' && (
        <div className={styles.state} role="alert">
          <p>The data service is unavailable, so no figures are shown. Nothing has been estimated.</p>
          <button type="button" className={styles.toggle} onClick={trend.retry}>
            Try again
          </button>
        </div>
      )}
    </Panel>
  );
}
