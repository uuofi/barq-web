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
  services: '/services',
  howItWorks: '/how-it-works',
  /** "المدن التي نخدمها" — the served-cities page. */
  coverage: '/coverage',
  pricing: '/pricing',
  blog: '/blog',
  faq: '/faq',
  contact: '/contact',

  /**
   * The two application funnels. Each is a single route that owns its own
   * step state rather than a route per step: a half-filled application is not
   * a shareable, bookmarkable, or reloadable destination, and giving each
   * step a URL would promise exactly that and then lose the data on refresh.
   */
  apply: {
    driver: '/apply/driver',
    merchant: '/apply/merchant',
    /** Terminal confirmation, reachable only by completing a funnel. */
    success: '/apply/success',
  },

  download: '/download',

  tracking: {
    index: '/track',
    /** /track/AB1234 — the code is uppercased and URL-encoded here, once. */
    byCode: (code: string) => `/track/${encodeURIComponent(code.trim().toUpperCase())}`,
  },

  account: {
    /**
     * Self-service account deletion. The app links here from both settings
     * screens, and Google Play / the App Store require this URL to be
     * reachable WITHOUT installing the app — so it must stay a stable,
     * top-level, publicly crawlable path. Do not move it lightly.
     */
    delete: '/account/delete',
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
