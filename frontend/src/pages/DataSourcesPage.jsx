import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable/DataTable';
import { Panel } from '../components/Panel/Panel';
import { StatusLabel } from '../components/StatusLabel/StatusLabel';
import { fetchDataSources, fetchGeographyList, fetchValidationChecks } from '../data';
import { useApiResource } from '../data/useApiResource';
import { resultDisplay } from '../data/validationResults';
import { periodText, productionUse, sourceForm, sourceResults, typeLabel } from '../features/sources/sourceProfile';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import shared from './AnalysisPage.module.css';
import styles from './DataSourcesPage.module.css';

const load = (signal) =>
  Promise.all([fetchDataSources({ signal }), fetchValidationChecks({ signal }), fetchGeographyList({ signal })]).then(
    ([sources, checks, units]) => ({ sources, checks, units }),
  );

const ALL = '';
const NOT_RECORDED = <span className={styles.missing}>Not recorded</span>;
const orMissing = (value) => (value === null || value === undefined || value === '' ? NOT_RECORDED : value);
const countBy = (items, key) => items.reduce((acc, item) => ({ ...acc, [key(item)]: (acc[key(item)] ?? 0) + 1 }), {});
const Result = ({ value }) => <StatusLabel kind={resultDisplay(value).kind}>{resultDisplay(value).label}</StatusLabel>;

function Overview({ sources, checks }) {
  const types = countBy(sources, (s) => s.sourceType);
  const results = countBy(checks, (c) => c.result);
  return (
    <dl className={styles.facts} aria-label="Source overview">
      <div className={styles.fact}>
        <dt>Source records</dt>
        <dd><span className={styles.factValue}>{sources.length}</span></dd>
      </div>
      <div className={styles.fact}>
        <dt>Crime statistics sources</dt>
        <dd><span className={styles.factValue}>{types.crime_statistics ?? 0}</span></dd>
      </div>
      <div className={styles.fact}>
        <dt>Geographic boundary sources</dt>
        <dd><span className={styles.factValue}>{types.geographic_boundary ?? 0}</span></dd>
      </div>
      <div className={styles.fact}>
        <dt>Validation records</dt>
        <dd>
          <span className={styles.factValue}>{checks.length}</span>
          <span className={styles.factDetail}>
            {Object.entries(results).map(([r, n]) => `${resultDisplay(r).label}: ${n}`).join(' · ') || 'None'}
          </span>
        </dd>
      </div>
    </dl>
  );
}

function SourceEntry({ source, checks, units }) {
  const use = productionUse(source, checks, units);
  const results = sourceResults(source, checks);
  const isBoundary = source.sourceType === 'geographic_boundary';
  const qualifications = [source.editionBasis, source.notes].filter(Boolean);
  const useText = use.years.length
    ? `Production annual totals for ${use.years.join(', ')}`
    : use.boundaries.length
      ? `Crime Map outline (${use.boundaries.map((u) => u.boundaryVersion).join(', ')})${use.boundaries.every((u) => u.contextOnly) ? ', context only' : ''}`
      : 'No production record refers to this source';

  return (
    <li className={styles.entry}>
      <article aria-labelledby={`source-${source.id}`}>
        <div className={styles.entryHead}>
          <h3 id={`source-${source.id}`} className={styles.entryTitle}>{source.sourceName}</h3>
          <span className={shared.badge}>{typeLabel(source.sourceType)}</span>
        </div>
        <p className={styles.publisher}>{source.publisher}</p>
        <dl className={styles.meta}>
          <dt>Source form</dt>
          <dd>{sourceForm(source)}</dd>
          {!isBoundary && (
            <>
              <dt>Table</dt>
              <dd>{orMissing(source.tableReference)}{source.tableTitle && ` — ${source.tableTitle}`}</dd>
              <dt>Years covered</dt>
              <dd>{orMissing(periodText(source.reportingPeriod))}</dd>
              <dt>Edition year</dt>
              <dd>{orMissing(source.publicationYear)}</dd>
            </>
          )}
          <dt>Used for</dt>
          <dd>{useText}</dd>
          <dt>Validation</dt>
          <dd>{results.length ? <span className={styles.labels}>{results.map((r) => <Result key={r} value={r} />)}</span> : NOT_RECORDED}</dd>
          <dt>Source link</dt>
          <dd>
            {source.sourceUrl ? (
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                {new URL(source.sourceUrl).hostname}<span className={shared.muted}> (opens in a new tab)</span>
              </a>
            ) : NOT_RECORDED}
          </dd>
        </dl>
        {qualifications.length > 0 && (
          <ul className={styles.qualifications} aria-label={`Qualifications for ${source.sourceName}`}>
            {qualifications.map((q) => <li key={q}>{q}</li>)}
          </ul>
        )}
        <details className={styles.details}>
          <summary>Full provenance</summary>
          <dl className={styles.meta}>
            <dt>Source key</dt>
            <dd>{source.sourceKey}</dd>
            <dt>Volume</dt>
            <dd>{orMissing(source.volume)}</dd>
            {isBoundary && (
              <>
                <dt>Boundary reference</dt>
                <dd>{source.boundaryReference ? `${source.boundaryReference.elementType} ${source.boundaryReference.elementId}, version ${source.boundaryReference.version}, last edited ${source.boundaryReference.lastEditedYear ?? 'not recorded'}` : NOT_RECORDED}</dd>
              </>
            )}
            <dt>Evidence file</dt>
            <dd>{orMissing(source.extract?.fileName)}{source.extract?.extractPage ? `, page ${source.extract.extractPage}` : ''}</dd>
            <dt>File SHA-256</dt>
            <dd className={styles.hash}>{orMissing(source.extract?.sha256)}</dd>
            <dt>Full URL</dt>
            <dd className={styles.hash}>{orMissing(source.sourceUrl)}</dd>
          </dl>
        </details>
      </article>
    </li>
  );
}

function Catalogue({ sources, checks, units }) {
  const [filters, setFilters] = useState({ type: ALL, publisher: ALL, result: ALL });
  const options = useMemo(() => ({
    type: [...new Set(sources.map((s) => s.sourceType))],
    publisher: [...new Set(sources.map((s) => s.publisher))],
    result: [...new Set(checks.map((c) => c.result))],
  }), [sources, checks]);
  const visible = sources.filter((s) =>
    (filters.type === ALL || s.sourceType === filters.type)
    && (filters.publisher === ALL || s.publisher === filters.publisher)
    && (filters.result === ALL || sourceResults(s, checks).includes(filters.result)),
  );
  const set = (key) => (event) => setFilters((f) => ({ ...f, [key]: event.target.value }));
  const active = Object.values(filters).some((v) => v !== ALL);

  return (
    <Panel title="Source catalogue" description="Every source record in the data service, with the identity, link and notes stored for it.">
      <div className={styles.filters} role="group" aria-label="Filter sources">
        <label className={styles.field}>
          Source type
          <select value={filters.type} onChange={set('type')}>
            <option value={ALL}>All types</option>
            {options.type.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          Publisher
          <select value={filters.publisher} onChange={set('publisher')}>
            <option value={ALL}>All publishers</option>
            {options.publisher.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          Validation result
          <select value={filters.result} onChange={set('result')}>
            <option value={ALL}>Any result</option>
            {options.result.map((r) => <option key={r} value={r}>{resultDisplay(r).label}</option>)}
          </select>
        </label>
        <button type="button" className={shared.button} onClick={() => setFilters({ type: ALL, publisher: ALL, result: ALL })} disabled={!active}>
          Reset filters
        </button>
      </div>
      <p className={styles.count} role="status">Showing {visible.length} of {sources.length} sources</p>
      {visible.length === 0 ? (
        <p className={shared.state}>No source matches these filters.</p>
      ) : (
        <ul className={styles.catalogue}>
          {visible.map((s) => <SourceEntry key={s.id} source={s} checks={checks} units={units} />)}
        </ul>
      )}
    </Panel>
  );
}

const validationColumns = [
  { key: 'rule', header: 'Rule', render: (v) => <span className={styles.nowrap}>{v.checkName}</span> },
  { key: 'year', header: 'Year', render: (v) => v.reportingYear },
  { key: 'result', header: 'Result', render: (v) => <Result value={v.result} /> },
  { key: 'source', header: 'Source', render: (v) => v.source?.sourceName ?? NOT_RECORDED },
  { key: 'explanation', header: 'Scope and explanation', render: (v) => v.explanation },
  { key: 'checked', header: 'Checked', render: (v) => (v.checkedAt ? v.checkedAt.slice(0, 10) : 'Not yet checked') },
];

function Validation({ checks }) {
  const byRule = countBy(checks, (c) => `${c.checkName}|${c.result}`);
  const rows = [...checks].sort((a, b) => a.checkName.localeCompare(b.checkName) || a.reportingYear - b.reportingYear);
  return (
    <Panel title="Validation records" description="Every check stored in the data service, exactly as recorded. Pending and failed checks are shown as they are.">
      <p className={shared.caption}>
        {Object.entries(byRule).map(([key, n]) => {
          const [rule, result] = key.split('|');
          return `${rule}: ${n} ${resultDisplay(result).label.toLowerCase()}`;
        }).join(' · ')}
      </p>
      <DataTable caption="Validation records by rule and year" columns={validationColumns} rows={rows} getRowKey={(v) => v.id} />
    </Panel>
  );
}

function Evidence({ sources, checks, units }) {
  const used = sources.filter((s) => productionUse(s, checks, units).years.length > 0);
  const context = units.filter((u) => u.contextOnly);
  return (
    <Panel title="Production, research-only and contextual evidence" description="Having a source does not mean every analysis it might support is approved.">
      <div className={styles.evidence}>
        <section aria-labelledby="ev-production">
          <h3 id="ev-production">In production</h3>
          <div className={shared.body}>
            <p>{used.length} crime-statistics {used.length === 1 ? 'source supplies' : 'sources supply'} the published Delhi UT annual totals: {used.map((s) => s.sourceName).join('; ') || 'none'}.</p>
            <p className={shared.muted}>From the validation records that reference each source.</p>
          </div>
        </section>
        <section aria-labelledby="ev-context">
          <h3 id="ev-context">Context only</h3>
          <div className={shared.body}>
            <p>{context.length} boundary {context.length === 1 ? 'record is' : 'records are'} marked context only. The outline shows where Delhi is and carries no crime values.</p>
            <p className={shared.muted}>From the geography records&apos; context-only flag.</p>
          </div>
        </section>
        <section aria-labelledby="ev-research">
          <h3 id="ev-research">Research only</h3>
          <div className={shared.body}>
            <ul className={shared.list}>
              <li>Table 3A.2 category extracts for 2018, 2022, 2023 and 2024.</li>
              <li>NCRB district-wise files for 2014–2016. The 2020–2022 files supply the Crime Map&apos;s police-district figures (printed values only), which reach the data service only through an approved import.</li>
              <li>Delhi City metropolitan totals.</li>
              <li>A third-party-hosted copy of Crime in India 2021, used for corroboration.</li>
            </ul>
            <p className={shared.muted}>A documented project limitation: these are research files, not database records, so the data service does not list them.</p>
          </div>
        </section>
      </div>
    </Panel>
  );
}

function Licensing({ units }) {
  const licence = units.find((u) => u.provenance?.licence)?.provenance.licence;
  return (
    <Panel title="Licensing and attribution">
      <ul className={`${shared.list} ${shared.body}`}>
        <li>
          <strong>NCRB.</strong> No explicit reuse licence has been established. NCRB&apos;s website
          copyright statement asks for the Bureau&apos;s prior permission to reproduce its material;
          data.gov.in&apos;s Government Open Data Licence covers only resources published there, and
          no 2020–2022 district-wise file has been found there. SafeHer cites each publication and
          does not redistribute NCRB files.
        </li>
        <li>
          <strong>OpenStreetMap data.</strong>{' '}
          {licence ? (
            <>
              <a href={licence.url} target="_blank" rel="noopener noreferrer">{licence.name}</a>. Attribution: {licence.attribution} (
              <a href={licence.copyrightUrl} target="_blank" rel="noopener noreferrer">copyright and licence</a>).
            </>
          ) : 'Licence details were not returned by the data service.'}
        </li>
        <li>
          <strong>OpenStreetMap tiles.</strong> Map tiles are governed by the separate{' '}
          <a href="https://operations.osmfoundation.org/policies/tiles/" target="_blank" rel="noopener noreferrer">OSM tile usage policy</a>, not by the data licence.
        </li>
        <li>
          <strong>Police-district boundaries.</strong> GeoSpatial Delhi Limited publishes the 16
          Delhi Police district polygons but states &ldquo;All Rights Reserved&rdquo; and gives no
          licence. SafeHer does not publish them until written permission is given, so the Crime
          Map shows district figures as a table.
        </li>
        <li>
          <strong>Third-party-hosted NCRB copies.</strong> A report copy hosted outside NCRB can
          corroborate a figure, but it is not a verified official download.
        </li>
      </ul>
    </Panel>
  );
}

export function DataSourcesPage() {
  const state = useApiResource(load);
  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title="Data & Sources"
        documentTitle="Data & Sources"
        description="The public sources behind SafeHer, with the provenance, validation status and limits recorded for each."
      />
      <div className={shared.stack}>
        <aside className={shared.notice} aria-label="How to read this catalogue">
          <Info size={20} strokeWidth={1.75} aria-hidden="true" className={shared.noticeIcon} />
          <p>
            <strong>Available is not the same as approved.</strong> A source being listed does not
            mean every analysis it could support has been validated. Each entry shows what it is
            used for and which checks are still pending. See <Link to="/methodology">Methodology</Link>.
          </p>
        </aside>
        {state.status === 'loading' && <p className={shared.state} role="status">Loading source and validation records…</p>}
        {state.status === 'error' && (
          <div className={shared.state} role="alert">
            <p>The data service is unavailable, so sources and validation records cannot be shown.</p>
            <button type="button" className={shared.button} onClick={state.retry}>Try again</button>
          </div>
        )}
        {state.status === 'ready' && (
          <>
            <Overview sources={state.data.sources} checks={state.data.checks} />
            <Catalogue {...state.data} />
            <Validation checks={state.data.checks} />
            <Evidence {...state.data} />
            <Licensing units={state.data.units} />
          </>
        )}
      </div>
    </>
  );
}
