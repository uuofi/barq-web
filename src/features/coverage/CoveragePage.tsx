import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { serviceSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { GOVERNORATES, GOVERNORATE_LABELS } from '@/config/constants';
import { CheckCircleIcon, ClockIcon, PinIcon } from '@/components/icons';
import { PageHero, Section, SectionHeading, StatBand, CtaBand, IconBadge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import IraqMap from './IraqMap';
import { MAP_CITIES, COVERAGE_STATS, isCityLive } from './coverage.content';
import styles from './CoveragePage.module.css';

/**
 * "المدن التي نخدمها" — the coverage page.
 *
 * Bands: hero → the map with its city list → the coverage figures → closing
 * CTA.
 *
 * The city list under the map is the accessible, crawlable version of the same
 * data the pins encode (the SVG itself is `aria-hidden`), and it is the reason
 * this page can show a national map without misrepresenting where the service
 * actually runs: cities outside the backend's governorate enum are labelled
 * "قريباً", not "متاح الآن".
 */
export const CoveragePage = () => {
  const { t } = useTranslation();

  const jsonLd = useMemo(
    () => [
      serviceSchema({
        name: t('coverage.hero.title'),
        description: t('seo.coverage.description'),
        // Only the live governorates go into structured data. A crawler that
        // is told the service covers Basra will surface it for Basra.
        areaServed: GOVERNORATES.map((id) => GOVERNORATE_LABELS[id]),
      }),
    ],
    [t]
  );

  const stats = COVERAGE_STATS.map((stat) => ({
    value: stat.value,
    label: t(stat.labelKey),
  }));

  return (
    <>
      <Seo
        title={t('nav.coverage')}
        description={t('seo.coverage.description')}
        jsonLd={jsonLd}
      />

      <PageHero
        title={t('coverage.hero.title')}
        subtitle={t('coverage.hero.description')}
        align="center"
      />

      <Section canvas="ink" glow data-section="coverage-map">
        <IraqMap />

        <ul role="list" className={styles.cityGrid}>
          {MAP_CITIES.map((city) => {
            const live = isCityLive(city);
            return (
              <li key={city.id} className={styles.cityCard} data-city={city.id}>
                <IconBadge icon={PinIcon} size="sm" tone="onDark" />
                <span className={styles.cityName}>{t(city.labelKey)}</span>
                <span className={cn(styles.badge, live ? styles.badgeLive : styles.badgeSoon)}>
                  {live ? (
                    <CheckCircleIcon className={styles.badgeIcon} />
                  ) : (
                    <ClockIcon className={styles.badgeIcon} />
                  )}
                  {live ? t('coverage.available') : t('coverage.comingSoon')}
                </span>
              </li>
            );
          })}
        </ul>

        <p className={styles.expansion}>{t('coverage.expansion.description')}</p>
      </Section>

      <Section canvas="light" spacing="tight" data-section="coverage-stats">
        <SectionHeading title={t('coverage.expansion.title')} />
        <StatBand stats={stats} plain />
      </Section>

      <CtaBand
        title={t('coverage.cta.title')}
        actions={[
          { label: t('coverage.cta.driverButton'), to: paths.apply.driver },
          { label: t('coverage.cta.merchantButton'), to: paths.apply.merchant },
        ]}
      />
    </>
  );
};

export default CoveragePage;
