import { useTranslation } from 'react-i18next';
import type { LegalSection } from './legal.content';
import styles from './LegalPage.module.css';

/**
 * Renders a legal document's section list — see `legal.content.ts` for why
 * the structure is data rather than JSX duplicated per document.
 */
export const LegalSections = ({ sections }: { sections: LegalSection[] }) => {
  const { t } = useTranslation();

  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className={styles.section} aria-labelledby={`legal-${section.id}`}>
          <h2 id={`legal-${section.id}`} className={styles.sectionTitle}>
            {t(section.titleKey)}
          </h2>

          {section.paragraphKeys?.map((key) => (
            <p key={key} className={styles.paragraph}>
              {t(key)}
            </p>
          ))}

          {section.listKeys && (
            <ul className={styles.list}>
              {section.listKeys.map((key) => (
                <li key={key} className={styles.listItem}>
                  {t(key)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
};

export default LegalSections;
