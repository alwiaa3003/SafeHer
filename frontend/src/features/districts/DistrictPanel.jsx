import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { comparison, formatChange, formatCount, valueFor } from './districtScale';
import mapStyles from '../map/MapExplorer.module.css';
import styles from './Districts.module.css';

export const INTERPRETATION =
  'These figures represent cases registered by police. They do not establish guilt, represent all actual incidents, or measure the safety of an area.';

const REGIME = { ALL: 'IPC and special and local laws (SLL), as printed', IPC: 'Indian Penal Code (IPC)', SLL: 'Special and local laws (SLL)' };

function Fact({ term, children }) {
  return (
    <div className={mapStyles.fact}>
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Figure({ entry, year, category }) {
  if (entry) {
    return (
      <p className={styles.figure}>
        <span className={styles.figureValue}>{formatCount(entry.registeredCases)}</span>
        <span className={styles.figureUnit}>registered {entry.registeredCases === 1 ? 'case' : 'cases'} in {year}</span>
      </p>
    );
  }
  const reason = category && !category.years.includes(year)
    ? `No validated figure. District figures for this category have been checked for ${category.years.join(', ')} only.`
    : `No validated figure is held for this district in ${year}.`;
  return (
    <p className={styles.figure}>
      <span className={styles.figureMissing}>Not available</span>
      <span className={styles.figureUnit}>{reason} This is not the same as zero.</span>
    </p>
  );
}

function Comparison({ district, year }) {
  const result = comparison(district, year);
  if (result.status === 'no_current') return null;
  if (result.status === 'no_previous') {
    return <p className={mapStyles.hint}>No earlier validated year for this category, so no comparison is shown.</p>;
  }
  return (
    <>
      <dl className={mapStyles.facts}>
        <Fact term={`Change since ${result.previousYear}`}>{formatChange(result)}</Fact>
        <Fact term={`${result.previousYear} figure`}>{formatCount(result.previous)} registered cases</Fact>
      </dl>
      {result.percent === null && <p className={mapStyles.hint}>No percentage: the earlier figure is zero.</p>}
      <p className={mapStyles.hint}>A change in registered cases can reflect reporting and registration as well as offending.</p>
    </>
  );
}

// Details for one police district, for the selected year and category.
export function DistrictPanel({ unit, statistics, year, category, sources, locationNote, onClose, expanded, onToggle }) {
  const entry = valueFor(statistics, year);
  const source = sources.find((s) => s.reportingPeriod?.from === year);
  const summary = entry ? `${formatCount(entry.registeredCases)} registered cases · ${year}` : `No validated figure · ${year}`;
  return (
    <section className={mapStyles.location} data-expanded={expanded} aria-labelledby="district-title">
      <div className={mapStyles.locationHead}>
        <div className={mapStyles.locationHeading}>
          <p className={styles.eyebrow}>Police district</p>
          <h2 id="district-title" className={mapStyles.popoverTitle}>{unit.label}</h2>
          <p className={mapStyles.locationSummary}>{summary}</p>
        </div>
        <div className={mapStyles.locationButtons}>
          <button type="button" className={`${mapStyles.iconButton} ${mapStyles.sheetToggle}`} aria-expanded={expanded} aria-controls="district-body" onClick={onToggle} aria-label={expanded ? 'Collapse district details' : 'Expand district details'}>
            {expanded ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronUp size={18} aria-hidden="true" />}
          </button>
          <button type="button" className={mapStyles.iconButton} onClick={onClose} aria-label="Close district details">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id="district-body" className={mapStyles.locationBody} data-expanded={expanded}>
        <Figure entry={entry} year={year} category={category} />
        {locationNote && <p className={mapStyles.hint}>{locationNote}</p>}
        <dl className={mapStyles.facts}>
          <Fact term="Crime category">{category?.label ?? '—'}</Fact>
          {category && category.labelOriginal !== category.label && <Fact term="As printed by NCRB">{category.labelOriginal}</Fact>}
          {category && <Fact term="Legal basis">{REGIME[category.legalRegime] ?? category.legalRegime}</Fact>}
          <Fact term="Year">{year}</Fact>
          <Fact term="Geographic precision">Police district</Fact>
        </dl>
        <section className={mapStyles.section} aria-labelledby="district-change">
          <h3 id="district-change" className={mapStyles.sectionTitle}>Previous year</h3>
          <Comparison district={statistics} year={year} />
        </section>
        <p className={styles.notice}>{INTERPRETATION}</p>
        <section className={mapStyles.section} aria-labelledby="district-source">
          <h3 id="district-source" className={mapStyles.sectionTitle}>Source</h3>
          {source ? (
            <p className={mapStyles.hint}>
              National Crime Records Bureau, <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">{source.sourceName}</a>
              {entry?.sourceReference ? `. ${entry.sourceReference}.` : '.'}
            </p>
          ) : (
            <p className={mapStyles.hint}>No NCRB district file is held for {year}.</p>
          )}
          <p className={mapStyles.hint}>District-level statistics do not identify individual incident locations.</p>
          <p className={styles.links}>
            <Link to="/methodology" className={mapStyles.inlineLink}>Methodology</Link>
            <Link to="/data-sources" className={mapStyles.inlineLink}>Data &amp; Sources</Link>
          </p>
        </section>
      </div>
    </section>
  );
}
