import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { seriesStatusDisplay, STATUS_KIND } from '../../data/status';
import styles from './ContextStrip.module.css';

const NOT_LOADED = '—';
const STATUS_TEXT = {
  loading: 'Loading status…',
  empty: 'No figures loaded',
  error: 'Unavailable while the data service cannot be reached',
};

function describePeriod(series) {
  if (series.length === 0) return NOT_LOADED;
  return `${series[0].year}–${series[series.length - 1].year}, annual`;
}

function latestEdition(series) {
  const statistics = series.filter((row) => row.statistic).map((row) => row.statistic);
  return statistics.length > 0 ? statistics[statistics.length - 1].edition : NOT_LOADED;
}

export function ContextStrip({ trend }) {
  const seriesStatus = seriesStatusDisplay(trend.series);

  return (
    <dl className={styles.strip} aria-label="Scope of this page">
      <div className={styles.item}>
        <dt>Reporting unit</dt>
        <dd>Delhi UT</dd>
      </div>
      <div className={styles.item}>
        <dt>Period</dt>
        <dd>{describePeriod(trend.series)}</dd>
      </div>
      <div className={styles.item}>
        <dt>Latest edition read</dt>
        <dd>{latestEdition(trend.series)}</dd>
      </div>
      <div className={styles.item}>
        <dt>Data status</dt>
        <dd>
          {trend.status === 'ready' ? (
            <StatusLabel kind={seriesStatus.kind}>{seriesStatus.label}</StatusLabel>
          ) : (
            <StatusLabel kind={STATUS_KIND.UNAVAILABLE}>{STATUS_TEXT[trend.status]}</StatusLabel>
          )}
        </dd>
      </div>
    </dl>
  );
}
