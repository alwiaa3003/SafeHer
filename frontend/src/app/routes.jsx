import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { AppShell } from '../layout/AppShell/AppShell';
import { GeographicExplorerPage } from '../pages/GeographicExplorerPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// The Crime Map is the homepage and loads with the app. Every other page, and the chart
// library only Crime Trends and Overview use, is fetched when first visited.
const page = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));
const CrimeTrendsPage = page(() => import('../pages/CrimeTrendsPage'), 'CrimeTrendsPage');
const DataSourcesPage = page(() => import('../pages/DataSourcesPage'), 'DataSourcesPage');
const MethodologyPage = page(() => import('../pages/MethodologyPage'), 'MethodologyPage');
const OverviewPage = page(() => import('../pages/OverviewPage'), 'OverviewPage');
const CrimeCategoriesPage = page(() => import('../pages/CrimeCategoriesPage'), 'CrimeCategoriesPage');
const MetroComparisonPage = page(() => import('../pages/MetroComparisonPage'), 'MetroComparisonPage');

// Each entry matches a URL to a page. All of them render inside AppShell.
// The Crime Map fills the viewport (fullBleed) and uses the auto-hiding sidebar (autoHideNav).
export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <GeographicExplorerPage />, handle: { fullBleed: true, autoHideNav: true } },
      { path: 'crime-trends', element: <CrimeTrendsPage /> },
      { path: 'data-sources', element: <DataSourcesPage /> },
      { path: 'methodology', element: <MethodologyPage /> },
      // Not in the navigation, but kept so existing links and bookmarks still work.
      { path: 'overview', element: <OverviewPage /> },
      { path: 'crime-categories', element: <CrimeCategoriesPage /> },
      { path: 'metro-comparison', element: <MetroComparisonPage /> },
      { path: 'geographic-explorer', element: <Navigate to="/" replace /> },
      { path: 'crime-map', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
