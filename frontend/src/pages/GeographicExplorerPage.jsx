import { PageShell } from '../layout/PageShell/PageShell';

export function GeographicExplorerPage() {
  return (
    <PageShell
      eyebrow="Geography"
      title="Geographic Explorer"
      description="Delhi's geographic context, limited to what licensed data supports."
      questions={[
        'What geographic context can be shown under a clear licence?',
        'Which geographic questions can the available data not answer?',
      ]}
      dataNote="Not built yet. Official sources do not publish street-level locations for these crimes, so this page will not show any."
    />
  );
}
