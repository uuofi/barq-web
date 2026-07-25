import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

/**
 * Emits one `page_view` per navigation.
 *
 * Mounted once, in RootLayout — never in a page. Putting it in pages is how
 * you end up with duplicate views (one per re-render) and missing views (on
 * the page someone forgot).
 *
 * NO TITLE IS SENT, deliberately. Every page is lazy, so at the moment this
 * effect runs the new page has not mounted yet and its <Seo /> has not set
 * `document.title` — reading it here reports the PREVIOUS page's title, which
 * is worse than reporting none. The path is the identity of a page view; the
 * title is decoration, and an analytics provider that wants it can resolve it
 * from the path.
 *
 * `lastPath` guards against React 18 StrictMode's intentional double-invoke
 * in development, which would otherwise double every view count locally.
 */
export const usePageView = (): void => {
  const { pathname, search } = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = `${pathname}${search}`;
    if (lastPath.current === path) return;
    lastPath.current = path;

    analytics.pageView(path);
  }, [pathname, search]);
};

export default usePageView;
