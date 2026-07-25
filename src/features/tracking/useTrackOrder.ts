import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { RequestError } from '@/lib/http/RequestError';
import { env } from '@/config/env';
import { trackingApi } from './tracking.api';
import { trackingCodeSchema, type PublicOrder } from './tracking.schema';

/**
 * Order lookup, as a hook.
 *
 * The page never calls `trackingApi` directly — this layer owns the caching
 * policy, and three decisions live here rather than being repeated per page:
 *
 *  - `enabled`: no request fires for a code that fails client-side validation,
 *    or at all while the feature flag is off. A guessed/short code costs zero
 *    requests.
 *  - `retry: false` on a 404: an order code that doesn't exist won't start
 *    existing on the second attempt, and retrying would look like a probe.
 *  - `staleTime` is short here (unlike the site default) because an in-flight
 *    order genuinely changes state minute to minute.
 */

const TRACKING_STALE_TIME = 30_000;

export interface UseTrackOrderResult {
  order: PublicOrder | undefined;
  isLoading: boolean;
  error: unknown;
  /** True when the lookup completed and the code matched nothing. */
  notFound: boolean;
  refetch: () => void;
}

export const useTrackOrder = (code: string | undefined): UseTrackOrderResult => {
  const parsed = code ? trackingCodeSchema.safeParse(code) : null;
  const validCode = parsed?.success ? parsed.data : undefined;

  const query = useQuery({
    queryKey: queryKeys.tracking.byCode(validCode ?? ''),
    queryFn: ({ signal }) => trackingApi.getByCode(validCode as string, signal),
    enabled: Boolean(validCode) && env.features.orderTracking,
    staleTime: TRACKING_STALE_TIME,
    retry: (failureCount, error) => {
      if (RequestError.is(error) && (error.isNotFound || error.isClientError)) return false;
      return failureCount < 1;
    },
  });

  return {
    order: query.data,
    isLoading: query.isLoading && query.isFetching,
    error: query.error,
    notFound: RequestError.is(query.error) && query.error.isNotFound,
    refetch: () => void query.refetch(),
  };
};

export default useTrackOrder;
