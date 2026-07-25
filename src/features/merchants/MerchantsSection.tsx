import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/components/layout/Container';
import { paths } from '@/app/router/paths';
import { StoreIcon } from '@/components/icons';
import { MERCHANT_BENEFITS } from './merchants.content';
import styles from './MerchantsSection.module.css';

/**
 * Merchants section — rendered inline inside HomePage.tsx as part of the
 * single scrolling marketing page (`/merchants` redirects here, see
 * routes.tsx). No `<Seo>` of its own; Home's covers the whole document.
 *
 * The "how it works for merchants" flow already lives in Home's "How it
 * works" section (`MERCHANT_STEPS`) — this section is deliberately just the
 * value proposition + benefits, not a repeat of that flow.
 */
export const MerchantsSection = () => {
  const { t } = useTranslation();

  return (
    <section id="merchants" className={styles.section} aria-labelledby="merchants-heading">
      <Container>
        <h2 id="merchants-heading" className={styles.title}>
          {t('merchants.title')}
        </h2>
        <p className={styles.intro}>{t('merchants.intro')}</p>

        <ul className={styles.benefitsGrid} role="list">
          {MERCHANT_BENEFITS.map((benefit) => (
            <li key={benefit.id} className={styles.benefitItem}>
              <span className={styles.benefitIconWrap}>
                <benefit.icon className={styles.benefitIcon} />
              </span>
              <span className={styles.benefitLabel}>{t(benefit.labelKey)}</span>
            </li>
          ))}
        </ul>

        <Link to={paths.download} className={styles.cta}>
          <StoreIcon className={styles.ctaIcon} />
          {t('merchants.cta')}
        </Link>
      </Container>
    </section>
  );
};

export default MerchantsSection;
