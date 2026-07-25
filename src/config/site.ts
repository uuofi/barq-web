import { env } from './env';

/**
 * Static identity of the brand — the single source of truth for anything a
 * page, a meta tag, or a JSON-LD block needs to say ABOUT the company.
 *
 * Distinction from `env.ts`: env holds values that change per deployment
 * (origins, keys, flags). This file holds values that are the same in every
 * environment (the brand name, the tagline, the social handles). Neither
 * belongs in a component.
 */
export const site = {
  /** The wordmark as it actually appears on brand assets (jacket, delivery box, logo lockup). */
  name: 'البرق',
  nameEn: 'Al-Barq',
  legalName: 'شركة البرق للتوصيل',

  /** Matches `common.appTagline` in the mobile app. */
  tagline: 'سريع. آمن. موثوق',
  taglineEn: 'Fast. Safe. Reliable',

  description:
    'منصة برق للتوصيل داخل العراق — اطلب سائقاً لمتجرك، تابع طلباتك لحظة بلحظة، وأدر أرباحك من مكان واحد.',
  descriptionEn:
    'Al-Barq delivery platform in Iraq — request a driver for your store, track orders in real time, and manage your earnings from one place.',

  url: env.siteUrl,

  /**
   * Default social preview image, resolved against `site.url` by the SEO
   * layer. 1200×630 is the size every major crawler crops from.
   */
  ogImage: '/og/default.png',

  locale: {
    default: 'ar' as const,
    supported: ['ar', 'en'] as const,
    /** BCP-47 tags for hreflang / og:locale. */
    tags: { ar: 'ar_IQ', en: 'en_US' } as const,
  },

  /** Rendered only when the matching env value is present. */
  contact: {
    phone: env.contact.phone,
    email: env.contact.email,
    whatsapp: env.contact.whatsapp,
  },

  social: {
    facebook: '',
    instagram: '',
    x: '',
    telegram: '',
  },

  /** Country/region the business operates in — used by LocalBusiness JSON-LD. */
  address: {
    country: 'IQ',
    countryName: 'العراق',
    region: 'الديوانية',
  },
} as const;

export type Site = typeof site;

export default site;
