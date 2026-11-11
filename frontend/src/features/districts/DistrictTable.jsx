import { formatCount, valueFor } from './districtScale';
import mapStyles from '../map/MapExplorer.module.css';
import styles from './Districts.module.css';

const cell = (unit, year) => {
  const entry = valueFor(unit, year);
  return entry ? formatCount(entry.registeredCases) : 'Not available';
};

// The same figures as the map, in alphabetical order (not a ranking). It is also how the
// figures are reached when no boundary can be drawn, and by keyboard and screen-reader users.
export function DistrictTable({ statistics, year, category, onSelect }) {
  const districts = [...(statistics?.districts ?? [])].sort((a, b) => a.label.localeCompare(b.label));
  const others = [...(statistics?.nonGeographicUnits ?? [])].sort((a, b) => a.label.localeCompare(b.label));
  const all = [...districts, ...others].map((u) => valueFor(u, year)).filter(Boolean);
  const complete = all.length === districts.length + others.length && all.length > 0;
  return (
    <div className={mapStyles.panelBody}>
      <p className={mapStyles.hint}>{category?.label}, {year}. Alphabetical order. Registered cases, not proven offences; not a safety score.</p>
      <table className={styles.table}>
        <caption className={mapStyles.visuallyHidden}>Registered cases by police district, {year}</caption>
        <thead>
          <tr><th scope="col">Police district</th><th scope="col" className={styles.num}>Cases</th></tr>
        </thead>
        <tbody>
          {districts.map((d) => (
            <tr key={d.code}>
              <th scope="row"><button type="button" className={styles.textButton} onClick={() => onSelect(d.code)}>{d.label}</button></th>
              <td className={styles.num}>{cell(d, year)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <section aria-labelledby="units-off-map">
        <h3 id="units-off-map" className={mapStyles.sectionTitle}>Units not shown on the map</h3>
        <p className={mapStyles.hint}>These police units have no geographic jurisdiction, so they are never drawn as districts. Their cases are part of Delhi&apos;s total.</p>
        <table className={styles.table}>
          <caption className={mapStyles.visuallyHidden}>Registered cases in non-geographic police units, {year}</caption>
          <tbody>
            {others.map((u) => (
              <tr key={u.code}><th scope="row">{u.labelOriginal}</th><td className={styles.num}>{cell(u, year)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      {complete && (
        <p className={mapStyles.hint}>All 23 units together: {formatCount(all.reduce((sum, e) => sum + e.registeredCases, 0))}, matching NCRB&apos;s printed Delhi figure.</p>
      )}
    </div>
  );
}
