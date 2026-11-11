import { CircleDashed, Info } from 'lucide-react';
import { DataTable } from '../components/DataTable/DataTable';
import { Panel } from '../components/Panel/Panel';
import { StatusLabel } from '../components/StatusLabel/StatusLabel';
import { fetchCategoryLabels, fetchCrimeRecords, fetchValidationChecks } from '../data';
import { STATUS_KIND } from '../data/status';
import { useApiResource } from '../data/useApiResource';
import { resultDisplay } from '../data/validationResults';
import { APPROVAL_CONDITIONS, RESEARCH_DOCUMENT, TABLE_3A2_RESEARCH, TOTAL_CATEGORY } from '../features/categories/researchStatus';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import shared from './AnalysisPage.module.css';
import styles from './CrimeCategoriesPage.module.css';

const load = (signal) =>
  Promise.all([
    fetchCategoryLabels({ signal }),
    fetchValidationChecks({ checkName: 'TOT-4', signal }),
    fetchCrimeRecords({ reportingUnitType: 'state_ut', signal }),
  ]).then(([labels, tot4, records]) => ({ labels, tot4, records }));

const Result = ({ value }) => <StatusLabel kind={resultDisplay(value).kind}>{resultDisplay(value).label}</StatusLabel>;
const period = (p) => (p ? (p.from === p.to ? String(p.from) : `${p.from}–${p.to}`) : 'Not recorded');

const labelColumns = [
  { key: 'label', header: 'Label printed by NCRB', render: (c) => c.originalCategoryName },
  { key: 'source', header: 'Source', render: (c) => c.source?.sourceName ?? '—' },
  { key: 'period', header: 'Years covered', render: (c) => period(c.reportingPeriod) },
  { key: 'measure', header: 'What it holds', render: (c) => (c.normalizedCategoryName === TOTAL_CATEGORY ? 'Annual total only' : c.normalizedCategoryName ?? '—') },
  { key: 'comparability', header: 'Comparability', render: (c) => (c.comparabilityStatus === 'not_assessed' ? 'Not assessed' : c.comparabilityStatus) },
];

const tot4Columns = [
  { key: 'year', header: 'Year', render: (v) => v.reportingYear },
  { key: 'result', header: 'TOT-4 result', render: (v) => <Result value={v.result} /> },
  { key: 'explanation', header: 'Recorded explanation', render: (v) => v.explanation },
];

const researchColumns = [
  { key: 'edition', header: 'Edition', render: (r) => r.edition },
  { key: 'sub2', header: 'Sub-total check (SUB-2)', render: (r) => <Result value={r.sub2} /> },
  { key: 'note', header: 'Finding', render: (r) => r.note },
];

function Availability({ labels, records }) {
  const categoryObservations = records.filter((r) => r.crimeCategory !== TOTAL_CATEGORY);
  const years = records.map((r) => r.year).sort((a, b) => a - b);
  return (
    <Panel title="Category analysis availability" description="What the data service holds today.">
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>Annual totals published</dt>
          <dd>{records.length > 0 ? `${records.length} years, ${years[0]}–${years[years.length - 1]}` : 'None'}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Approved category-level observations</dt>
          <dd>{categoryObservations.length === 0 ? 'None' : `${categoryObservations.length} records`}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Source labels on record</dt>
          <dd>{labels.length}</dd>
        </div>
      </dl>
      <p className={shared.caption}>
        {categoryObservations.length === 0
          ? `Every published record is an annual total ("${TOTAL_CATEGORY}"). No breakdown by offence has been approved, so this page shows no category figures.`
          : 'Category records exist in the data service, but this page does not display them until a reviewed comparison view is approved.'}
      </p>
    </Panel>
  );
}

function CategoriesContent({ data }) {
  const { labels, tot4, records } = data;
  return (
    <div className={shared.stack}>
      <Availability labels={labels} records={records} />

      <Panel title="Source coverage" description="The source labels behind each published annual total. These are labels, not counts by category.">
        <DataTable caption="Source labels and their comparability" columns={labelColumns} rows={labels} getRowKey={(c) => c.id} />
      </Panel>

      <div className={shared.columns}>
        <Panel title="Category-table comparison (TOT-4)" description="Whether each annual total has been checked against NCRB's category table. From production validation records.">
          {tot4.length === 0 ? (
            <p className={shared.state}>No TOT-4 records are held.</p>
          ) : (
            <DataTable caption="TOT-4 validation records" columns={tot4Columns} rows={[...tot4].sort((a, b) => a.reportingYear - b.reportingYear)} getRowKey={(v) => v.id} />
          )}
        </Panel>
        <Panel title="Category comparison" description="Planned view: one edition at a time, NCRB labels as printed.">
          <div className={styles.preview} aria-label="Category comparison not available">
            <StatusLabel kind={STATUS_KIND.UNAVAILABLE}>Not available: no approved category data</StatusLabel>
            <div className={styles.previewAxis} aria-hidden="true">
              {['Category label as printed', 'IPC column', 'BNS column (2024 onward)', 'Special and local laws'].map((name) => (
                <div key={name} className={styles.previewRow}>
                  <span>{name}</span>
                  <span className={styles.previewTrack} />
                </div>
              ))}
            </div>
            <p className={shared.muted}>
              Bars stay empty until values are approved. It will compare categories within one
              edition only, never across years, and will keep IPC and BNS columns separate.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Table 3A.2 research status" description={`Research only, from ${RESEARCH_DOCUMENT}. Not production data.`}>
        <DataTable caption="Table 3A.2 research validation by edition" columns={researchColumns} rows={TABLE_3A2_RESEARCH} getRowKey={(r) => r.year} />
        <div className={`${shared.columns} ${styles.researchFooter}`}>
          <div className={shared.body}>
            <h3 className={shared.muted}>Before any category figure can be published</h3>
            <ul className={styles.checklist}>
              {APPROVAL_CONDITIONS.map((c) => (
                <li key={c}>
                  <CircleDashed size={16} strokeWidth={2} aria-hidden="true" className={styles.checkIcon} />
                  <span>{c} <span className={shared.badge}>Outstanding</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div className={shared.body}>
            <h3 className={shared.muted}>Coverage gaps</h3>
            <ul className={shared.list}>
              <li>No category-table source has been obtained for 2016, 2017, 2019, 2020 or 2021.</li>
              <li>Research extracts exist only for 2018, 2022, 2023 and 2024.</li>
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Why categories cannot be compared yet">
        <ul className={`${shared.list} ${shared.body}`}>
          <li>Table 3A.2 is still research-only. Extracting a table does not approve it.</li>
          <li>New criminal laws took effect in July 2024. IPC and BNS sections are printed separately, and matching section numbers do not prove the categories measure the same thing.</li>
          <li>Category headings and definitions change between editions. Some 2024 headings have no earlier equivalent, and some earlier headings are not printed in 2024.</li>
          <li>A category crosswalk needs evidence and review. Every category is currently &ldquo;not assessed&rdquo;.</li>
          <li>Until comparability is established, category counts should not be compared across years.</li>
        </ul>
      </Panel>
    </div>
  );
}

export function CrimeCategoriesPage() {
  const state = useApiResource(load);
  return (
    <>
      <PageHeader
        eyebrow="Analysis"
        title="Crime Categories"
        description="What SafeHer can and cannot yet say about the kinds of crime behind Delhi UT's annual totals."
      />
      <div className={shared.stack}>
        <aside className={shared.notice} aria-label="Category data status">
          <Info size={20} strokeWidth={1.75} aria-hidden="true" className={shared.noticeIcon} />
          <p>
            <strong>No category figures are published.</strong> Annual totals are available, but
            NCRB&apos;s category breakdown (Table 3A.2) is still under research review, so no
            category counts, shares or rankings are shown.
          </p>
        </aside>
        {state.status === 'ready' && <CategoriesContent data={state.data} />}
        {state.status === 'loading' && <p className={shared.state} role="status">Loading source and validation records…</p>}
        {state.status === 'error' && (
          <div className={shared.state} role="alert">
            <p>The data service is unavailable, so source and validation records cannot be shown.</p>
            <button type="button" className={shared.button} onClick={state.retry}>Try again</button>
          </div>
        )}
      </div>
    </>
  );
}
