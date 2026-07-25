/**
 * The ONE error shape the UI is allowed to see.
 *
 * Axios throws three structurally different things (a response error, a
 * network error, a cancellation) and the backend has its own `{ success:
 * false, message, errors }` envelope. Without normalisation every component
 * would have to know all four shapes. `apiClient` converts all of them into
 * this class, so a component only ever asks: is it retryable? which field
 * failed?
 */

export interface FieldError {
  field: string;
  message: string;
}

/** Mirrors the backend's failure envelope (ApiError → sendError). */
export interface ApiFailurePayload {
  success: false;
  message?: string;
  errors?: FieldError[];
  code?: string;
}

/** `status: 0` is reserved for "the request never reached the server". */
export const NETWORK_ERROR_STATUS = 0;

export class RequestError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldError[];
  readonly code: string | undefined;

  constructor(
    message: string,
    status: number,
    fieldErrors: FieldError[] = [],
    code?: string
  ) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;

    // Keeps `instanceof RequestError` working when the class is transpiled
    // down to ES5 by a consumer toolchain.
    Object.setPrototypeOf(this, RequestError.prototype);
  }

  /** The request never got a response (offline, DNS, CORS, timeout). */
  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }

  /** Caller's fault — retrying the identical request will not help. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** Server's fault — a retry is meaningful. */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Backend rate limiter (auth routes, order-request cooldown). */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /**
   * Whether an automatic retry is worth attempting. Used by the React Query
   * default retry policy in lib/queryClient.ts — keep the rule here so both
   * queries and mutations answer it the same way.
   */
  get isRetryable(): boolean {
    return this.isNetworkError || this.isServerError;
  }

  /** Field message for a form input, if the backend flagged that field. */
  messageFor(field: string): string | undefined {
    return this.fieldErrors.find((e) => e.field === field)?.message;
  }

  static is(value: unknown): value is RequestError {
    return value instanceof RequestError;
  }
}

export default RequestError;
