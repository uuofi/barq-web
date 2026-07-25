import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import Container from '@/components/layout/Container';
import { paths } from '@/app/router/paths';

/**
 * 404 page — structure only, no design.
 *
 * `noIndex` matters: a SPA serves this with HTTP 200 (the server returned
 * index.html and the router decided it was a miss), so without the meta tag a
 * crawler would happily index every broken URL as a real page. This is the
 * standard "soft 404" trap.
 *
 * Ideally the host also returns a real 404 status for unknown paths — see
 * public/_redirects and the deployment notes in README.md.
 */
export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('errors.notFound')} noIndex />

      <Container as="section" data-page="not-found">
        <h1>{t('errors.notFound')}</h1>
        <p>{t('errors.notFoundBody')}</p>
        <Link to={paths.home}>{t('common.backHome')}</Link>
      </Container>
    </>
  );
};

export default NotFoundPage;
