import { PageShell } from '../layout/PageShell/PageShell';

export function MetroComparisonPage() {
  return (
    <PageShell
      eyebrow="Analysis"
      title="Metro Comparison"
      description="Delhi City alongside India's other metropolitan cities."
      questions={[
        'How do registered counts and category mixes differ between metros?',
        'Why should these differences not be read as a safety ranking?',
      ]}
      dataNote="Not built yet. This page will use Delhi City only and will never be joined to the Delhi UT series."
    />
  );
}
