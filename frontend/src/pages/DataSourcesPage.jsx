import { PageShell } from '../layout/PageShell/PageShell';

export function DataSourcesPage() {
  return (
    <PageShell
      eyebrow="Evidence"
      title="Data Sources"
      description="Every publication and dataset behind SafeHer."
      questions={[
        'Which NCRB editions, tables and pages does each figure come from?',
        'What is the licence and permission status of each dataset?',
      ]}
      dataNote="Not built yet. Blocked and unverified datasets will be listed with their status and will not feed any analysis."
    />
  );
}
