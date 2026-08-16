import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { STORAGE_KEYS } from '@/config/constants';

/**
 * Global test setup (referenced by `test.setupFiles` in vite.config.ts).
 *
 * Four things every test in this project can assume:
 *  1. the locale is Arabic. i18n falls back to the browser's language when
 *     nothing is stored, and jsdom reports en-US — so without this the suite
 *     silently runs in English and any assertion on copy is a coin flip.
 *     Written BEFORE any module imports i18n, which is why it sits in setup.
 *  2. the DOM is torn down between tests (no state leaking across files);
 *  3. `matchMedia` exists — jsdom does not implement it, and `useMediaQuery`
 *     would throw in any component tree that touches it.
 *  4. `URL.createObjectURL` exists — likewise unimplemented by jsdom, and the
 *     driver form's photo preview calls it the moment a file is chosen.
 */

window.localStorage.setItem(STORAGE_KEYS.language, 'ar');

afterEach(() => {
  cleanup();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(), // deprecated, still called by some libs
      removeListener: vi.fn(),
    }),
  });
}

// jsdom leaves scrollTo unimplemented; ScrollToTop calls it on every route.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

/**
 * Object URLs. jsdom implements neither half, and <PhotoUpload> creates one for
 * the preview and revokes it on replace/unmount. Stubbed rather than guarded in
 * the component: every real browser has these, so a runtime check there would
 * be dead code defending against the test environment.
 */
if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob:test/preview');
  URL.revokeObjectURL = vi.fn();
}
