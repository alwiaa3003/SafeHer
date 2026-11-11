import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reversePlace } from '../../data';
import { SourceDetails } from '../geography/BoundaryInfo';
import { formatCoordinate, inDelhiRegion, pointInGeometry } from './geo';
import styles from './MapExplorer.module.css';

const placeCache = new Map();

// The lookup key is the point rounded to about 10 m, which is also what the server caches.
const keyOf = (point) => (point ? `${point.lat.toFixed(4)},${point.lng.toFixed(4)}` : null);

function usePlaceName(selected) {
  const outside = Boolean(selected) && !inDelhiRegion(selected);
  const key = outside ? null : keyOf(selected);
  const [result, setResult] = useState({ key: null });
  useEffect(() => {
    if (!key || placeCache.has(key)) return undefined;
    const [lat, lng] = key.split(',').map(Number);
    const controller = new AbortController();
    // A short pause so rapid clicks send one lookup, not many.
    const timer = setTimeout(() => {
      reversePlace(lat, lng, { signal: controller.signal })
        .then((body) => {
          placeCache.set(key, body.data);
          setResult({ key, status: 'ready', place: body.data });
        })
        .catch((error) => { if (error.name !== 'AbortError') setResult({ key, status: 'error', place: null }); });
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [key]);
  if (outside) return { status: 'outside', place: null };
  if (!key) return { status: 'idle', place: null };
  if (placeCache.has(key)) return { status: 'ready', place: placeCache.get(key) };
  return result.key === key ? result : { status: 'loading', place: null };
}

function Fact({ term, children }) {
  return (
    <div className={styles.fact}>
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function PlaceSection({ selected, outline, place, district, districtsDrawn }) {
  const inside = outline.status === 'ready' ? pointInGeometry(selected, outline.unit.geometry) : null;
  return (
    <section className={styles.section} aria-labelledby="loc-place">
      <h3 id="loc-place" className={styles.sectionTitle}>Place</h3>
      <dl className={styles.facts}>
        <Fact term="Coordinates">{formatCoordinate(selected.lat, 'N', 'S')}, {formatCoordinate(selected.lng, 'E', 'W')}</Fact>
        <Fact term="Name">
          {place.status === 'loading' && 'Looking up…'}
          {place.status === 'ready' && (place.place?.label ?? 'No named place found here')}
          {place.status === 'error' && 'Place name unavailable right now'}
          {place.status === 'outside' && 'Not looked up: outside the Delhi region'}
        </Fact>
        <Fact term="Delhi outline">
          {inside === null ? 'Outline not loaded' : inside ? 'Inside the Delhi outline (OpenStreetMap, context only)' : 'Outside the Delhi outline. SafeHer holds no data for this area.'}
        </Fact>
        <Fact term="Police district">
          {district ? district.label : districtsDrawn ? 'Outside the 16 police districts drawn on the map.' : 'Not identified. No licensed police-district boundary is available.'}
        </Fact>
      </dl>
    </section>
  );
}

function CrimeSection({ eligibleCount, districtsDrawn }) {
  return (
    <section className={styles.section} aria-labelledby="loc-crime">
      <h3 id="loc-crime" className={styles.sectionTitle}>Crime records</h3>
      <p className={styles.statement}>
        {eligibleCount === 0 ? 'No verified incident records are available for any location in SafeHer.' : `${eligibleCount} verified records are on the map.`}
      </p>
      <p className={styles.hint}>
        This does not mean no crime has been recorded here, and it does not indicate that a place is
        safe or unsafe.
      </p>
      <ul className={styles.availability}>
        <li><strong>Delhi UT annual totals, 2016–2024:</strong> available for Delhi as a whole. <Link to="/crime-trends" className={styles.inlineLink}>Crime Trends</Link></li>
        <li><strong>Police-district counts, 2020–2022:</strong> {districtsDrawn ? 'select a district on the map to see its NCRB figures.' : 'available as a table from the map key; boundaries cannot be drawn yet.'}</li>
        <li><strong>Incident locations:</strong> not available.</li>
      </ul>
    </section>
  );
}

function SourcesSection({ outline }) {
  return (
    <details className={styles.details}>
      <summary>Sources and limitations</summary>
      <ul className={styles.availability}>
        <li>Map tiles: © OpenStreetMap contributors, under the OSM tile usage policy.</li>
        <li>
          Place names: Nominatim, © OpenStreetMap contributors (ODbL).{' '}
          <a href="https://operations.osmfoundation.org/policies/nominatim/" target="_blank" rel="noopener noreferrer">Usage policy</a>
        </li>
        <li>The outline is volunteer-mapped context. It has not been shown to match NCRB&apos;s Delhi UT or Delhi City reporting units.</li>
      </ul>
      {outline.status === 'ready' && <SourceDetails unit={outline.unit} />}
      <Link to="/methodology" className={styles.inlineLink}>Methodology</Link>
    </details>
  );
}

// Shown only once a location has been selected. On phones it is a bottom sheet that can be
// collapsed to its header, so the map stays usable behind it.
export function LocationPanel({ selected, outline, eligibleCount, district = null, districtsDrawn = false, onClose, expanded, onToggle }) {
  const place = usePlaceName(selected);
  const summary = place.status === 'ready' && place.place?.label
    ? place.place.label
    : `${formatCoordinate(selected.lat, 'N', 'S')}, ${formatCoordinate(selected.lng, 'E', 'W')}`;
  return (
    <section className={styles.location} data-expanded={expanded} aria-labelledby="location-title">
      <div className={styles.locationHead}>
        <div className={styles.locationHeading}>
          <h2 id="location-title" className={styles.popoverTitle}>Selected location</h2>
          <p className={styles.locationSummary}>{summary}</p>
        </div>
        <div className={styles.locationButtons}>
          <button type="button" className={`${styles.iconButton} ${styles.sheetToggle}`} aria-expanded={expanded} aria-controls="location-body" onClick={onToggle} aria-label={expanded ? 'Collapse location details' : 'Expand location details'}>
            {expanded ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronUp size={18} aria-hidden="true" />}
          </button>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close location details">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id="location-body" className={styles.locationBody} data-expanded={expanded}>
        <PlaceSection selected={selected} outline={outline} place={place} district={district} districtsDrawn={districtsDrawn} />
        <CrimeSection eligibleCount={eligibleCount} districtsDrawn={districtsDrawn} />
        <SourcesSection outline={outline} />
      </div>
    </section>
  );
}
