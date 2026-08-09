import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import { DocumentIcon, RouteIcon, BoxIcon, MotorbikeIcon, CheckCircleIcon } from '@/components/icons';
import {
  PageHero,
  Section,
  SectionHeading,
  CheckList,
  StepFlow,
  ImageSlot,
  CtaBand,
} from '@/components/ui';
import styles from './MerchantsPage.module.css';

/** The seven platform features listed in the approved design's checklist. */
const FEATURE_KEYS = [
  'merchants.feature.instantOrder',
  'merchants.feature.autoMatch',
  'merchants.feature.liveTracking',
  'merchants.feature.reports',
  'merchants.feature.payments',
  'merchants.feature.ratings',
  'merchants.feature.support',
] as const;

/**
 * Merchants page ("للتجار").
 *
 * Bands: hero → feature checklist beside the dashboard screenshot → the
 * five-step order flow → closing CTA.
 */
export const MerchantsPage = () => {
  const { t } = useTranslation();

  const flow = [
    { icon: DocumentIcon, label: t('merchants.flow.create') },
    { icon: RouteIcon, label: t('merchants.flow.match') },
    { icon: BoxIcon, label: t('merchants.flow.pickup') },
    { icon: MotorbikeIcon, label: t('merchants.flow.transit') },
    { icon: CheckCircleIcon, label: t('merchants.flow.delivered') },
  ];

  return (
    <>
      <Seo title={t('nav.merchants')} description={t('seo.merchants.description')} />

      <PageHero
        title={t('merchants.hero.title')}
        subtitle={t('merchants.hero.subtitle')}
        lead={t('merchants.hero.lead')}
        align="center"
      />

      <Section canvas="light" data-section="merchant-features">
        <div className={styles.split}>
          <CheckList
            card
            title={t('merchants.featuresTitle')}
            items={FEATURE_KEYS.map((key) => t(key))}
          />

          <div className={styles.screenshot}>
            {/*
              Awaiting the real dashboard capture. Until it arrives the slot
              reserves the exact 16:10 box, so dropping the file in later
              shifts nothing.
            */}
            <ImageSlot alt={t('merchants.dashboardAlt')} width={1440} height={900} onDark />
          </div>
        </div>
      </Section>

      <Section canvas="tint" data-section="merchant-flow">
        <SectionHeading title={t('merchants.flowTitle')} subtitle={t('merchants.flowSubtitle')} />
        <StepFlow steps={flow} label={t('merchants.flowTitle')} numbered />
      </Section>

      <CtaBand
        title={t('merchants.cta.title')}
        subtitle={t('merchants.cta.subtitle')}
        actions={[{ label: t('merchants.cta.button'), to: paths.apply.merchant }]}
      />
    </>
  );
};

export default MerchantsPage;
