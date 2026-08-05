/**
 * Every backend path the public site may call, in one place.
 *
 * Two reasons this file exists instead of inline strings:
 *
 * 1. A path typo becomes a compile error at the call site, not a 404 at
 *    runtime.
 * 2. It documents the ACTUAL state of the backend contract. The Al-Barq API
 *    today (delivery-backend/src/routes/index.js) exposes only:
 *        /health, /auth/*, /merchant/*, /driver/*, /admin/*, /notifications/*
 *    — all of which except /health and /auth require an authenticated role.
 *    A public marketing site has no session, so the endpoints it needs
 *    (order tracking, lead capture) DO NOT EXIST YET.
 *
 * They are declared here anyway, marked `planned`, and every feature that
 * consumes one sits behind a feature flag in src/config/env.ts. That way the
 * frontend is complete and the missing half is explicit rather than
 * discovered when someone clicks the button.
 */

/** Status of a path against the backend as it exists today. */
export type EndpointStatus = 'live' | 'planned';

export interface EndpointMeta {
  path: string;
  status: EndpointStatus;
  /** Why it is not live yet / what must be built on the backend. */
  note?: string;
}

const meta = <T extends Record<string, EndpointMeta>>(value: T): T => value;

/**
 * Descriptive registry — read this to know what is real. The `endpoints`
 * object below is the ergonomic accessor used by feature API modules.
 */
export const ENDPOINT_REGISTRY = meta({
  health: {
    path: '/health',
    status: 'live',
  },

  trackOrder: {
    path: '/public/orders/track',
    status: 'planned',
    note:
      'Needs a public, unauthenticated GET on the backend that resolves an order by its short code ' +
      'and returns ONLY non-sensitive fields (code, status, timestamps, governorate) — never the ' +
      'customer phone/address or the driver identity. Gate behind VITE_FEATURE_ORDER_TRACKING.',
  },

  submitLead: {
    path: '/public/leads',
    status: 'planned',
    note:
      'Needs POST /public/leads on the backend (merchant/driver signup interest) with its own ' +
      'rate limiter and spam protection, writing to a Lead collection — NOT to User. ' +
      'Gate behind VITE_FEATURE_LEAD_FORMS.',
  },

  submitContact: {
    path: '/public/contact',
    status: 'planned',
    note: 'Needs POST /public/contact with a rate limiter. Gate behind VITE_FEATURE_LEAD_FORMS.',
  },

  deleteAccount: {
    path: '/public/account/delete',
    status: 'live',
    note:
      'The one public WRITE this site performs, and the only place it sends a password. Identity is ' +
      'proven with phone + password (there is no session here); the backend soft-deletes immediately ' +
      'and scrubs the personal data after a grace period — see ' +
      'delivery-backend/src/services/accountDeletion.service.js. Throttled server-side to 5 attempts ' +
      'per IP per hour, so no client-side retry loop belongs on top of it. NOT feature-flagged: the ' +
      'app stores require this page to work unconditionally.',
  },
});

export type EndpointKey = keyof typeof ENDPOINT_REGISTRY;

/** `endpoints.trackOrder` → '/public/orders/track' */
export const endpoints = Object.fromEntries(
  Object.entries(ENDPOINT_REGISTRY).map(([key, value]) => [key, value.path])
) as Record<EndpointKey, string>;

/** True when the backend actually implements this path today. */
export const isEndpointLive = (key: EndpointKey): boolean =>
  ENDPOINT_REGISTRY[key].status === 'live';

export default endpoints;
