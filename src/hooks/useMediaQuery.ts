import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query from JS.
 *
 * Use sparingly: layout belongs in CSS. This is for cases where the DOM
 * itself must differ (rendering a mobile drawer vs a desktop nav, or reading
 * `prefers-reduced-motion` before starting an animation) — not for styling
 * that a media query in CSS can already express.
 *
 * The initial state is read synchronously so the first paint is correct and
 * the component does not flash the wrong variant.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

/** Honour the OS "reduce motion" setting before animating anything. */
export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

export default useMediaQuery;
