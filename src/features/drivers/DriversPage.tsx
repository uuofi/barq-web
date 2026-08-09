import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import { PersonIcon, PhoneIcon, MotorbikeIcon, WalletIcon } from '@/components/icons';
import {
  PageHero,
  Section,
  SectionHeading,
  CheckList,
  StepFlow,
  CtaBand,
} from '@/components/ui';
import heroLarge from '@/assets/home-img.webp';
import heroSmall from '@/assets/home-img-sm.webp';
import IncomeCalculator from './IncomeCalculator';
import styles from './DriversPage.module.css';

const FEATURE_KEYS = [
  'drivers.feature.manyOrders',
  'drivers.feature.dailyEarnings',
  'drivers.feature.flexibleHours',
  'drivers.feature.support',
  'drivers.feature.insurance',
  'drivers.feature.bonus',
] as const;

const REQUIREMENT_KEYS = [
  'drivers.requirement.id',
  'drivers.requirement.license',
  'drivers.requirement.vehicle',
  'drivers.requirement.phone',
] as const;

/**
 * Drivers page ("للسائقين").
 *
 * Bands: hero (rider photograph) → the benefits checklist → the four-step
 * "طريقة العمل" flow → requirements beside the income calculator → closing
 * CTA.
 */
export const DriversPage = () => {
  const { t } = useTranslation();

  const flow = [
    { icon: PersonIcon, label: t('drivers.flow.register') },
    { icon: PhoneIcon, label: t('drivers.flow.download') },
    { icon: MotorbikeIcon, label: t('drivers.flow.receive') },
    { icon: WalletIcon, label: t('drivers.flow.earn') },
  ];

  return (
    <>
      <Seo title={t('nav.drivers')} description={t('seo.drivers.description')} />

      <PageHero
        title={t('drivers.hero.title')}
        subtitle={t('drivers.hero.subtitle')}
        lead={t('drivers.hero.lead')}
        image={{
          src: heroLarge,
          srcSmall: heroSmall,
          alt: t('drivers.hero.imageAlt'),
          focus: '72% 50%',
          width: 1774,
          height: 887,
        }}
      />

      <Section canvas="light" data-section="driver-features">
        <SectionHeading title={t('drivers.featuresTitle')} />
        <CheckList card columns items={FEATURE_KEYS.map((key) => t(key))} />
      </Section>

      <Section canvas="tint" data-section="driver-flow">
        <SectionHeading title={t('drivers.flowTitle')} subtitle={t('drivers.flowSubtitle')} />
        <StepFlow steps={flow} label={t('drivers.flowTitle')} numbered />
      </Section>

      <Section canvas="light" data-section="driver-requirements">
        <div className={styles.split}>
          <CheckList
            card
            tone="violet"
            className={styles.requirements}
            title={t('drivers.requirementsTitle')}
            items={REQUIREMENT_KEYS.map((key) => t(key))}
          />
          <IncomeCalculator />
        </div>
      </Section>

      <CtaBand
        title={t('drivers.cta.title')}
        subtitle={t('drivers.cta.subtitle')}
        actions={[{ label: t('drivers.cta.button'), to: paths.apply.driver }]}
      />
    </>
  );
};

export default DriversPage;
