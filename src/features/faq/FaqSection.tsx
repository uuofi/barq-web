import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@/components/layout/Container';
import { useLocale } from '@/hooks/useLocale';
import { ChevronDownIcon } from '@/components/icons';
import { getFaqEntries } from './faq.content';
import styles from './FaqSection.module.css';

/**
 * FAQ section — rendered inline inside HomePage.tsx as part of the single
 * scrolling marketing page (`/faq` redirects here, see routes.tsx). No
 * `<Seo>` of its own; Home's covers the whole document (including the
 * `faqSchema()` JSON-LD block, built from the same `getFaqEntries()` data).
 *
 * Built on native `<details>/<summary>` rather than a hand-rolled
 * accordion — free keyboard support and no extra ARIA wiring.
 */
export const FaqSection = () => {
  const { t } = useTranslation();
  const { language } = useLocale();

  const entries = useMemo(() => getFaqEntries(language), [language]);

  if (entries.length === 0) return null;

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <Container size="narrow">
        <h2 id="faq-heading" className={styles.title}>
          {t('nav.faq')}
        </h2>
        <p className={styles.intro}>{t('faq.intro')}</p>

        <div className={styles.list}>
          {entries.map((entry) => (
            <details key={entry.id} className={styles.details} data-category={entry.category}>
              <summary className={styles.summary}>
                <span>{entry.question}</span>
                <ChevronDownIcon className={styles.chevron} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{entry.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FaqSection;
