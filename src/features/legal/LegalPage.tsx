import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import Container from '@/components/layout/Container';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import styles from './LegalPage.module.css';

interface LegalPageProps {
  /** i18n key for the document title. */
  titleKey: string;
  /** i18n key for the meta description. */
  descriptionKey: string;
  path: string;
  /** ISO date the document last changed — legally meaningful, show it. */
  lastUpdated: string;
  children?: React.ReactNode;
}

/**
 * Shared shell for legal documents.
 *
 * Terms and Privacy differ only in their body text, so they share this
 * wrapper: identical SEO handling, identical "last updated" placement,
 * identical breadcrumbs. Duplicating a page component for two documents is
 * how one of them silently loses its canonical tag six months later.
 *
 * `type="article"` is correct here — these are dated documents, not
 * marketing pages, and crawlers treat the distinction meaningfully.
 */
export const LegalPage = ({ titleKey, descriptionKey, path, lastUpdated, children }: LegalPageProps) => {
  const { t } = useTranslation();
  const title = t(titleKey);

  return (
    <>
      <Seo
        title={title}
        description={t(descriptionKey)}
        type="article"
        jsonLd={[
          breadcrumbSchema([
            { name: t('nav.home'), path: paths.home },
            { name: title, path },
          ]),
        ]}
      />

      <Container as="article" size="narrow" data-page="legal">
        <h1>{title}</h1>
        <p className={styles.date}>
          {t('legal.lastUpdated')} <time dateTime={lastUpdated}>{lastUpdated}</time>
        </p>
        {children}
      </Container>
    </>
  );
};

export default LegalPage;
