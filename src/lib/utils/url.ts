import { env } from '@/config/env';

/**
 * URL helpers for the SEO layer.
 *
 * Canonical/OG tags must always carry an ABSOLUTE url on the site's own
 * origin. Building those by string concatenation at each call site is how you
 * end up with `https://barq-iq.site//about` or a canonical pointing at
 * localhost in production — so it happens here, once.
 */

/** '/about' → 'https://barq-iq.site/about'. Absolute input is returned as-is. */
export const absoluteUrl = (pathOrUrl: string): string => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${env.siteUrl}${path}`;
};

/**
 * Strips the query string and trailing slash from a pathname.
 * Canonical URLs must be stable: `/about`, `/about/`, and `/about?utm=x` are
 * one page, and telling a crawler otherwise splits its ranking three ways.
 */
export const canonicalPath = (pathname: string): string => {
  const withoutQuery = pathname.split(/[?#]/)[0] ?? '/';
  if (withoutQuery === '/') return '/';
  return withoutQuery.replace(/\/+$/, '');
};

/** True for a link that leaves this site (needs rel="noopener noreferrer"). */
export const isExternalUrl = (url: string): boolean => {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    return new URL(url).origin !== new URL(env.siteUrl).origin;
  } catch {
    return true;
  }
};

/** `tel:` href from a raw phone number, stripping display formatting. */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** `https://wa.me/...` link. Number must be international, digits only. */
export const whatsappHref = (number: string, message?: string): string => {
  const normalised = number.replace(/[^\d]/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalised}${query}`;
};
