import { AnnualTrendPanel } from '../features/overview/AnnualTrendPanel';
import { CategoryPanel } from '../features/overview/CategoryPanel';
import { ContextStrip } from '../features/overview/ContextStrip';
import { EvidenceCoverage } from '../features/overview/EvidenceCoverage';
import { ExploreFurther } from '../features/overview/ExploreFurther';
import { MethodologyNote } from '../features/overview/MethodologyNote';
import { useDelhiUtTrend } from '../features/overview/useDelhiUtTrend';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import styles from './OverviewPage.module.css';

export const OVERVIEW_HEADING = "What Delhi's registered crime records can and cannot tell us";

export function OverviewPage() {
  const trend = useDelhiUtTrend();

  return (
    <>
      <PageHeader
        eyebrow="Delhi · Registered crime records"
        title={OVERVIEW_HEADING}
        documentTitle="Overview"
        description="Officially registered crimes against women, with the source and checking status of every figure in view."
      />
      <ContextStrip trend={trend} />
      <div className={styles.rows}>
        <div className={styles.primary}>
          <AnnualTrendPanel trend={trend} />
          <EvidenceCoverage />
        </div>
        <div className={styles.secondary}>
          <CategoryPanel />
          <ExploreFurther />
        </div>
        <MethodologyNote />
      </div>
    </>
  );
}
