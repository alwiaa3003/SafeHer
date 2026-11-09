import { Link } from 'react-router-dom';
import { PageHeader } from '../layout/PageHeader/PageHeader';

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="Page not found"
        description="This address does not match a page in SafeHer."
      />
      <Link to="/">Return to Overview</Link>
    </>
  );
}
