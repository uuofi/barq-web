import { QueryClient } from '@tanstack/react-query';
import { RequestError } from '@/lib/http/RequestError';
import { logger } from '@/lib/logger';

/**
 * React Query defaults tuned for a marketing site.
 *
 * A public site is read-mostly and its data barely changes, so the defaults
 * here are far more conservative than a dashboard's: long staleness, no
 * refetch on window focus (a visitor tabbing back should not trigger a burst
 * of requests), and a retry policy that consults `RequestError.isRetryable`
 * so a 404 on an order code never gets hammered three times.
 */

const MINUTE = 60 * 1000;
const MAX_RETRIES = 2;

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= MAX_RETRIES) return false;
  if (RequestError.is(error)) return error.isRetryable;
  return false; // Unknown error class → don't guess, don't retry.
};

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * MINUTE,
        gcTime: 30 * MINUTE,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: shouldRetry,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: {
        // Form submissions are not idempotent — one automatic retry only, and
        // only when the request never reached the server.
        retry: (failureCount, error) =>
          failureCount < 1 && RequestError.is(error) && error.isNetworkError,
        onError: (error) => {
          logger.error('Mutation failed', error);
        },
      },
    },
  });

/**
 * A single app-wide instance. Created here (not inside a component) so it
 * survives React Fast Refresh in dev without dropping the cache.
 */
export const queryClient = createQueryClient();

export default queryClient;
