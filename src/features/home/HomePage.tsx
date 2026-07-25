import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import Container from '@/components/layout/Container';
import WaveDivider from '@/components/layout/WaveDivider';
import { organizationSchema, websiteSchema, faqSchema, serviceSchema } from '@/lib/seo/schema';
import { site } from '@/config/site';
import { useLocale } from '@/hooks/useLocale';
import { formatNumber } from '@/lib/utils/format';
import { BoltIcon, PersonIcon, StoreIcon, ArrowLeftIcon } from '@/components/icons';
import { GOVERNORATES, GOVERNORATE_LABELS } from '@/config/constants';
import heroWebpLarge from '@/assets/home-img.webp';
import heroWebpSmall from '@/assets/home-img-sm.webp';
import heroJpgLarge from '@/assets/home-img.jpg';
import heroJpgSmall from '@/assets/home-img-sm.jpg';
import { WHY_FEATURES, STATS, DRIVER_STEPS, MERCHANT_STEPS } from './home.content';
import AboutSection from '@/features/about/AboutSection';
import CoverageSection from '@/features/coverage/CoverageSection';
import MerchantsSection from '@/features/merchants/MerchantsSection';
import DriversSection from '@/features/drivers/DriversSection';
import FaqSection from '@/features/faq/FaqSection';
import { getFaqEntries } from '@/features/faq/faq.content';
import styles from './HomePage.module.css';

/**
 * Home page — the single scrolling marketing page.
 *
 * Structure: Hero (full-bleed photo + gradient scrim + two role CTAs) → wave
 * transition → "Why Al-Barq" icon row → stats band → "How it works" two-column
 * step flow (driver / merchant) → About → Coverage → Merchants → Drivers → FAQ.
 *
 * The last five were standalone routes (`/about`, `/coverage`, `/merchants`,
 * `/drivers`, `/faq`); those paths now redirect here (see
 * `app/router/routes.tsx`) and their content renders inline as `<Section>`
 * components that carry no `<Seo>` of their own — only ONE `<Seo>` may exist
 * per rendered page.
 *
 * Content (feature list, stats, step flows) is data from `home.content.ts` —
 * this file only maps over it. Carries `organizationSchema` + `websiteSchema`
 * because both describe the SITE as a whole and belong on the root page only;
 * `faqSchema` / `serviceSchema` are added here too now that the FAQ and
 * coverage-area content live on this page.
 */
export const HomePage = () => {
  const { t } = useTranslation();
  const { language } = useLocale();

  const faqEntries = useMemo(() => getFaqEntries(language), [language]);

  const jsonLd = useMemo(() => {
    const blocks = [
      organizationSchema(),
      websiteSchema(),
      serviceSchema({
        name: t('footer.coverage'),
        description: t('seo.coverage.description'),
        areaServed: GOVERNORATES.map((id) => GOVERNORATE_LABELS[id]),
      }),
    ];
    if (faqEntries.length > 0) blocks.push(faqSchema(faqEntries));
    return blocks;
  }, [faqEntries, t]);

  return (
    <>
      <Seo title={t('common.tagline')} description={site.description} jsonLd={jsonLd} />

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className={styles.hero} data-section="hero">
        <div className={styles.heroMedia} aria-hidden="true">
          {/*
            The rider photo is this page's LCP element, so it loads eager +
            high priority with no lazy-loading. WebP first (with a JPEG
            fallback for the rare browser without WebP support), and two
            widths so a phone never downloads the 1920px desktop asset —
            the original PNG was 1.8MB; these variants are ~40–115KB.
          */}
          <picture>
            <source
              type="image/webp"
              srcSet={`${heroWebpSmall} 960w, ${heroWebpLarge} 1920w`}
              sizes="100vw"
            />
            <img
              src={heroJpgLarge}
              srcSet={`${heroJpgSmall} 960w, ${heroJpgLarge} 1920w`}
              sizes="100vw"
              alt=""
              className={styles.heroImage}
              loading="eager"
              fetchPriority="high"
              width={1774}
              height={887}
            />
          </picture>
          <div className={styles.heroScrim} />
        </div>

        <Container size="wide" className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeading}>
              <span className={styles.heroBrandRow}>
                <span>{site.name}</span>
                <BoltIcon className={styles.heroBoltIcon} />
              </span>
              <span className={styles.heroTagline}>{t('home.heroTagline')}</span>
            </h1>

            <div className={styles.heroActions}>
              <Link to="#drivers" className={styles.ctaPrimary}>
                <PersonIcon className={styles.ctaIcon} />
                {t('home.ctaDriver')}
              </Link>
              <Link to="#merchants" className={styles.ctaSecondary}>
                <StoreIcon className={styles.ctaIcon} />
                {t('home.ctaMerchant')}
              </Link>
            </div>
          </div>
        </Container>

        <WaveDivider className={styles.heroWave} />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why Al-Barq                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className={styles.whySection} data-section="why-us">
        <Container>
          <h2 className={styles.sectionTitle}>{t('home.whyTitle')}</h2>

          <ul className={styles.featureGrid} role="list">
            {WHY_FEATURES.map((feature) => (
              <li key={feature.id} className={styles.featureItem}>
                <span className={styles.featureIconWrap}>
                  <feature.icon className={styles.featureIcon} />
                </span>
                <span className={styles.featureLabel}>{t(feature.labelKey)}</span>
              </li>
            ))}
          </ul>
        </Container>

        <div className={styles.statsBar}>
          <Container className={styles.statsRow}>
            {STATS.map((stat) => (
              <div key={stat.id} className={styles.statItem}>
                <span className={styles.statValue}>
                  {stat.prefix}
                  {formatNumber(stat.value, language)}
                  {stat.suffix}
                </span>
                <span className={styles.statLabel}>{t(stat.labelKey)}</span>
              </div>
            ))}
          </Container>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className={styles.howSection} id="how-it-works" data-section="how-it-works">
        <Container>
          <h2 className={styles.sectionTitle}>{t('home.howTitle')}</h2>

          <div className={styles.flowColumns}>
            <div className={styles.flowColumn}>
              <h3 className={styles.flowTitle}>{t('home.forDriver')}</h3>
              <ol className={styles.flowSteps}>
                {DRIVER_STEPS.map((step, index) => (
                  <li key={step.id} className={styles.flowStepRow}>
                    <span className={styles.flowStep}>
                      <span className={styles.flowIconWrap}>
                        <step.icon className={styles.flowIcon} />
                      </span>
                      <span className={styles.flowLabel}>{t(step.labelKey)}</span>
                    </span>
                    {index < DRIVER_STEPS.length - 1 && (
                      <ArrowLeftIcon className={styles.flowArrow} />
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.flowColumn}>
              <h3 className={styles.flowTitle}>{t('home.forMerchant')}</h3>
              <ol className={styles.flowSteps}>
                {MERCHANT_STEPS.map((step, index) => (
                  <li key={step.id} className={styles.flowStepRow}>
                    <span className={styles.flowStep}>
                      <span className={styles.flowIconWrap}>
                        <step.icon className={styles.flowIcon} />
                      </span>
                      <span className={styles.flowLabel}>{t(step.labelKey)}</span>
                    </span>
                    {index < MERCHANT_STEPS.length - 1 && (
                      <ArrowLeftIcon className={styles.flowArrow} />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      <AboutSection />
      <CoverageSection />
      <MerchantsSection />
      <DriversSection />
      <FaqSection />
    </>
  );
};

export default HomePage;
