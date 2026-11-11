import styles from './MapExplorer.module.css';

function districtHint(boundary, hasPolygons) {
  if (!boundary) return 'Loading…';
  if (boundary.status === 'unavailable' || !hasPolygons) return 'Not drawn: no licensed police-district boundary is available. The figures can be viewed as a table from the map key.';
  if (boundary.status === 'review_only') return 'NCRB registered cases on a GSDL local review copy of the boundaries. Not licensed for publication.';
  return `NCRB registered cases. Boundaries: ${boundary.provider ?? 'source recorded'}${boundary.licence?.name ? `, ${boundary.licence.name}` : ''}.`;
}

export function LayerPanel({ baseStyle, onBaseStyle, showOutline, onShowOutline, outlineStatus, showDistricts, onShowDistricts, boundary, hasPolygons, eligibleCount }) {
  return (
    <div className={styles.panelBody}>
      <fieldset className={styles.fieldset}>
        <legend>Base map</legend>
        {[['muted', 'Muted', 'Softened colours so overlays stand out'], ['standard', 'Standard', 'OpenStreetMap as published']].map(([value, label, hint]) => (
          <label key={value} className={styles.option}>
            <input type="radio" name="base-style" value={value} checked={baseStyle === value} onChange={() => onBaseStyle(value)} />
            <span><strong>{label}</strong><span className={styles.hint}>{hint}</span></span>
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>Crime figures</legend>
        <label className={styles.option}>
          <input type="checkbox" checked={showDistricts && hasPolygons} onChange={(e) => onShowDistricts(e.target.checked)} disabled={!hasPolygons} />
          <span>
            <strong>Police-district counts</strong>
            <span className={styles.hint}>{districtHint(boundary, hasPolygons)}</span>
          </span>
        </label>
        <label className={styles.option}>
          <input type="checkbox" checked={false} disabled aria-describedby="incident-layer-note" onChange={() => {}} />
          <span>
            <strong>Verified incident markers</strong>
            <span className={styles.hint} id="incident-layer-note">{eligibleCount} eligible records. Incident-level locations are not available, and district totals are never turned into points.</span>
          </span>
        </label>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>Geographic context</legend>
        <label className={styles.option}>
          <input type="checkbox" checked={showOutline} onChange={(e) => onShowOutline(e.target.checked)} disabled={outlineStatus !== 'ready'} />
          <span>
            <strong>Delhi outline</strong>
            <span className={styles.hint}>
              {outlineStatus === 'ready' ? 'OpenStreetMap relation 1942586. Context only, not a police boundary.' : outlineStatus === 'loading' ? 'Loading…' : 'Not available right now.'}
            </span>
          </span>
        </label>
      </fieldset>
    </div>
  );
}
