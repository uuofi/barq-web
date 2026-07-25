import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/logger';
import { RequestError } from '@/lib/http/RequestError';
import Seo from '@/components/seo/Seo';
import { paths } from './paths';

/**
 * Router-level error element.
 *
 * This catches anything thrown while a route renders — including a failed
 * lazy() chunk load, which is the most common real-world case (a user with a
 * stale tab open across a deploy). Without it react-router renders its own
 * developer-facing error screen in production.
 *
 * Distinct from `components/feedback/ErrorBoundary`: that one wraps arbitrary
 * subtrees; this one is wired into the route object and has access to
 * `useRouteError()`.
 */
export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const { t } = useTranslation();

  useEffect(() => {
    logger.error('Route error boundary caught an error', error);
  }, [error]);

  const is404 = isRouteErrorResponse(error) && error.status === 404;

  const message = (() => {
    if (is404) return t('errors.notFoundBody');
    if (RequestError.is(error)) {
      return error.isNetworkError ? t('errors.network') : error.message;
    }
    return t('errors.boundaryBody');
  })();

  return (
    <>
      <Seo title={is404 ? t('errors.notFound') : t('errors.generic')} noIndex />
      <section role="alert" data-state="route-error">
        <h1>{is404 ? t('errors.notFound') : t('errors.boundaryTitle')}</h1>
        <p>{message}</p>
        <div>
          {/* Full reload, not a client navigation: if the failure was a stale
              chunk, only a reload fetches the new asset manifest. */}
          <button type="button" onClick={() => window.location.reload()}>
            {t('errors.reload')}
          </button>
          <Link to={paths.home}>{t('common.backHome')}</Link>
        </div>
      </section>
    </>
  );
};

export default RouteErrorBoundary;
