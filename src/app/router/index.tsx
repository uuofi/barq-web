import { Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import PageLoader from '@/components/feedback/PageLoader';
import RouteErrorBoundary from './RouteErrorBoundary';
import FeatureGate from './FeatureGate';
import { routeMeta, NotFoundPage, type RouteMeta } from './routes';

/**
 * Router construction.
 *
 * The shape is deliberately flat: one layout route wrapping every page. A
 * marketing site has no nested dashboards, and inventing nesting it doesn't
 * need only makes `<Outlet />` chains harder to follow.
 *
 * Three cross-cutting concerns are attached HERE rather than inside pages, so
 * no page can forget one:
 *   1. `errorElement` — a thrown render/loader error shows the error page
 *      instead of a white screen.
 *   2. `<Suspense>` — every page is lazy; this is the shared fallback.
 *   3. `<FeatureGate>` — a flagged-off route renders its unavailable state.
 */

const withPageChrome = (route: RouteMeta): RouteObject => {
  const Component = route.element as React.ComponentType;
  return {
    path: route.path,
    element: (
      <Suspense fallback={<PageLoader />}>
        <FeatureGate enabled={route.enabled}>
          <Component />
        </FeatureGate>
      </Suspense>
    ),
  };
};

export const routeObjects: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...routeMeta.map(withPageChrome),
      {
        // Catch-all. Must stay last: react-router matches by specificity, but
        // keeping the order explicit makes the intent readable.
        path: '*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
];

export const router = createBrowserRouter(routeObjects);

export default router;
