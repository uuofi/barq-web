import { lazy } from 'react';
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
 * lands on /pricing should never download the application-wizard bundle.
 *
 * NOTE: the site used to be a single scrolling home page with About /
 * Coverage / Merchants / Drivers as anchored sections of `/`. It is now a
 * real multi-page site, matching the approved design: each of those is its
 * own route with its own hero, its own closing CTA and its own sitemap entry.
 * The old `#anchor` redirects are gone because the paths they redirected to
 * are the live pages again.
 */

const HomePage = lazy(() => import('@/features/home/HomePage'));
const AboutPage = lazy(() => import('@/features/about/AboutPage'));
const ServicesPage = lazy(() => import('@/features/services/ServicesPage'));
const MerchantsPage = lazy(() => import('@/features/merchants/MerchantsPage'));
const DriversPage = lazy(() => import('@/features/drivers/DriversPage'));
const HowItWorksPage = lazy(() => import('@/features/how-it-works/HowItWorksPage'));
const CoveragePage = lazy(() => import('@/features/coverage/CoveragePage'));
const PricingPage = lazy(() => import('@/features/pricing/PricingPage'));
const BlogPage = lazy(() => import('@/features/blog/BlogPage'));
const ContactPage = lazy(() => import('@/features/contact/ContactPage'));
const DriverApplyPage = lazy(() => import('@/features/apply/DriverApplyPage'));
const MerchantApplyPage = lazy(() => import('@/features/apply/MerchantApplyPage'));
const ApplySuccessPage = lazy(() => import('@/features/apply/ApplySuccessPage'));
const DownloadPage = lazy(() => import('@/features/download/DownloadPage'));
const TrackingPage = lazy(() => import('@/features/tracking/TrackingPage'));
const DeleteAccountPage = lazy(() => import('@/features/account/DeleteAccountPage'));
const TermsPage = lazy(() => import('@/features/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/features/legal/PrivacyPage'));
const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'));

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
    inMainNav: true,
    element: HomePage,
  },
  {
    path: paths.about,
    titleKey: 'nav.about',
    descriptionKey: 'seo.about.description',
    sitemap: { include: true, priority: 0.7, changeFrequency: 'monthly' },
    enabled: true,
    inMainNav: true,
    element: AboutPage,
  },
  {
    path: paths.services,
    titleKey: 'nav.services',
    descriptionKey: 'seo.services.description',
    sitemap: { include: true, priority: 0.9, changeFrequency: 'monthly' },
    enabled: true,
    inMainNav: true,
    element: ServicesPage,
  },
  {
    path: paths.merchants,
    titleKey: 'nav.merchants',
    descriptionKey: 'seo.merchants.description',
    sitemap: { include: true, priority: 0.9, changeFrequency: 'monthly' },
    enabled: true,
    inMainNav: true,
    element: MerchantsPage,
  },
  {
    path: paths.drivers,
    titleKey: 'nav.drivers',
    descriptionKey: 'seo.drivers.description',
    sitemap: { include: true, priority: 0.9, changeFrequency: 'monthly' },
    enabled: true,
    inMainNav: true,
    element: DriversPage,
  },
  {
    path: paths.blog,
    titleKey: 'nav.blog',
    descriptionKey: 'seo.blog.description',
    sitemap: { include: true, priority: 0.6, changeFrequency: 'weekly' },
    enabled: true,
    inMainNav: true,
    element: BlogPage,
  },
  {
    path: paths.pricing,
    titleKey: 'nav.pricing',
    descriptionKey: 'seo.pricing.description',
    sitemap: { include: true, priority: 0.8, changeFrequency: 'monthly' },
    enabled: true,
    inMainNav: true,
    element: PricingPage,
  },
  {
    path: paths.howItWorks,
    titleKey: 'nav.howItWorks',
    descriptionKey: 'seo.howItWorks.description',
    sitemap: { include: true, priority: 0.7, changeFrequency: 'monthly' },
    enabled: true,
    element: HowItWorksPage,
  },
  {
    path: paths.coverage,
    titleKey: 'nav.coverage',
    descriptionKey: 'seo.coverage.description',
    sitemap: { include: true, priority: 0.7, changeFrequency: 'monthly' },
    enabled: true,
    element: CoveragePage,
  },
  {
    path: paths.contact,
    titleKey: 'nav.contact',
    descriptionKey: 'seo.contact.description',
    sitemap: { include: true, priority: 0.5, changeFrequency: 'yearly' },
    // Depends on POST /public/contact, which the backend does not expose yet.
    enabled: env.features.leadForms,
    element: ContactPage,
  },
  {
    path: paths.apply.driver,
    titleKey: 'apply.driver.title',
    descriptionKey: 'seo.applyDriver.description',
    sitemap: { include: true, priority: 0.8, changeFrequency: 'yearly' },
    enabled: env.features.leadForms,
    element: DriverApplyPage,
  },
  {
    path: paths.apply.merchant,
    titleKey: 'apply.merchant.title',
    descriptionKey: 'seo.applyMerchant.description',
    sitemap: { include: true, priority: 0.8, changeFrequency: 'yearly' },
    enabled: env.features.leadForms,
    element: MerchantApplyPage,
  },
  {
    path: paths.apply.success,
    titleKey: 'apply.success.title',
    // A confirmation page has no standalone value in search results, and
    // indexing it would put "تم استلام طلبك" in front of people who never
    // applied. It is reachable only by finishing a funnel.
    sitemap: { include: false },
    enabled: env.features.leadForms,
    element: ApplySuccessPage,
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
    path: paths.account.delete,
    titleKey: 'account.delete.title',
    descriptionKey: 'seo.deleteAccount.description',
    // Indexed on purpose. Google Play and the App Store both require the
    // account-deletion URL to be publicly reachable and discoverable without
    // installing the app, so unlike the other utility pages this one belongs
    // in the sitemap. Low priority — it is a destination, not a landing page.
    sitemap: { include: true, priority: 0.3, changeFrequency: 'yearly' },
    // NOT feature-flagged: POST /public/account/delete is live, and a store
    // reviewer opening a flagged-off deletion page is a rejected submission.
    enabled: true,
    element: DeleteAccountPage,
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
