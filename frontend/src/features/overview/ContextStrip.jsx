import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { PENDING_PDF_LABEL, STATUS_KIND } from '../../data/status';
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
          <StatusLabel kind={STATUS_KIND.INCOMPLETE}>{PENDING_PDF_LABEL}</StatusLabel>
        </dd>
      </div>
    </dl>
  );
}
