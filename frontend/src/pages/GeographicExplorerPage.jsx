import { Info } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Panel } from '../components/Panel/Panel';
import { BoundaryInfo } from '../features/geography/BoundaryInfo';
import { useDelhiBoundary } from '../features/geography/useDelhiBoundary';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import styles from './GeographicExplorerPage.module.css';

// Leaflet is only downloaded when this page is opened.
const GeographyMap = lazy(() => import('../features/geography/GeographyMap'));

const LoadingMap = () => (
  <p className={styles.state} role="status">
    Loading the Delhi boundary…
  </p>
);

function MapArea({ boundary }) {
  if (boundary.status === 'loading') return <LoadingMap />;
  if (boundary.status === 'error') {
    return (
      <div className={styles.state} role="alert">
        <p>The geography service is unavailable, so the boundary cannot be shown.</p>
        <button type="button" className={styles.retry} onClick={boundary.retry}>
          Try again
        </button>
      </div>
    );
  }
  if (boundary.status === 'empty') {
    return (
      <p className={styles.state} role="status">
        No verified boundary has been loaded yet, so no map is shown.
      </p>
    );
  }
  return (
    <Suspense fallback={<LoadingMap />}>
      <GeographyMap unit={boundary.unit} />
    </Suspense>
  );
}

export function GeographicExplorerPage() {
  const boundary = useDelhiBoundary();

  return (
    <>
      <PageHeader
        eyebrow="Geography"
        title="Geographic Explorer"
        description="A geographic context map of Delhi. It shows where Delhi is, not where crime occurs."
      />
      <aside className={styles.notice} aria-label="Map limitations">
        <Info size={20} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
        <p>
          <strong>Geographic context only.</strong> The NCRB figures SafeHer currently holds are
          reported for Delhi as a whole and cannot be reliably assigned to individual districts,
          wards or streets. This map does not represent crime concentration or personal safety.
        </p>
      </aside>
      <div className={styles.layout}>
        <Panel title="Delhi boundary" description="National Capital Territory of Delhi, from OpenStreetMap.">
          <MapArea boundary={boundary} />
        </Panel>
        <BoundaryInfo state={boundary} />
      </div>
    </>
  );
}
