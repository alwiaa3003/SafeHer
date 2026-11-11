import { ArrowDownRight, ArrowUpRight, Info, Minus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GapAwareLineChart } from '../charts/GapAwareLineChart/GapAwareLineChart';
import { DataTable } from '../components/DataTable/DataTable';
import { Panel } from '../components/Panel/Panel';
import { StatusLabel } from '../components/StatusLabel/StatusLabel';
import { seriesStatusDisplay, statusDisplayFor } from '../data/status';
import { useDelhiUtTrend } from '../features/overview/useDelhiUtTrend';
import { analyseRange, casesOf, formatCount, formatPercent, formatSigned, selectRange, yearsWithData } from '../features/trends/trendAnalytics';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import shared from './AnalysisPage.module.css';
import styles from './CrimeTrendsPage.module.css';

const UNIT = 'Delhi UT';
const CONTEXT_NOTES = [
  { year: 2020, text: 'COVID-19 year', align: 'center' },
  { year: 2024, text: 'New criminal laws, Jul 2024', align: 'right' },
];
const years = (list) => list.join(', ');

function Direction({ value }) {
  const [Icon, word] = value > 0 ? [ArrowUpRight, 'Increase'] : value < 0 ? [ArrowDownRight, 'Decrease'] : [Minus, 'No change'];
  return (
    <span className={styles.direction}>
      <Icon size={16} strokeWidth={2} aria-hidden="true" className={styles.directionIcon} />
      {word}
    </span>
  );
}

function RangeFilters({ available, range, onChange }) {
  const first = available[0];
  const last = available[available.length - 1];
  const presets = [{ label: `Full period ${first}–${last}`, from: first, to: last }];
  if (available.includes(2020) && last > 2020) presets.push({ label: `Recent ${2020}–${last}`, from: 2020, to: last });

  return (
    <div className={styles.filters} role="group" aria-label="Year range">
      <div className={styles.presets}>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            className={shared.button}
            aria-pressed={range.from === p.from && range.to === p.to}
            onClick={() => onChange({ from: p.from, to: p.to })}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className={styles.custom}>
        <label className={styles.field}>
          From
          <select value={range.from} onChange={(e) => onChange({ from: Number(e.target.value), to: Math.max(range.to, Number(e.target.value)) })}>
            {available.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          To
          <select value={range.to} onChange={(e) => onChange({ from: range.from, to: Number(e.target.value) })}>
            {available.filter((y) => y >= range.from).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}

function Summary({ result }) {
  const { latest, highest, lowest, overall } = result;
  const items = [
    latest && { term: 'Latest recorded total', value: formatCount(latest.cases), year: latest.year, definition: `Registered cases in ${latest.year}, the last year in the selected range.` },
    highest && { term: 'Highest recorded total', value: formatCount(highest.value), year: years(highest.years), definition: 'The most cases registered in one year of the range. It does not make that the most dangerous year.' },
    lowest && { term: 'Lowest recorded total', value: formatCount(lowest.value), year: years(lowest.years), definition: 'The fewest cases registered in one year of the range. It does not show that safety improved.' },
    overall
      ? { term: `Change, ${overall.from.year} to ${overall.to.year}`, value: formatSigned(overall.absolute), year: overall.percent === null ? '' : formatPercent(overall.percent), definition: 'Compares the first and last years only. It describes registered cases, not changes in actual victimisation.' }
      : { term: 'Change over the range', value: '—', year: '', definition: 'Needs at least two years with values.' },
  ].filter(Boolean);
  return (
    <dl className={styles.stats} aria-label="Summary for the selected range">
      {items.map((item) => (
        <div key={item.term} className={styles.stat}>
          <dt>{item.term}</dt>
          <dd>
            <span className={styles.value}>{item.value}</span>
            {item.year && <span className={styles.year}>{item.year}</span>}
            <p className={styles.definition}>{item.definition}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}

const yoyColumns = [
  { key: 'year', header: 'Year', render: (r) => r.year },
  { key: 'cases', header: 'Registered cases', numeric: true, render: (r) => (r.cases === null ? 'Not available' : formatCount(r.cases)) },
  {
    key: 'absolute', header: 'Change from previous year', numeric: true,
    render: (r) => (r.status === 'calculated' ? formatSigned(r.absolute) : r.status === 'first' ? 'First year in range' : 'Not calculated: a year is missing'),
  },
  { key: 'percent', header: 'Percentage change', numeric: true, render: (r) => (r.status === 'calculated' && r.percent !== null ? formatPercent(r.percent) : '—') },
  { key: 'direction', header: 'Direction', render: (r) => (r.status === 'calculated' ? <Direction value={r.absolute} /> : '—') },
];

function Interpretation({ result, range }) {
  const { highest, lowest, largestIncrease, largestDecrease, overall, missingYears, changes } = result;
  const moved = (c) => `${c.previousYear} to ${c.year} (${formatSigned(c.absolute)}, ${formatPercent(c.percent)}), from ${formatCount(c.previous)} to ${formatCount(c.cases)}`;
  const calculated = changes.filter((c) => c.status === 'calculated');
  const rises = calculated.filter((c) => c.absolute > 0).length;
  const falls = calculated.filter((c) => c.absolute < 0).length;
  const context = [range.from <= 2020 && range.to >= 2020 && '2020 coincides with the COVID-19 period', range.to >= 2024 && 'July 2024 with new criminal laws'].filter(Boolean);
  return (
    <div className={shared.body}>
      {overall && (
        <p>
          In {overall.to.year}, {formatCount(overall.to.cases)} cases were registered, {overall.absolute === 0 ? 'the same as' : `${formatCount(Math.abs(overall.absolute))} ${overall.absolute < 0 ? 'fewer than' : 'more than'}`} in {overall.from.year} ({formatPercent(overall.percent)}).
          {calculated.length > 0 && ` Of ${calculated.length} year-to-year changes in this range, ${rises} ${rises === 1 ? 'was a rise' : 'were rises'} and ${falls} ${falls === 1 ? 'was a fall' : 'were falls'}, so the first and last years alone do not describe the path between them.`}
        </p>
      )}
      <ul className={shared.list}>
        {highest && <li>Highest recorded year: {years(highest.years)}, with {formatCount(highest.value)} cases. Lowest: {years(lowest.years)}, with {formatCount(lowest.value)}.</li>}
        {largestIncrease && <li>Largest rise between consecutive years: {moved(largestIncrease)}.</li>}
        {largestDecrease && <li>Largest fall between consecutive years: {moved(largestDecrease)}.</li>}
        {missingYears.length > 0 && <li>No value for {years(missingYears)}; changes across that gap are not calculated.</li>}
      </ul>
      <p>
        These are counts of police-registered cases. A rise or fall can reflect changes in reporting,
        registration practice or the law as well as in offending, and NCRB counts alone cannot show
        which.{context.length > 0 && ` In this range, ${context.join(' and ')}; neither is claimed as a cause.`}
      </p>
    </div>
  );
}

function Sources({ series }) {
  const groups = useMemo(() => {
    const map = new Map();
    series.forEach(({ year, statistic }) => {
      if (!statistic) return;
      const key = `${statistic.edition}|${statistic.tableNumber}|${statistic.sourceUrl}`;
      if (!map.has(key)) map.set(key, { statistic, years: [], tot4: new Map(), notes: new Set(), statuses: new Set() });
      const group = map.get(key);
      group.years.push(year);
      group.statuses.add(statistic.validationStatus);
      const tot4 = statistic.validationChecks.find((c) => c.rule === 'TOT-4');
      if (tot4) group.tot4.set(tot4.result, [...(group.tot4.get(tot4.result) ?? []), year]);
      statistic.validationNotes.forEach((n) => group.notes.add(n.text));
    });
    return [...map.values()];
  }, [series]);

  return (
    <ul className={styles.sources}>
      {groups.map(({ statistic, years: covered, tot4, notes, statuses }) => (
        <li key={statistic.sourceReference} className={styles.source}>
          <div className={styles.sourceHead}>
            <a href={statistic.sourceUrl} target="_blank" rel="noreferrer">{statistic.edition}</a>
            <span className={shared.badge}>{statistic.pdfPage ? `Table ${statistic.tableNumber}` : statistic.tableNumber}</span>
          </div>
          <dl className={styles.sourceMeta}>
            <dt>Years used</dt>
            <dd>{years(covered)}</dd>
            <dt>Reporting unit</dt>
            <dd>{statistic.reportingUnit} (printed as &ldquo;{statistic.reportingUnitLabelOriginal}&rdquo;)</dd>
            <dt>Source form</dt>
            <dd>{statistic.pdfPage ? `Report table, PDF p.${statistic.pdfPage}` : 'Official NCRB spreadsheet, no report page'}</dd>
            <dt>Status</dt>
            <dd>
              {[...statuses].map((s) => (
                <StatusLabel key={s} kind={statusDisplayFor(s).kind}>{statusDisplayFor(s).label}</StatusLabel>
              ))}
            </dd>
            <dt>TOT-4 check</dt>
            <dd>{[...tot4.entries()].map(([result, ys]) => `${result.toLowerCase()} (${years(ys)})`).join('; ') || 'Not recorded'}</dd>
          </dl>
          <ul className={styles.notes} aria-label={`Validation notes for ${statistic.edition}`}>
            {[...notes].map((text) => <li key={text}>{text}</li>)}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function TrendContent({ series }) {
  const available = useMemo(() => yearsWithData(series), [series]);
  const [chosen, setChosen] = useState(null);
  const range = chosen ?? { from: available[0], to: available[available.length - 1] };
  const rows = useMemo(() => selectRange(series, range.from, range.to), [series, range.from, range.to]);
  const result = useMemo(() => analyseRange(rows), [rows]);

  const points = rows.map((row) => ({ label: String(row.year), value: casesOf(row) }));
  const notes = CONTEXT_NOTES.map(({ year, ...note }) => ({ ...note, index: rows.findIndex((r) => r.year === year) })).filter((n) => n.index >= 0);
  const ariaLabel = `Line chart of registered crimes against women in ${UNIT}, ${range.from} to ${range.to}. ${rows
    .map((r) => `${r.year}: ${casesOf(r) === null ? 'not available' : formatCount(casesOf(r))}`)
    .join('; ')}. Data status: ${seriesStatusDisplay(rows).label}.`;

  return (
    <div className={shared.stack}>
      <Panel
        title={`Registered cases, ${range.from}–${range.to}`}
        description={`Crimes against women registered in ${UNIT} each calendar year. Registered cases, not victims.`}
      >
        <RangeFilters available={available} range={range} onChange={setChosen} />
        <GapAwareLineChart
          points={points}
          ariaLabel={ariaLabel}
          unit="registered cases"
          yMax={20000}
          yStep={5000}
          yTitle="Registered cases"
          gapText={['Not', 'available']}
          notes={notes}
          tooltipDetail={(index) => `${UNIT} · ${statusDisplayFor(rows[index]?.statistic?.validationStatus).label}`}
        />
        <p className={shared.caption}>
          The axis starts at zero. Missing years would appear as a break, never as zero. Counts are not
          adjusted for population, so they are not rates.
        </p>
      </Panel>

      <Summary result={result} />

      <div className={shared.columns}>
        <Panel title="Year-over-year change" description="Each year compared with the calendar year before it.">
          <DataTable caption="Year-over-year change in registered cases" columns={yoyColumns} rows={result.changes} getRowKey={(r) => r.year} />
          <p className={shared.caption}>
            Absolute change = cases this year − cases the year before. Percentage change = absolute
            change ÷ cases the year before × 100. Both describe registered cases only.
          </p>
        </Panel>
        <Panel title="What the figures show" description="Generated from the selected range. Descriptive, not causal.">
          <Interpretation result={result} range={range} />
        </Panel>
      </div>

      <Panel title="Sources and validation" description="Every figure on this page comes from these records, as returned by the data service.">
        <Sources series={rows} />
        <p className={shared.caption}>
          See <Link to="/methodology">Methodology</Link> for how figures are checked.
        </p>
      </Panel>
    </div>
  );
}

export function CrimeTrendsPage() {
  const trend = useDelhiUtTrend();

  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Crime Trends"
        description="Registered crimes against women in Delhi UT, year by year, with the change between years and the source of every figure."
      />
      <div className={shared.stack}>
        <aside className={shared.notice} aria-label="How to read these figures">
          <Info size={20} strokeWidth={1.75} aria-hidden="true" className={shared.noticeIcon} />
          <p>
            <strong>Registered cases, not risk.</strong> These counts show cases registered by police
            in {UNIT}. They do not measure how likely anyone is to experience a crime, and a higher
            year is not a less safe year. Delhi City is a separate NCRB reporting unit and is not included.
          </p>
        </aside>
        {trend.status === 'ready' && <TrendContent series={trend.series} />}
        {trend.status === 'loading' && <p className={shared.state} role="status">Loading annual figures…</p>}
        {trend.status === 'empty' && <p className={shared.state} role="status">No annual figures have been loaded into the data service yet.</p>}
        {trend.status === 'error' && (
          <div className={shared.state} role="alert">
            <p>The data service is unavailable, so no figures are shown. Nothing has been estimated.</p>
            <button type="button" className={shared.button} onClick={trend.retry}>Try again</button>
          </div>
        )}
      </div>
    </>
  );
}
