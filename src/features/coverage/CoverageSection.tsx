import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/components/layout/Container';
import { paths } from '@/app/router/paths';
import { GOVERNORATES, GOVERNORATE_LABELS } from '@/config/constants';
import { PersonIcon, StoreIcon, PinIcon, CheckCircleIcon } from '@/components/icons';
import coverageMapImg from '@/assets/image.png';
import styles from './CoverageSection.module.css';

/**
 * Coverage section — where the service is currently available.
 *
 * Rendered inline inside HomePage.tsx, directly under `AboutSection` (see
 * HomePage.tsx) — `/coverage` redirects here, same pattern as Merchants /
 * Drivers / FAQ (see routes.tsx). No `<Seo>` of its own; Home's covers the
 * whole document.
 *
 * The hero art (`assets/image.png`) already bakes its own title/subtitle/
 * pinned-map illustration into the graphic. It is shown here in full — no
 * cropping — as a supporting visual under this section's own real heading,
 * so the message still reaches anyone whose browser doesn't render the
 * image and stays crawlable for search engines either way.
 *
 * The governorate list is rendered from the shared constant, which mirrors
 * the backend's closed enum — this section can therefore never advertise a
 * governorate the dispatch layer cannot actually route an order to.
 */
export const CoverageSection = () => {
  const { t } = useTranslation();

  return (
    <section id="coverage" className={styles.section} aria-labelledby="coverage-heading">
      <Container>
        <h2 id="coverage-heading" className={styles.title}>
          {t('coverage.hero.title')}
        </h2>
        <p className={styles.intro}>{t('coverage.hero.description')}</p>

        <img
          src={coverageMapImg}
          alt={t('coverage.imageAlt')}
          className={styles.image}
          loading="lazy"
          width={765}
          height={476}
        />

        <ul className={styles.cityGrid} role="list" data-component="governorate-list">
          {GOVERNORATES.map((id) => (
            <li key={id} className={styles.cityCard} data-governorate={id}>
              <span className={styles.cityIconWrap}>
                <PinIcon className={styles.cityIcon} />
              </span>
              <span className={styles.cityName}>{GOVERNORATE_LABELS[id]}</span>
              <span className={styles.cityBadge}>
                <CheckCircleIcon className={styles.cityBadgeIcon} />
                {t('coverage.available')}
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.expansionNote}>{t('coverage.expansion.description')}</p>

        <div className={styles.ctaActions}>
          <Link to={`${paths.home}#merchants`} className={styles.ctaPrimary}>
            <StoreIcon className={styles.ctaIcon} />
            {t('coverage.cta.merchantButton')}
          </Link>
          <Link to={`${paths.home}#drivers`} className={styles.ctaSecondary}>
            <PersonIcon className={styles.ctaIcon} />
            {t('coverage.cta.driverButton')}
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default CoverageSection;
