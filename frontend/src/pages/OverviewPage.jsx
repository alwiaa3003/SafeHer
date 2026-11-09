import { PageShell } from '../layout/PageShell/PageShell';

export function OverviewPage() {
  return (
    <PageShell
      eyebrow="Overview"
      title="Overview"
      description="A brief on what Delhi's registered crime records can and cannot tell us."
      questions={[
        'How have registered crimes against women in Delhi UT changed over time?',
        'Which years and datasets are verified, incomplete or unavailable?',
        'How should these records be read, and what are their limits?',
      ]}
      dataNote="The full Overview is the next build stage. No statistics are shown on this page yet."
    />
  );
}
