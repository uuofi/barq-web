import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { site } from '@/config/site';
import { absoluteUrl, canonicalPath } from '@/lib/utils/url';
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n';

/**
 * Declarative document-head management, dependency-free.
 *
 * Why not react-helmet-async: this site needs exactly one head owner per
 * route (no nested overrides, no SSR streaming), and Helmet's async context
 * plus its maintenance status buy nothing here. ~90 lines of direct DOM
 * mutation is easier to reason about and has zero bundle cost.
 *
 * Contract: exactly ONE <Seo /> per page, rendered at the top of the page
 * component. Every tag it writes is marked `data-seo` so a subsequent render
 * can clean up precisely what it owns and never fight the static tags in
 * index.html.
 */

export interface SeoProps {
  /** Page title, already translated. Combined with the site name. */
  title: string;
  description?: string;
  /** Absolute URL or a path; defaults to the current location. */
  canonical?: string;
  /** Path or absolute URL of the social preview image. */
  image?: string;
  /** 'website' for pages, 'article' for blog/legal content. */
  type?: 'website' | 'article';
  /** true → <meta name="robots" content="noindex, nofollow">. */
  noIndex?: boolean;
  /** JSON-LD objects to embed. Build them with lib/seo/schema.ts. */
  jsonLd?: Record<string, unknown>[];
}

const SEO_ATTRIBUTE = 'data-seo';

/** Creates or updates a <meta> tag, tagged as ours. */
const setMeta = (identifier: { name?: string; property?: string }, content: string): void => {
  const selector = identifier.name
    ? `meta[name="${identifier.name}"]`
    : `meta[property="${identifier.property}"]`;

  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    if (identifier.name) element.setAttribute('name', identifier.name);
    if (identifier.property) element.setAttribute('property', identifier.property);
    element.setAttribute(SEO_ATTRIBUTE, 'true');
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setLink = (rel: string, href: string, hrefLang?: string): void => {
  const selector = hrefLang
    ? `link[rel="${rel}"][hreflang="${hrefLang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;

  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    if (hrefLang) element.setAttribute('hreflang', hrefLang);
    element.setAttribute(SEO_ATTRIBUTE, 'true');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

/** Replaces all JSON-LD blocks this component owns. */
const setJsonLd = (blocks: Record<string, unknown>[]): void => {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${SEO_ATTRIBUTE}]`)
    .forEach((node) => node.remove());

  blocks.forEach((block) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(SEO_ATTRIBUTE, 'true');
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  });
};

export const Seo = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  noIndex = false,
  jsonLd = [],
}: SeoProps) => {
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const language = i18n.language as Language;

  const resolvedDescription = description ?? (language === 'en' ? site.descriptionEn : site.description);
  const resolvedCanonical = absoluteUrl(canonical ?? canonicalPath(location.pathname));
  const resolvedImage = absoluteUrl(image ?? site.ogImage);
  const fullTitle = t('seo.titleTemplate', { title });

  useEffect(() => {
    document.title = fullTitle;

    setMeta({ name: 'description' }, resolvedDescription);
    setMeta({ name: 'robots' }, noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph — what Facebook/WhatsApp/Telegram read when a link is shared.
    setMeta({ property: 'og:site_name' }, site.name);
    setMeta({ property: 'og:title' }, fullTitle);
    setMeta({ property: 'og:description' }, resolvedDescription);
    setMeta({ property: 'og:url' }, resolvedCanonical);
    setMeta({ property: 'og:image' }, resolvedImage);
    setMeta({ property: 'og:type' }, type);
    setMeta({ property: 'og:locale' }, site.locale.tags[language] ?? site.locale.tags.ar);

    // Twitter/X uses its own namespace and falls back to OG only partially.
    setMeta({ name: 'twitter:card' }, 'summary_large_image');
    setMeta({ name: 'twitter:title' }, fullTitle);
    setMeta({ name: 'twitter:description' }, resolvedDescription);
    setMeta({ name: 'twitter:image' }, resolvedImage);

    setLink('canonical', resolvedCanonical);

    // hreflang: tells crawlers these are translations of one page, not
    // duplicate content competing with each other.
    SUPPORTED_LANGUAGES.forEach((lang) => {
      setLink('alternate', `${resolvedCanonical}?lang=${lang}`, lang);
    });
    setLink('alternate', resolvedCanonical, 'x-default');

    setJsonLd(jsonLd);
  }, [fullTitle, resolvedDescription, resolvedCanonical, resolvedImage, type, noIndex, language, jsonLd]);

  return null;
};

export default Seo;
