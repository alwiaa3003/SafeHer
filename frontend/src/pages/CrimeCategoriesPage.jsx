import { PageShell } from '../layout/PageShell/PageShell';

export function CrimeCategoriesPage() {
  return (
    <PageShell
      eyebrow="Analysis"
      title="Crime Categories"
      description="How NCRB classifies registered crimes against women."
      questions={[
        'What makes up the registered total in each covered year?',
        'Which categories can fairly be compared across the IPC and BNS?',
      ]}
      dataNote="Not built yet. The first release covers 2018 and 2022–2024, with original NCRB labels kept beside normalised ones."
    />
  );
}
