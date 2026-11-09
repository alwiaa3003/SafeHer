import { PageShell } from '../layout/PageShell/PageShell';

export function MethodologyPage() {
  return (
    <PageShell
      eyebrow="Evidence"
      title="Methodology"
      description="How figures are extracted, checked and labelled."
      questions={[
        'How does a printed NCRB figure become a validated statistic?',
        'What do Verified, Incomplete and Unavailable mean?',
        'What are the known limits of registered crime data?',
      ]}
      dataNote="Not built yet. This page will document the approved validation rules and limitations."
    />
  );
}
