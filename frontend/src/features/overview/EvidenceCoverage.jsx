import { Panel } from '../../components/Panel/Panel';
import { StatusLabel } from '../../components/StatusLabel/StatusLabel';
import { getEvidenceCoverage } from '../../data';
import styles from './EvidenceCoverage.module.css';

const coverage = getEvidenceCoverage();

export function EvidenceCoverage() {
  return (
    <Panel
      title="Evidence coverage"
      description="What SafeHer currently holds for Delhi UT."
    >
      <table className={styles.table}>
        <caption className={styles.caption}>Evidence coverage by dataset and year</caption>
        <thead>
          <tr>
            <th scope="col">Years</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        {coverage.map(({ dataset, table, ranges }) => (
          <tbody key={dataset}>
            <tr>
              <th scope="rowgroup" colSpan={2} className={styles.group}>
                {dataset} <span className={styles.tableRef}>{table}</span>
              </th>
            </tr>
            {ranges.map(({ years, kind, label }) => (
              <tr key={years}>
                <td className={styles.years}>{years}</td>
                <td>
                  <StatusLabel kind={kind}>{label}</StatusLabel>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      <p className={styles.note}>
        Annual totals have been checked against Table 3A.1 extracts. The comparison with the
        category table (3A.2) is still pending, so validation is not complete. Incomplete means
        the source exists but checks are unfinished. Unavailable means no value from an
        obtained source.
      </p>
    </Panel>
  );
}
