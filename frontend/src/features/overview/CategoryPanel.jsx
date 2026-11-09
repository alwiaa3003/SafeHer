import { Panel } from '../../components/Panel/Panel';
import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { STATUS_KIND } from '../../data/status';
import styles from './CategoryPanel.module.css';

// Intentionally has no chart: categories appear only once their original NCRB
// labels and values have been verified against the source.
export function CategoryPanel() {
  return (
    <Panel
      title="Crime categories"
      description="Breakdown of registered cases using NCRB's own category labels."
    >
      <div className={styles.state}>
        <StatusLabel kind={STATUS_KIND.UNAVAILABLE}>Not shown until source-verified</StatusLabel>
        <p>
          NCRB publishes a category table for Delhi UT (Table 3A.2). SafeHer will show it only
          after each original label and value has been checked against the PDF, starting with
          2018 and 2022–2024.
        </p>
      </div>
    </Panel>
  );
}
