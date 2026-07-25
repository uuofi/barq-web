/**
 * Shared API shapes that are not owned by a single feature.
 *
 * Feature-specific types are NOT here — they live with their feature and are
 * inferred from that feature's Zod schema (see
 * features/tracking/tracking.schema.ts). This file only holds the envelope
 * and pagination shapes the backend applies uniformly, mirrored from
 * `delivery-backend/src/utils` (sendSuccess / ApiError).
 */

/** Success envelope. `request()` in lib/http/apiClient.ts unwraps this. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  message?: string;
  errors?: { field: string; message: string }[];
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Backend pagination meta, as returned by the list endpoints. */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Geo point, in the [lng, lat] order MongoDB/GeoJSON uses. */
export type GeoPoint = [longitude: number, latitude: number];

/** A value that may still be loading. Useful for non-Query async state. */
export type Maybe<T> = T | null | undefined;
