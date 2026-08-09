import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { organizationSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { EyeIcon, TargetIcon } from '@/components/icons';
import {
  PageHero,
  Section,
  SectionHeading,
  FeatureCard,
  FeatureGrid,
  IconBadge,
  CtaBand,
} from '@/components/ui';
import aboutImage from '@/assets/About-img.png';
import { JOURNEY, VALUES } from './about.content';
import styles from './AboutPage.module.css';

/**
 * About page.
 *
 * Bands: hero (city photograph) → "رحلتنا" timeline → vision/mission pair →
 * "قيمنا" → closing CTA.
 */
export const AboutPage = () => {
  const { t } = useTranslation();

  const jsonLd = useMemo(() => [organizationSchema()], []);

  return (
    <>
      <Seo
        title={t('nav.about')}
        description={t('seo.about.description')}
        jsonLd={jsonLd}
      />

      <PageHero
        title={t('about.hero.title')}
        lead={t('about.hero.description')}
        align="center"
        image={{
          src: aboutImage,
          alt: t('about.hero.imageAlt'),
          focus: '50% 60%',
          width: 1792,
          height: 878,
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* رحلتنا                                                            */}
      {/* ---------------------------------------------------------------- */}
      <Section canvas="light" data-section="journey">
        <SectionHeading title={t('about.journeyTitle')} subtitle={t('about.journeySubtitle')} />

        <ol role="list" className={styles.timeline}>
          {JOURNEY.map((entry) => (
            <li key={entry.id} className={styles.entry}>
              <span className={styles.year}>{t(entry.yearKey)}</span>
              <h3 className={styles.entryTitle}>{t(entry.titleKey)}</h3>
              <p className={styles.entryBody}>{t(entry.descriptionKey)}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* رؤيتنا / رسالتنا                                                  */}
      {/* ---------------------------------------------------------------- */}
      <Section canvas="ink" glow data-section="vision-mission">
        <div className={styles.pillars}>
          <article className={styles.pillar}>
            <IconBadge icon={EyeIcon} size="xl" tone="onDark" />
            <h2 className={styles.pillarTitle}>{t('about.vision.title')}</h2>
            <p className={styles.pillarBody}>{t('about.vision.description')}</p>
          </article>

          <article className={styles.pillar}>
            <IconBadge icon={TargetIcon} size="xl" tone="onDark" />
            <h2 className={styles.pillarTitle}>{t('about.mission.title')}</h2>
            <p className={styles.pillarBody}>{t('about.mission.description')}</p>
          </article>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* قيمنا                                                             */}
      {/* ---------------------------------------------------------------- */}
      <Section canvas="light" data-section="values">
        <SectionHeading title={t('about.valuesTitle')} subtitle={t('about.valuesSubtitle')} />

        <FeatureGrid columns={5}>
          {VALUES.map((value) => (
            <FeatureCard
              key={value.id}
              icon={value.icon}
              title={t(value.labelKey)}
              body={t(value.bodyKey)}
              centered
            />
          ))}
        </FeatureGrid>
      </Section>

      <CtaBand
        title={t('about.cta.title')}
        actions={[
          { label: t('about.cta.driverButton'), to: paths.apply.driver },
          { label: t('about.cta.merchantButton'), to: paths.apply.merchant },
        ]}
      />
    </>
  );
};

export default AboutPage;
