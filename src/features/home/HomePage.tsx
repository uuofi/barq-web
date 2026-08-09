import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { organizationSchema, websiteSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { site } from '@/config/site';
import { BoltIcon } from '@/components/icons';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  FeatureGrid,
  StepFlow,
  CtaBand,
  Button,
  ImageSlot,
} from '@/components/ui';
import heroLarge from '@/assets/home-img.webp';
import heroSmall from '@/assets/home-img-sm.webp';
import { WHY_FEATURES, HOW_STEPS, APPS } from './home.content';
import styles from './HomePage.module.css';

/**
 * Home page.
 *
 * Band order: hero (photo) → "لماذا برق؟" → "كيف يعمل برق؟" → "تطبيقات
 * برق" → closing CTA.
 *
 * The page is a composition of `components/ui` primitives and the data in
 * `home.content.ts`; it contains no layout of its own beyond the
 * how-it-works footer link.
 *
 * It carries `organizationSchema` + `websiteSchema` because both describe the
 * SITE as a whole and belong on the root page only.
 */
export const HomePage = () => {
  const { t } = useTranslation();

  const jsonLd = useMemo(() => [organizationSchema(), websiteSchema()], []);

  const howSteps = HOW_STEPS.map((step) => ({
    icon: step.icon,
    label: t(step.labelKey),
    caption: t(step.captionKey),
  }));

  return (
    <>
      <Seo title={t('common.tagline')} description={site.description} jsonLd={jsonLd} />

      <PageHero
        title={site.name}
        titleIcon={BoltIcon}
        subtitle={t('home.heroTagline')}
        lead={t('home.heroLead')}
        eyebrow={t('home.heroBadge')}
        image={{
          src: heroLarge,
          srcSmall: heroSmall,
          alt: t('home.heroImageAlt'),
          // The rider sits on the right of the frame; hold that side in view
          // as the crop narrows.
          focus: '78% 50%',
          width: 1774,
          height: 887,
        }}
        actions={[
          { label: t('home.ctaDriver'), to: paths.apply.driver },
          { label: t('home.ctaMerchant'), to: paths.apply.merchant },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* لماذا برق؟                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Section canvas="light" data-section="why-us">
        <SectionHeading title={t('home.whyTitle')} subtitle={t('home.whySubtitle')} />

        <FeatureGrid columns={4}>
          {WHY_FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={t(feature.labelKey)}
              body={t(feature.bodyKey)}
              centered
            />
          ))}
        </FeatureGrid>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* كيف يعمل برق؟                                                   */}
      {/* ---------------------------------------------------------------- */}
      <Section canvas="light" data-section="how-it-works">
        <SectionHeading title={t('home.howTitle')} subtitle={t('home.howSubtitle')} />

        <StepFlow steps={howSteps} label={t('home.howTitle')} numbered />

        <div className={styles.howFooter}>
          <Button to={paths.howItWorks} variant="light">
            {t('home.howCta')}
          </Button>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* تطبيقات برق                                                     */}
      {/* ---------------------------------------------------------------- */}
      <Section canvas="ink" glow data-section="apps">
        <SectionHeading title={t('home.appsTitle')} subtitle={t('home.appsSubtitle')} />

        <div className={styles.apps}>
          {APPS.map((app) => (
            <article key={app.id} className={styles.app}>
              <ImageSlot
                src={app.image?.src}
                alt={t(app.bodyKey)}
                width={app.image?.width ?? 720}
                height={app.image?.height ?? 900}
                onDark
                framed
              />
              <h3 className={styles.appTitle}>{t(app.titleKey)}</h3>
              <p className={styles.appBody}>{t(app.bodyKey)}</p>
            </article>
          ))}
        </div>
      </Section>

      <CtaBand
        title={t('home.cta.title')}
        subtitle={t('home.cta.subtitle')}
        actions={[
          { label: t('home.ctaDriver'), to: paths.apply.driver },
          { label: t('home.ctaMerchant'), to: paths.apply.merchant },
        ]}
      />
    </>
  );
};

export default HomePage;
