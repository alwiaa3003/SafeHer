import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { STATUS_KIND, TABLE_TOTALS_CHECKED_LABEL } from '../../data/status';
import styles from './ContextStrip.module.css';

export function ContextStrip() {
  return (
    <dl className={styles.strip} aria-label="Scope of this page">
      <div className={styles.item}>
        <dt>Reporting unit</dt>
        <dd>Delhi UT</dd>
      </div>
      <div className={styles.item}>
        <dt>Period</dt>
        <dd>2016–2024, annual</dd>
      </div>
      <div className={styles.item}>
        <dt>Latest edition read</dt>
        <dd>Crime in India 2024</dd>
      </div>
      <div className={styles.item}>
        <dt>Data status</dt>
        <dd>
          <StatusLabel kind={STATUS_KIND.VERIFIED_WITH_NOTE}>{TABLE_TOTALS_CHECKED_LABEL}</StatusLabel>
        </dd>
      </div>
    </dl>
  );
}
