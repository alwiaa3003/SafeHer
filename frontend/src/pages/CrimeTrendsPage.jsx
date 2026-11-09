import { PageShell } from '../layout/PageShell/PageShell';

export function CrimeTrendsPage() {
  return (
    <PageShell
      eyebrow="Analysis"
      title="Crime Trends"
      description="Registered crimes against women in Delhi UT, year by year."
      questions={[
        'How has the Delhi UT annual total changed across published years?',
        'Where do missing years and changes in the law affect the reading?',
      ]}
      dataNote="Not built yet. Delhi UT will be the only reporting unit in this historical series, and missing years will stay missing."
    />
  );
}
