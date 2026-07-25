import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores scroll position on navigation.
 *
 * A browser resets scroll on a real page load; a client-side router does not,
 * so without this a visitor clicking a footer link lands halfway down the new
 * page. `useLayoutEffect` is deliberately avoided — scrolling before paint
 * causes a visible jump on slower devices.
 *
 * Two exceptions are honoured:
 *  - a hash (`/faq#pricing`) means the visitor asked for a specific anchor;
 *  - a POP navigation (back/forward) should keep the browser's own restored
 *    position, which is what `history.scrollRestoration` already handles.
 */
export const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    // `key` changes on every navigation, including same-path ones — so a
    // re-click of the active nav link also scrolls back up.
  }, [pathname, hash, key]);

  return null;
};

export default ScrollToTop;
