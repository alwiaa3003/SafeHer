import styles from './BoundaryInfo.module.css';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Provenance of the Delhi outline, from the geography API.
export function SourceDetails({ unit }) {
  const { provenance } = unit;
  const { osm, licence } = provenance;
  return (
    <>
      <section className={styles.block}>
        <h3>Where the outline came from</h3>
        <dl className={styles.facts}>
          <div>
            <dt>Source</dt>
            <dd>
              <a href={provenance.sourceUrl} target="_blank" rel="noopener noreferrer">
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
            <dt>Geometry</dt>
            <dd>{unit.geometryType}, {provenance.crs}</dd>
          </div>
        </dl>
      </section>
      <section className={styles.block}>
        <h3>Licence and attribution</h3>
        <p>
          {licence.attribution}. Boundary data is available under the{' '}
          <a href={licence.url} target="_blank" rel="noopener noreferrer">{licence.name}</a>. See{' '}
          <a href={licence.copyrightUrl} target="_blank" rel="noopener noreferrer">OpenStreetMap copyright</a>.
        </p>
      </section>
    </>
  );
}
