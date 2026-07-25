import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/utils/url';

/**
 * JSON-LD structured data builders (schema.org).
 *
 * This is what makes a search result show a logo, a rating, an FAQ accordion,
 * or a breadcrumb trail instead of a bare blue link. Kept as pure builder
 * functions — no React, no side effects — so they are trivially testable and
 * can be reused by a future prerender/SSG step.
 *
 * Pass the result to `<Seo jsonLd={[...]} />`.
 */

type JsonLd = Record<string, unknown>;

/** The company itself. Belongs on the home page only. */
export const organizationSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  alternateName: site.nameEn,
  legalName: site.legalName,
  url: site.url,
  logo: absoluteUrl('/logo.png'),
  description: site.description,
  address: {
    '@type': 'PostalAddress',
    addressCountry: site.address.country,
    addressRegion: site.address.region,
  },
  ...(site.contact.phone
    ? {
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: site.contact.phone,
          contactType: 'customer service',
          areaServed: site.address.country,
          availableLanguage: ['ar', 'en'],
        },
      }
    : {}),
  sameAs: Object.values(site.social).filter(Boolean),
});

/** Enables the sitelinks search box in Google results. */
export const websiteSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: site.url,
  inLanguage: site.locale.default,
});

/**
 * The delivery service as an offering. Use on the merchants/drivers pages.
 */
export const serviceSchema = (params: {
  name: string;
  description: string;
  areaServed: string[];
}): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Delivery service',
  name: params.name,
  description: params.description,
  provider: { '@type': 'Organization', name: site.name, url: site.url },
  areaServed: params.areaServed.map((area) => ({ '@type': 'Place', name: area })),
});

/**
 * Breadcrumb trail. `items` must be ordered root → current page.
 * Emit on every page except the home page.
 */
export const breadcrumbSchema = (items: { name: string; path: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

/** Renders an expandable FAQ block directly in the search result. */
export const faqSchema = (entries: { question: string; answer: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: entries.map((entry) => ({
    '@type': 'Question',
    name: entry.question,
    acceptedAnswer: { '@type': 'Answer', text: entry.answer },
  })),
});

/** The mobile app, for the download page. */
export const mobileAppSchema = (params: {
  operatingSystem: 'iOS' | 'ANDROID';
  downloadUrl: string;
}): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: site.name,
  applicationCategory: 'BusinessApplication',
  operatingSystem: params.operatingSystem,
  downloadUrl: params.downloadUrl,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IQD' },
});
