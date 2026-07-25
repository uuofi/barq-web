/**
 * Build/dev configuration for the public marketing site.
 *
 * Two deliberate choices worth keeping:
 *
 * 1. `server.proxy` forwards /api to the backend in dev so the browser talks to
 *    a single origin and never trips CORS while developing. In production the
 *    site points straight at VITE_API_BASE_URL (see src/config/env.ts).
 *
 * 2. `manualChunks` splits the vendor bundle by concern. A marketing site is
 *    judged on first paint, so React/router/data-layer are cached separately
 *    from page code — a content edit must not invalidate the vendor chunk.
 */
declare const _default: import("vite").UserConfig;
export default _default;
