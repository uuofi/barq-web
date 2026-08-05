import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { z, type ZodType, type ZodTypeDef } from 'zod';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { RequestError, NETWORK_ERROR_STATUS, type ApiFailurePayload } from './RequestError';

/**
 * The site's single HTTP client.
 *
 * Design notes:
 *
 * - NO auth interceptor. This is a public site: it holds no token and must
 *   never send credentials. If a page ever needs a session, it belongs in
 *   delivery-admin or the mobile app, not here.
 *
 * - Every response is unwrapped from the backend's `{ success, data }`
 *   envelope AND validated against a Zod schema at the boundary
 *   (`request()` below). An API that changes shape then fails loudly at the
 *   one place that talks to it, instead of rendering `undefined` three
 *   components deep.
 */

const REQUEST_TIMEOUT_MS = 15_000;

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailurePayload>) => {
    // A response came back with a non-2xx status.
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject(
        new RequestError(
          data?.message || 'حدث خطأ أثناء تنفيذ الطلب',
          status,
          data?.errors ?? [],
          data?.code,
          data?.details
        )
      );
    }

    // Request was cancelled (component unmounted, query superseded). Keep the
    // native shape so React Query can tell a cancellation from a failure.
    if (axios.isCancel(error)) return Promise.reject(error);

    // No response at all: offline, DNS failure, CORS rejection, timeout.
    const isTimeout = error.code === 'ECONNABORTED';
    return Promise.reject(
      new RequestError(
        isTimeout ? 'انتهت مهلة الاتصال بالخادم' : 'تعذّر الاتصال بالخادم',
        NETWORK_ERROR_STATUS,
        [],
        error.code
      )
    );
  }
);

/**
 * The `{ success, data }` wrapper every Al-Barq endpoint responds with.
 * `data` is left as `unknown` here and validated separately below, so a
 * schema failure can say WHICH half was wrong.
 */
const envelopeSchema = z.object({
  success: z.literal(true).optional(),
  data: z.unknown(),
});

/**
 * A schema whose INPUT is unknown and whose OUTPUT is `T`.
 *
 * The third type parameter matters: plain `ZodType<T>` pins input and output
 * to the same type, which breaks any schema using `.default()` or
 * `.transform()` — TypeScript then infers `T` from the pre-parse shape and
 * the call site gets the wrong return type.
 */
type OutputSchema<T> = ZodType<T, ZodTypeDef, unknown>;

/**
 * Performs a request and returns the validated `data` payload.
 *
 * @param schema Zod schema for the CONTENTS of the envelope's `data` field.
 *
 * @throws RequestError — for transport/HTTP failures (normalised above) and
 *         for a payload that does not match `schema` (status 0, so it is
 *         reported as a connectivity-class problem to the user while the real
 *         cause is logged for developers).
 */
export async function request<T>(
  config: AxiosRequestConfig,
  schema: OutputSchema<T>
): Promise<T> {
  const response = await apiClient.request<unknown>(config);

  const envelope = envelopeSchema.safeParse(response.data);
  if (!envelope.success) {
    logger.error('API response is not a { success, data } envelope', {
      url: config.url,
      method: config.method,
      issues: envelope.error.issues,
    });
    throw new RequestError('استجابة غير متوقعة من الخادم', NETWORK_ERROR_STATUS, [], 'BAD_ENVELOPE');
  }

  const parsed = schema.safeParse(envelope.data.data);
  if (!parsed.success) {
    logger.error('API payload failed schema validation', {
      url: config.url,
      method: config.method,
      issues: parsed.error.issues,
    });
    throw new RequestError('استجابة غير متوقعة من الخادم', NETWORK_ERROR_STATUS, [], 'SCHEMA_MISMATCH');
  }

  return parsed.data;
}

/** Convenience wrappers. Prefer these over touching `apiClient` directly. */
export const http = {
  get: <T>(url: string, schema: OutputSchema<T>, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, method: 'GET' }, schema),

  post: <T>(url: string, body: unknown, schema: OutputSchema<T>, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, method: 'POST', data: body }, schema),
};

export default apiClient;
