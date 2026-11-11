import { CircleDashed, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panel } from '../components/Panel/Panel';
import { StatusLabel } from '../components/StatusLabel/StatusLabel';
import { fetchCrimeRecords } from '../data';
import { STATUS_KIND } from '../data/status';
import { useApiResource } from '../data/useApiResource';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import shared from './AnalysisPage.module.css';
import styles from './MetroComparisonPage.module.css';

const load = (signal) => fetchCrimeRecords({ reportingUnitType: 'metro_city', signal });

const REQUIREMENTS = [
  ['Matching reporting units', 'Each city must be NCRB\'s metropolitan reporting unit, recorded with its original label.'],
  ['Matching crime definitions', 'The same table and measure for every city, such as total registered crimes against women.'],
  ['Compatible reporting periods', 'The same calendar years, from the same or a reconciled edition.'],
  ['Verified sources', 'Each value checked against an official NCRB source, with its hash recorded.'],
  ['Comparable measures', 'Counts compared with counts. Rates only with validated population denominators.'],
  ['Clear geographic definitions', 'A documented city extent. A city is not the same as its state or UT.'],
];

function EmptyState() {
  return (
    <div className={styles.empty} role="status">
      <StatusLabel kind={STATUS_KIND.UNAVAILABLE}>No approved metro-city records</StatusLabel>
      <h3>Metro comparison is not available yet</h3>
      <p className={shared.body}>
        The data service holds no validated city-level records, so no cities, counts, rates or
        rankings are shown. The comparison opens once compatible records meet every requirement below.
      </p>
    </div>
  );
}

function FutureLayout() {
  return (
    <Panel title="Comparison view" description="How the comparison will work once data is approved.">
      <div className={styles.controls}>
        <label className={styles.field}>
          City
          <select disabled aria-describedby="metro-controls-note">
            <option>No compatible cities available</option>
          </select>
        </label>
        <label className={styles.field}>
          Year
          <select disabled aria-describedby="metro-controls-note">
            <option>No compatible years available</option>
          </select>
        </label>
      </div>
      <p id="metro-controls-note" className={shared.muted}>
        These controls are disabled because there is nothing valid to select.
      </p>
      <div className={styles.chartArea} aria-label="Comparison chart not available">
        <p>
          A chart of registered counts by city will appear here, with each value&apos;s source and
          validation status beside it. It will not rank cities by safety.
        </p>
      </div>
    </Panel>
  );
}

function RecordsFound({ count }) {
  return (
    <div className={styles.empty} role="status">
      <StatusLabel kind={STATUS_KIND.INCOMPLETE}>Comparison view pending review</StatusLabel>
      <p className={shared.body}>
        The data service holds {count} metro-city {count === 1 ? 'record' : 'records'}, but the
        comparison view is not published until the requirements below are confirmed for them.
      </p>
    </div>
  );
}

export function MetroComparisonPage() {
  const state = useApiResource(load);

  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Metro Comparison"
        description="A future comparison of registered crimes against women across India's metropolitan cities."
      />
      <div className={shared.stack}>
        <aside className={shared.notice} aria-label="Metro data status">
          <Info size={20} strokeWidth={1.75} aria-hidden="true" className={shared.noticeIcon} />
          <p>
            <strong>Delhi UT is not Delhi City.</strong> SafeHer&apos;s published figures are for
            Delhi UT. NCRB reports Delhi City separately in its metropolitan tables, and the two are
            never combined or swapped.
          </p>
        </aside>

        <Panel title="Data availability" description="Metro-city records currently in the data service.">
          {state.status === 'loading' && <p className={shared.state} role="status">Checking for metro-city records…</p>}
          {state.status === 'error' && (
            <div className={shared.state} role="alert">
              <p>The data service is unavailable, so availability cannot be checked. No figures are shown.</p>
              <button type="button" className={shared.button} onClick={state.retry}>Try again</button>
            </div>
          )}
          {state.status === 'ready' && (state.data.length === 0 ? <EmptyState /> : <RecordsFound count={state.data.length} />)}
        </Panel>

        <Panel title="What a valid comparison needs">
          <ul className={styles.requirements}>
            {REQUIREMENTS.map(([title, text]) => (
              <li key={title}>
                <CircleDashed size={16} strokeWidth={2} aria-hidden="true" className={styles.icon} />
                <span><strong>{title}.</strong> {text}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <FutureLayout />

        <div className={shared.columns}>
          <Panel title="Delhi UT and Delhi City">
            <div className={styles.units}>
              <div className={styles.unit}>
                <h3>Delhi UT</h3>
                <p>The Union Territory as a whole, from NCRB&apos;s State/UT tables. Used on the Crime Trends page.</p>
              </div>
              <div className={styles.unit}>
                <h3>Delhi City</h3>
                <p>NCRB&apos;s metropolitan reporting unit, in a separate table. Not in SafeHer&apos;s published data.</p>
              </div>
            </div>
            <p className={shared.caption}>
              Their totals differ in most years, and their equality in 2024 is unexplained, so neither
              stands in for the other.
            </p>
          </Panel>
          <Panel title="Sources and methodology">
            <div className={shared.body}>
              <p>No metro-city source has been approved for publication.</p>
              <p>
                When one is, its edition, table and validation status will be listed here. See{' '}
                <Link to="/methodology">Methodology</Link> for how sources are checked.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
