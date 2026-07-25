/**
 * The single source of truth for every URL on this site.
 *
 * Nothing — not a <Link>, not a redirect, not the sitemap generator — may
 * hardcode a path string. Changing a URL then means editing one line here,
 * and TypeScript points at every place that must move with it.
 *
 * Functions (rather than plain strings) are used wherever a path takes a
 * parameter, so callers cannot forget to encode it.
 */

export const paths = {
  home: '/',

  merchants: '/merchants',
  drivers: '/drivers',

  about: '/about',
  coverage: '/coverage',
  faq: '/faq',
  contact: '/contact',

  download: '/download',

  tracking: {
    index: '/track',
    /** /track/AB1234 — the code is uppercased and URL-encoded here, once. */
    byCode: (code: string) => `/track/${encodeURIComponent(code.trim().toUpperCase())}`,
  },

  legal: {
    terms: '/legal/terms',
    privacy: '/legal/privacy',
  },

  notFound: '/404',
} as const;

/** Route pattern strings for react-router (`:param` placeholders). */
export const routePatterns = {
  trackingByCode: '/track/:code',
} as const;

export default paths;
