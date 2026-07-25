import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/components/layout/Container';
import { paths } from '@/app/router/paths';
import { useLocale } from '@/hooks/useLocale';
import { formatNumber } from '@/lib/utils/format';
import { EyeIcon, TargetIcon, PersonIcon, StoreIcon } from '@/components/icons';
import aboutHeroImg from '@/assets/About-img.png';
import { JOURNEY_MILESTONES, VALUES } from './about.content';
import styles from './AboutSection.module.css';

/**
 * About section — pixel-matched to the approved design.
 *
 * Originally a standalone `/about` route (see git history / the old
 * `AboutPage.tsx`); now rendered inline inside `HomePage.tsx` as part of the
 * single scrolling marketing page (`/about` redirects here, see routes.tsx).
 * Carries no `<Seo>` of its own — only one `<Seo>` may exist per rendered
 * page, and Home's covers the whole document.
 *
 * Structure: dark hero (city/light-trail photo + scrim, centered story copy)
 * → "Our journey" roadmap grid → vision/mission two-column → "Our values"
 * icon row → dark CTA band. Journey/value content is data from
 * `about.content.ts`; this file only maps over it.
 */
export const AboutSection = () => {
  const { t } = useTranslation();
  const { language } = useLocale();
  const title = t('about.hero.title');

  return (
    <section id="about" aria-labelledby="about-heading">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <div className={styles.hero} data-section="about-hero">
        <div className={styles.heroMedia} aria-hidden="true">
          <img
            src={aboutHeroImg}
            alt=""
            className={styles.heroImage}
            loading="lazy"
            width={1802}
            height={873}
          />
          <div className={styles.heroScrim} />
        </div>

        <Container size="default" className={styles.heroInner}>
          <h2 id="about-heading" className={styles.heroTitle}>
            {title}
          </h2>
          <p className={styles.heroDescription}>{t('about.hero.description')}</p>
        </Container>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Our journey                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className={styles.journeySection} data-section="journey">
        <Container>
          <h3 className={styles.sectionTitle}>{t('about.journeyTitle')}</h3>

          <ol className={styles.journeyGrid} role="list">
            {JOURNEY_MILESTONES.map((milestone) => (
              <li
                key={milestone.id}
                className={styles.journeyCard}
                data-highlighted={milestone.highlighted || undefined}
              >
                <span className={styles.journeyYear}>
                  {formatNumber(milestone.year, language, { useGrouping: false })}
                </span>
                <span className={styles.journeyHijri}>{t(milestone.hijriKey)}</span>
                <span className={styles.journeyDivider} aria-hidden="true" />
                <h4 className={styles.journeyCardTitle}>{t(milestone.titleKey)}</h4>
                <p className={styles.journeyCardDescription}>{t(milestone.descriptionKey)}</p>
              </li>
            ))}
          </ol>
        </Container>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Vision & mission                                                 */}
      {/* ---------------------------------------------------------------- */}
      <div className={styles.missionSection} data-section="vision-mission">
        <Container className={styles.missionGrid}>
          <div className={styles.missionCard}>
            <span className={styles.missionIconWrap}>
              <TargetIcon className={styles.missionIcon} />
            </span>
            <h3 className={styles.missionCardTitle}>{t('about.mission.title')}</h3>
            <p className={styles.missionCardDescription}>{t('about.mission.description')}</p>
          </div>

          <div className={styles.missionCard}>
            <span className={styles.missionIconWrap}>
              <EyeIcon className={styles.missionIcon} />
            </span>
            <h3 className={styles.missionCardTitle}>{t('about.vision.title')}</h3>
            <p className={styles.missionCardDescription}>{t('about.vision.description')}</p>
          </div>
        </Container>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Our values                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className={styles.valuesSection} data-section="values">
        <Container>
          <h3 className={styles.sectionTitle}>{t('about.valuesTitle')}</h3>

          <ul className={styles.valuesGrid} role="list">
            {VALUES.map((value) => (
              <li key={value.id} className={styles.valueItem}>
                <span className={styles.valueIconWrap}>
                  <value.icon className={styles.valueIcon} />
                </span>
                <span className={styles.valueLabel}>{t(value.labelKey)}</span>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* CTA                                                              */}
      {/* ---------------------------------------------------------------- */}
      <div className={styles.ctaSection} data-section="about-cta">
        <Container>
          <h3 className={styles.ctaTitle}>{t('about.cta.title')}</h3>

          <div className={styles.ctaActions}>
            <Link to={`${paths.home}#merchants`} className={styles.ctaPrimary}>
              <StoreIcon className={styles.ctaIcon} />
              {t('about.cta.merchantButton')}
            </Link>
            <Link to={`${paths.home}#drivers`} className={styles.ctaSecondary}>
              <PersonIcon className={styles.ctaIcon} />
              {t('about.cta.driverButton')}
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
};

export default AboutSection;
