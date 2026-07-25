import { http } from '@/lib/http/apiClient';
import { endpoints } from '@/lib/http/endpoints';
import { publicOrderSchema, type PublicOrder } from './tracking.schema';

/**
 * Transport for the tracking feature — the ONLY module allowed to name a URL
 * for this slice.
 *
 * Everything above it (hook, page) deals in `PublicOrder`, so replacing the
 * endpoint, changing the envelope, or moving to a different backend touches
 * this file alone.
 *
 * ⚠️ The endpoint is `planned`, not `live` — see src/lib/http/endpoints.ts.
 * Calls fail with a 404 until the backend ships it, which is exactly why the
 * whole route sits behind VITE_FEATURE_ORDER_TRACKING.
 */
export const trackingApi = {
  /**
   * Looks up an order by its short public code.
   * @throws RequestError — `.isNotFound` when the code doesn't exist.
   */
  getByCode: (code: string, signal?: AbortSignal): Promise<PublicOrder> =>
    http.get(endpoints.trackOrder, publicOrderSchema, {
      params: { code },
      ...(signal ? { signal } : {}),
    }),
};

export default trackingApi;
