import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';

interface FeatureGateProps {
  enabled: boolean;
  children: ReactNode;
  /** Override the default "not available yet" message. */
  fallback?: ReactNode;
}

/**
 * Renders `children` only when a feature flag is on.
 *
 * Why a component and not an `if` in the router: a flagged-off page must still
 * RESOLVE (so an existing inbound link doesn't 404) while telling crawlers not
 * to index it and telling the visitor plainly that the service isn't live yet.
 * Doing that in one place guarantees every gated route behaves identically.
 *
 * Note the `noIndex` — this is the whole point. A "coming soon" page that gets
 * indexed is worse than no page at all.
 */
export const FeatureGate = ({ enabled, children, fallback }: FeatureGateProps) => {
  const { t } = useTranslation();

  if (enabled) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <>
      <Seo title={t('common.comingSoon')} noIndex />
      <section data-state="feature-disabled" aria-live="polite">
        <h1>{t('common.comingSoon')}</h1>
        <p>{t('errors.featureDisabled')}</p>
      </section>
    </>
  );
};

export default FeatureGate;
