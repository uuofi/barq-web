/**
 * Domain constants shared across the site.
 *
 * IMPORTANT: values here MIRROR the backend's own source of truth
 * (`delivery-backend/src/constants/governorates.js`, the Order status enum).
 * They are duplicated because this is a separate deployable with no shared
 * package — so any change on the backend MUST be reflected here. The
 * compile-time `satisfies`/union types below make a drift show up as a type
 * error the moment a value is used, rather than as a blank page in production.
 */

/* -------------------------------------------------------------------------- */
/* Governorates — mirrors delivery-backend/src/constants/governorates.js       */
/* -------------------------------------------------------------------------- */

export const GOVERNORATES = ['diwaniyah', 'najaf', 'muthanna'] as const;

export type Governorate = (typeof GOVERNORATES)[number];

export const GOVERNORATE_LABELS: Record<Governorate, string> = {
  diwaniyah: 'الديوانية',
  najaf: 'النجف',
  muthanna: 'المثنى - السماوة',
};

export const isGovernorate = (value: unknown): value is Governorate =>
  typeof value === 'string' && (GOVERNORATES as readonly string[]).includes(value);

/* -------------------------------------------------------------------------- */
/* Roles — the two account types the public site can send a visitor toward     */
/* -------------------------------------------------------------------------- */

export const PUBLIC_ROLES = ['merchant', 'driver'] as const;

export type PublicRole = (typeof PUBLIC_ROLES)[number];

export const ROLE_LABELS: Record<PublicRole, string> = {
  merchant: 'تاجر',
  driver: 'سائق',
};

/* -------------------------------------------------------------------------- */
/* Order status — mirrors the Order model's status enum on the backend.        */
/* Needed by the public tracking page; the site never WRITES a status.         */
/* -------------------------------------------------------------------------- */

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'picked_up',
  'on_the_way',
  'delivered',
  'cancelled',
  'failed',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses that mean the order is still moving. */
export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'accepted',
  'picked_up',
  'on_the_way',
];

/** Statuses that mean the order ended without a delivery. */
export const NEGATIVE_ORDER_STATUSES: readonly OrderStatus[] = ['cancelled', 'failed'];

/* -------------------------------------------------------------------------- */
/* Misc                                                                        */
/* -------------------------------------------------------------------------- */

/** Currency the platform settles in. Formatting lives in lib/utils/format.ts. */
export const DEFAULT_CURRENCY = 'IQD' as const;

/** Iraqi mobile format accepted by the backend's validators (07xxxxxxxxx). */
export const PHONE_PATTERN = /^07\d{9}$/;

/** localStorage keys, namespaced so the three Al-Barq web apps never collide. */
export const STORAGE_KEYS = {
  language: 'albarq.site.lang',
  cookieConsent: 'albarq.site.consent',
} as const;
