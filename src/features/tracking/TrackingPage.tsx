import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import Container from '@/components/layout/Container';
import QueryState from '@/components/feedback/QueryState';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { useTrackOrder } from './useTrackOrder';

/**
 * Order tracking page — WIRING ONLY, no visual design.
 *
 * This is the reference shape every page in this project follows:
 *
 *   1. <Seo /> first, always — one per page, never nested.
 *   2. Data comes from the feature's hook; the page never calls the API layer.
 *   3. Loading/error/empty branching is delegated to <QueryState />.
 *   4. Content sits inside a <Container>, which owns page rhythm.
 *
 * The markup below is a structural skeleton: semantic elements and data
 * attributes for the styling layer to hook onto, with no styling decisions
 * made. Presentation components belong in `./components/` when built.
 */
export const TrackingPage = () => {
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const { order, isLoading, error, notFound, refetch } = useTrackOrder(code);

  const title = t('nav.trackOrder');

  return (
    <>
      <Seo
        title={title}
        // A result page is per-order and unbounded — never index it.
        noIndex={Boolean(code)}
        jsonLd={[
          breadcrumbSchema([
            { name: t('nav.home'), path: paths.home },
            { name: title, path: paths.tracking.index },
          ]),
        ]}
      />

      <Container as="section" data-page="tracking">
        <h1>{title}</h1>

        {/* TODO(ui): tracking code input form — see tracking.schema.ts for
            the validated shape (trackingFormSchema) to bind with RHF+zod. */}

        {code && (
          <QueryState
            isLoading={isLoading}
            error={notFound ? null : error}
            data={order}
            onRetry={refetch}
          >
            {(result) => (
              <article data-component="tracking-result" data-status={result.status}>
                {/* TODO(ui): status header + timeline from `result.timeline` */}
              </article>
            )}
          </QueryState>
        )}

        {notFound && (
          <p role="status" data-state="not-found">
            {t('errors.notFoundBody')}
          </p>
        )}
      </Container>
    </>
  );
};

export default TrackingPage;
