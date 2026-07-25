import { RouterProvider } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import { router } from '@/app/router';

/**
 * Application root.
 *
 * Kept deliberately empty of logic: providers live in AppProviders, routes in
 * app/router. Anything added here would be a cross-cutting concern that
 * belongs in one of those two, and putting it here instead is how app shells
 * turn into 300-line junk drawers.
 */
export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

export default App;
