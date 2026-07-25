import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ScrollToTop from './ScrollToTop';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import { usePageView } from '@/hooks/usePageView';

/**
 * The shell every page renders inside.
 *
 * Responsibilities are structural only — this file contains NO visual design;
 * it establishes the landmark regions (`header` / `main` / `footer`) that
 * screen readers and the styling layer both hang off.
 *
 * Two accessibility details that are cheap here and expensive to retrofit:
 *   - the skip link, which lets a keyboard user jump past the nav;
 *   - `id="main-content"` + `tabIndex={-1}`, so route changes can move focus
 *     into the new page instead of stranding it on a stale element.
 *
 * The inner ErrorBoundary is intentional: a page crash keeps the header and
 * footer alive, so the visitor can still navigate away.
 */
export const RootLayout = () => {
  const { t } = useTranslation();

  usePageView();

  return (
    <>
      <ScrollToTop />

      <a href="#main-content" className="skip-link">
        {t('common.skipToContent')}
      </a>

      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <SiteFooter />
    </>
  );
};

export default RootLayout;
