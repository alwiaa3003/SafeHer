import { ChevronDown, ChevronUp, Table2 } from 'lucide-react';
import { classLabel, MISSING_FILL } from './districtScale';
import styles from './Districts.module.css';

// The map key. It always states what the colours mean and what they do not mean.
export function DistrictLegend({ scale, year, category, boundary, drawn = true, collapsed, onToggle, onOpenTable, onShowYear, tableButtonRef }) {
  const validatedForYear = !category || category.years.includes(year);
  return (
    <section className={styles.legend} aria-labelledby="legend-title" data-collapsed={collapsed}>
      <div className={styles.legendHead}>
        <div className={styles.legendHeading}>
          <h2 id="legend-title" className={styles.legendTitle}>Registered cases · {year}</h2>
          <p className={styles.legendCategory}>{category?.label ?? 'Loading…'}</p>
        </div>
        <button type="button" className={styles.legendToggle} onClick={onToggle} aria-expanded={!collapsed} aria-controls="legend-body" aria-label={collapsed ? 'Expand map key' : 'Collapse map key'}>
          {collapsed ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>
      </div>
      <div id="legend-body" className={styles.legendBody} hidden={collapsed}>
        {!validatedForYear && (
          <p className={styles.legendWarning}>
            This category is validated for {category.years.join(', ')} only.{' '}
            <button type="button" className={styles.textButton} onClick={() => onShowYear(category.years[category.years.length - 1])}>Show {category.years[category.years.length - 1]}</button>
          </p>
        )}
        {!drawn && <p className={styles.legendNote}>No district shapes are drawn, so there is no colour key. The figures are in the table.</p>}
        {drawn && scale.classes.length > 0 && (
          <ul className={styles.swatches} aria-label="Colour classes">
            {scale.classes.map((c) => (
              <li key={`${c.min}-${c.max}`}><span className={styles.swatch} style={{ background: c.fill }} aria-hidden="true" />{classLabel(c)}</li>
            ))}
          </ul>
        )}
        {drawn && (scale.hasMissing || scale.classes.length === 0) && (
          <p className={styles.missingKey}><span className={`${styles.swatch} ${styles.swatchMissing}`} style={{ background: MISSING_FILL }} aria-hidden="true" />Not available (no validated figure; not zero)</p>
        )}
        {drawn && <p className={styles.legendNote}>Darker shades show more registered cases, not higher individual risk. Classes are based on this year and category only.</p>}
        <p className={styles.legendNote}>Registered cases, not proven offences. Not a safety score.</p>
        {drawn && boundary?.status === 'published' && (
          <p className={styles.legendNote}>
            Boundaries: {boundary.provider}.{' '}
            {boundary.licence?.url ? <a href={boundary.licence.url} target="_blank" rel="noopener noreferrer">{boundary.licence.name}</a> : boundary.licence?.name}
            {boundary.licence?.attribution ? `. ${boundary.licence.attribution}` : ''}
          </p>
        )}
        {boundary?.status === 'review_only' && (
          <p className={styles.reviewBadge} role="note">Boundaries: GSDL local review copy. GSDL states “All Rights Reserved”; not licensed for publication.</p>
        )}
        <button ref={tableButtonRef} type="button" className={styles.tableButton} onClick={onOpenTable}>
          <Table2 size={14} aria-hidden="true" /> View figures as a table
        </button>
      </div>
    </section>
  );
}
