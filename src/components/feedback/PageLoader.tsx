import { useTranslation } from 'react-i18next';

/**
 * Suspense fallback for lazily-loaded pages.
 *
 * Structure only — no spinner design. What matters architecturally is the
 * accessibility contract: `role="status"` + `aria-live="polite"` announce the
 * load to a screen reader, and the visible text is the announcement rather
 * than a separate visually-hidden duplicate.
 */
export const PageLoader = () => {
  const { t } = useTranslation();

  return (
    <div role="status" aria-live="polite" data-component="page-loader">
      <span>{t('common.loading')}</span>
    </div>
  );
};

export default PageLoader;
