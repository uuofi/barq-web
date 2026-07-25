import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import { routeObjects } from '@/app/router';
import { routeMeta, mainNavRoutes, sitemapRoutes } from '@/app/router/routes';
import { paths } from '@/app/router/paths';
import { RequestError } from '@/lib/http/RequestError';
import { canonicalPath, absoluteUrl, isExternalUrl } from '@/lib/utils/url';
import { trackingCodeSchema } from '@/features/tracking/tracking.schema';
import { contactFormSchema } from '@/features/contact/contact.schema';

/**
 * Smoke tests for the architecture itself, not for any page's content.
 *
 * These guard the invariants the structure depends on: routes resolve, the
 * registry stays consistent with itself, errors classify correctly, and the
 * SEO/URL helpers produce canonical output. A page's copy can change freely
 * without touching this file — which is the point.
 */

const renderAt = (initialPath: string) => {
  const router = createMemoryRouter(routeObjects, { initialEntries: [initialPath] });
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

describe('routing', () => {
  it('renders the home page through the full provider stack', async () => {
    renderAt(paths.home);
    // Longer timeout: Home now inlines the About/Merchants/Drivers/FAQ
    // sections too (see HomePage.tsx), so first paint has noticeably more
    // to render than the default 1000ms budget comfortably covers.
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it('renders the 404 page for an unknown path', async () => {
    renderAt('/this-route-does-not-exist');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'الصفحة غير موجودة' })).toBeInTheDocument()
    );
  });

  it('sets the document title from the page SEO layer', async () => {
    renderAt(paths.home);
    await waitFor(() => expect(document.title).toContain('برق'));
  });

  it('writes a canonical link tag', async () => {
    renderAt(paths.home);
    await waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBeTruthy();
    });
  });

  // Not covered here: /about (and /merchants, /drivers, /faq) redirecting to
  // their home-page anchor. `<Navigate>` triggers react-router's data-router
  // navigation machinery, which builds a real `Request` — undici's strict
  // signal `instanceof` check then collides with jsdom's own AbortSignal
  // class in this test environment (Node 24 + jsdom), independent of this
  // codebase. Verified instead with a real browser (see manual QA notes).
});

describe('route registry', () => {
  it('has no duplicate paths', () => {
    const seen = routeMeta.map((route) => route.path);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('never advertises a disabled route in the nav or the sitemap', () => {
    expect(mainNavRoutes.every((route) => route.enabled)).toBe(true);
    expect(sitemapRoutes.every((route) => route.enabled)).toBe(true);
  });

  it('excludes parameterised paths from the sitemap', () => {
    expect(sitemapRoutes.some((route) => route.path.includes(':'))).toBe(false);
  });
});

describe('RequestError classification', () => {
  it('treats server and network failures as retryable, client errors as not', () => {
    expect(new RequestError('offline', 0).isRetryable).toBe(true);
    expect(new RequestError('boom', 500).isRetryable).toBe(true);
    expect(new RequestError('missing', 404).isRetryable).toBe(false);
    expect(new RequestError('missing', 404).isNotFound).toBe(true);
  });

  it('maps a backend field error onto an input name', () => {
    const error = new RequestError('invalid', 422, [{ field: 'phone', message: 'bad phone' }]);
    expect(error.messageFor('phone')).toBe('bad phone');
    expect(error.messageFor('name')).toBeUndefined();
  });
});

describe('url helpers', () => {
  it('normalises a canonical path', () => {
    expect(canonicalPath('/about/')).toBe('/about');
    expect(canonicalPath('/about?utm_source=x')).toBe('/about');
    expect(canonicalPath('/')).toBe('/');
  });

  it('leaves an absolute url untouched', () => {
    expect(absoluteUrl('https://example.com/x')).toBe('https://example.com/x');
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('/about')).toBe(false);
  });
});

describe('form schemas', () => {
  it('normalises a tracking code and rejects malformed input', () => {
    expect(trackingCodeSchema.parse('  ab12  ')).toBe('AB12');
    expect(trackingCodeSchema.safeParse('a b').success).toBe(false);
    expect(trackingCodeSchema.safeParse('ab').success).toBe(false);
  });

  it('enforces the Iraqi phone format the backend expects', () => {
    const base = { name: 'اسم', message: 'رسالة كافية الطول' };
    expect(contactFormSchema.safeParse({ ...base, phone: '07712345678' }).success).toBe(true);
    expect(contactFormSchema.safeParse({ ...base, phone: '12345' }).success).toBe(false);
  });
});
