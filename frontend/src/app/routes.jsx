import { AppShell } from '../layout/AppShell/AppShell';
import { CrimeCategoriesPage } from '../pages/CrimeCategoriesPage';
import { CrimeTrendsPage } from '../pages/CrimeTrendsPage';
import { DataSourcesPage } from '../pages/DataSourcesPage';
import { GeographicExplorerPage } from '../pages/GeographicExplorerPage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { MetroComparisonPage } from '../pages/MetroComparisonPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { OverviewPage } from '../pages/OverviewPage';

// Each entry matches a URL to a page. All of them render inside AppShell,
// which is why the sidebar stays in place when the page changes.
export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'crime-trends', element: <CrimeTrendsPage /> },
      { path: 'crime-categories', element: <CrimeCategoriesPage /> },
      { path: 'metro-comparison', element: <MetroComparisonPage /> },
      { path: 'geographic-explorer', element: <GeographicExplorerPage /> },
      { path: 'data-sources', element: <DataSourcesPage /> },
      { path: 'methodology', element: <MethodologyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
