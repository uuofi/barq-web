import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { paths, routePatterns } from './paths';
import { env } from '@/config/env';

/**
 * The route registry — the site's table of contents.
 *
 * Every route is declared here with metadata, not just an element:
 *
 *  - `titleKey` / `descriptionKey` feed the SEO layer, so a page's meta tags
 *    are declared next to its URL instead of buried in the component.
 *  - `sitemap` decides whether the path is emitted into sitemap.xml and
 *    whether crawlers should index it (a disabled feature must not be
 *    advertised to Google).
 *  - `enabled` reads a feature flag: a route whose backend does not exist yet
 *    still resolves, but renders its unavailable state (see FeatureGate).
 *
 * Every page is `lazy()` — marketing pages are independent, and a visitor who
 * lands on /download should never download the order-tracking bundle.
 */

const HomePage = lazy(() => import('@/features/home/HomePage'));
const ContactPage = lazy(() => import('@/features/contact/ContactPage'));
const DownloadPage = lazy(() => import('@/features/download/DownloadPage'));
const TrackingPage = lazy(() => import('@/features/tracking/TrackingPage'));
const TermsPage = lazy(() => import('@/features/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/features/legal/PrivacyPage'));
const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'));

/**
 * About/Coverage/Merchants/Drivers/FAQ used to be (or, for Coverage, could
 * have been) standalone routes. They are now sections of the single
 * scrolling home page (see `AboutSection.tsx` etc., rendered from
 * `HomePage.tsx`) — but the OLD urls must not 404: any link already shared
 * or indexed still lands on the right place, just via a client-side
 * redirect to the matching anchor.
 */
const RedirectToAbout = () => <Navigate to={`${paths.home}#about`} replace />;
const RedirectToCoverage = () => <Navigate to={`${paths.home}#coverage`} replace />;
const RedirectToMerchants = () => <Navigate to={`${paths.home}#merchants`} replace />;
const RedirectToDrivers = () => <Navigate to={`${paths.home}#drivers`} replace />;
const RedirectToFaq = () => <Navigate to={`${paths.home}#faq`} replace />;

/** How a route relates to search engines. */
export interface SitemapMeta {
  /** false → excluded from sitemap.xml and marked noindex. */
  include: boolean;
  /** Relative importance, 0.0–1.0. Only meaningful when `include` is true. */
  priority?: number;
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface RouteMeta {
  path: string;
  /** i18n key for the page title, e.g. 'nav.merchants'. */
  titleKey: string;
  /** i18n key for the meta description. */
  descriptionKey?: string;
  sitemap: SitemapMeta;
  /** false → the page renders its "not available" state. */
  enabled: boolean;
  /** true → appears in the primary navigation. */
  inMainNav?: boolean;
  /** The page component — lazily loaded in every case here. */
  element: React.ComponentType | React.LazyExoticComponent<React.ComponentType>;
}

export const routeMeta: RouteMeta[] = [
  {
    path: paths.home,
    titleKey: 'nav.home',
    descriptionKey: 'seo.home.description',
    sitemap: { include: true, priority: 1.0, changeFrequency: 'weekly' },
    enabled: true,
    element: HomePage,
  },
  {
    // Now a section of `/` (see AboutSection.tsx via HomePage.tsx) — this
    // entry only exists so the old URL redirects instead of 404ing.
    path: paths.merchants,
    titleKey: 'nav.merchants',
    sitemap: { include: false },
    enabled: true,
    element: RedirectToMerchants,
  },
  {
    path: paths.drivers,
    titleKey: 'nav.drivers',
    sitemap: { include: false },
    enabled: true,
    element: RedirectToDrivers,
  },
  {
    path: paths.about,
    titleKey: 'nav.about',
    sitemap: { include: false },
    enabled: true,
    element: RedirectToAbout,
  },
  {
    // Now a section of `/` (see CoverageSection.tsx via HomePage.tsx) — this
    // entry only exists so the old URL redirects instead of 404ing.
    path: paths.coverage,
    titleKey: 'footer.coverage',
    sitemap: { include: false },
    enabled: true,
    element: RedirectToCoverage,
  },
  {
    path: paths.faq,
    titleKey: 'nav.faq',
    sitemap: { include: false },
    enabled: true,
    element: RedirectToFaq,
  },
  {
    path: paths.contact,
    titleKey: 'nav.contact',
    sitemap: { include: true, priority: 0.5, changeFrequency: 'yearly' },
    // Depends on POST /public/contact, which the backend does not expose yet.
    enabled: env.features.leadForms,
    inMainNav: true,
    element: ContactPage,
  },
  {
    path: paths.download,
    titleKey: 'nav.download',
    sitemap: { include: true, priority: 0.8, changeFrequency: 'monthly' },
    enabled: true,
    element: DownloadPage,
  },
  {
    path: paths.tracking.index,
    titleKey: 'nav.trackOrder',
    // Depends on GET /public/orders/track, not implemented on the backend yet.
    sitemap: { include: env.features.orderTracking, priority: 0.7, changeFrequency: 'monthly' },
    enabled: env.features.orderTracking,
    element: TrackingPage,
  },
  {
    path: routePatterns.trackingByCode,
    titleKey: 'nav.trackOrder',
    // A per-order result page must never be indexed: the URLs are unbounded
    // and the content is user-specific.
    sitemap: { include: false },
    enabled: env.features.orderTracking,
    element: TrackingPage,
  },
  {
    path: paths.legal.terms,
    titleKey: 'footer.terms',
    sitemap: { include: true, priority: 0.3, changeFrequency: 'yearly' },
    enabled: true,
    element: TermsPage,
  },
  {
    path: paths.legal.privacy,
    titleKey: 'footer.privacy',
    sitemap: { include: true, priority: 0.3, changeFrequency: 'yearly' },
    enabled: true,
    element: PrivacyPage,
  },
];

/** Routes shown in the header nav, in declaration order. */
export const mainNavRoutes = routeMeta.filter((route) => route.inMainNav && route.enabled);

/** Paths that belong in sitemap.xml. Consumed by scripts/generate-sitemap.ts. */
export const sitemapRoutes = routeMeta.filter(
  (route) => route.sitemap.include && route.enabled && !route.path.includes(':')
);

/** Lookup used by the SEO layer to resolve the active route's metadata. */
export const findRouteMeta = (pathname: string): RouteMeta | undefined =>
  routeMeta.find((route) => route.path === pathname);

export { NotFoundPage };
