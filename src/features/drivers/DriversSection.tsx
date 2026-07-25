import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/components/layout/Container';
import { paths } from '@/app/router/paths';
import { PersonIcon } from '@/components/icons';
import { DRIVER_BENEFITS } from './drivers.content';
import styles from './DriversSection.module.css';

/**
 * Drivers section — rendered inline inside HomePage.tsx as part of the
 * single scrolling marketing page (`/drivers` redirects here, see
 * routes.tsx). No `<Seo>` of its own; Home's covers the whole document.
 *
 * The "how it works for drivers" flow already lives in Home's "How it
 * works" section (`DRIVER_STEPS`) — this section is deliberately just the
 * value proposition + benefits, not a repeat of that flow.
 */
export const DriversSection = () => {
  const { t } = useTranslation();

  return (
    <section id="drivers" className={styles.section} aria-labelledby="drivers-heading">
      <Container>
        <h2 id="drivers-heading" className={styles.title}>
          {t('drivers.title')}
        </h2>
        <p className={styles.intro}>{t('drivers.intro')}</p>

        <ul className={styles.benefitsGrid} role="list">
          {DRIVER_BENEFITS.map((benefit) => (
            <li key={benefit.id} className={styles.benefitItem}>
              <span className={styles.benefitIconWrap}>
                <benefit.icon className={styles.benefitIcon} />
              </span>
              <span className={styles.benefitLabel}>{t(benefit.labelKey)}</span>
            </li>
          ))}
        </ul>

        <Link to={paths.download} className={styles.cta}>
          <PersonIcon className={styles.ctaIcon} />
          {t('drivers.cta')}
        </Link>
      </Container>
    </section>
  );
};

export default DriversSection;
