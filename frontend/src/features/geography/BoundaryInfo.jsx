import { Panel } from '../../components/Panel/Panel';
import styles from './BoundaryInfo.module.css';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function SourceDetails({ unit }) {
  const { provenance } = unit;
  const { osm, licence } = provenance;
  return (
    <>
      <section className={styles.block}>
        <h3>Where the geometry came from</h3>
        <dl className={styles.facts}>
          <div>
            <dt>Source</dt>
            <dd>
              <a href={provenance.sourceUrl} target="_blank" rel="noreferrer">
                {provenance.provider} {osm.elementType} {osm.elementId}
              </a>
            </dd>
          </div>
          <div>
            <dt>OSM version</dt>
            <dd>{osm.version}, last edited {formatDate(osm.timestamp)}</dd>
          </div>
          <div>
            <dt>Retrieved</dt>
            <dd>{formatDate(provenance.retrievedAt)}</dd>
          </div>
          <div>
            <dt>Administrative level</dt>
            <dd>OSM admin_level {unit.adminLevel}</dd>
          </div>
          <div>
            <dt>Geometry</dt>
            <dd>{unit.geometryType}, {provenance.crs}</dd>
          </div>
        </dl>
      </section>
      <section className={styles.block}>
        <h3>Licence and attribution</h3>
        <p>
          {licence.attribution}. Boundary data is available under the{' '}
          <a href={licence.url} target="_blank" rel="noreferrer">{licence.name}</a>. See{' '}
          <a href={licence.copyrightUrl} target="_blank" rel="noreferrer">OpenStreetMap copyright</a>.
        </p>
      </section>
    </>
  );
}

export function BoundaryInfo({ state }) {
  return (
    <Panel title="About this map">
      <div className={styles.content}>
        <section className={styles.block}>
          <h3>What the boundary represents</h3>
          <p>
            The outline of the National Capital Territory of Delhi as mapped in OpenStreetMap. It is
            volunteer-maintained, is not a legally authoritative boundary, and has not been shown to
            match NCRB's "Delhi UT" or "Delhi City" reporting units exactly.
          </p>
        </section>
        {state.status === 'ready' && <SourceDetails unit={state.unit} />}
        <section className={styles.block}>
          <h3>Why district-level crime is not shown</h3>
          <p>
            The NCRB figures SafeHer currently holds are totals for Delhi as a whole. Dividing them
            across districts, wards or streets would invent a pattern the data does not contain.
          </p>
        </section>
      </div>
    </Panel>
  );
}
