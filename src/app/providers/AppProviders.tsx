import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { queryClient } from '@/lib/queryClient';
import i18n from '@/i18n';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import ConsentProvider from './ConsentProvider';

/**
 * The composition root — every cross-cutting provider, in one ordered place.
 *
 * Order matters and is not arbitrary:
 *
 *   ErrorBoundary       outermost, so a crash inside ANY provider is still
 *                       caught and rendered as an error state, not a blank page
 *     I18nextProvider   translations must exist before anything renders text —
 *                       including the error boundary's own fallback copy
 *       QueryClient     data layer
 *         Consent       reads i18n for its banner copy, and gates analytics,
 *                       so it must sit inside i18n and outside the router
 *
 * Nothing here knows about routing: the router is mounted by App.tsx *inside*
 * these providers. That keeps this file reusable by tests, which render a
 * single component under the same providers without a router.
 */

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <ErrorBoundary>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ConsentProvider>{children}</ConsentProvider>
      </QueryClientProvider>
    </I18nextProvider>
  </ErrorBoundary>
);

export default AppProviders;
