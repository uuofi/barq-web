import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import {
  StoreIcon,
  ApertureIcon,
  MotorbikeIcon,
  PersonIcon,
  BoltIcon,
  WalletIcon,
  ShieldIcon,
  HeadsetIcon,
} from '@/components/icons';
import {
  PageHero,
  Section,
  SectionHeading,
  StepFlow,
  FeatureCard,
  FeatureGrid,
  CtaBand,
} from '@/components/ui';

/**
 * "كيف يعمل برق؟" — the explainer page.
 *
 * Bands: hero → the four-actor chain (merchant → system → driver → customer)
 * → the four differentiators → closing CTA.
 *
 * Content is inline rather than in a `*.content.ts` file: unlike the home and
 * services grids, neither list here is reused anywhere else or expected to
 * grow, and a four-item array in its own module would be indirection without
 * a payoff.
 */
export const HowItWorksPage = () => {
  const { t } = useTranslation();

  const chain = [
    {
      icon: StoreIcon,
      label: t('howItWorks.actor.merchant'),
      caption: t('howItWorks.actor.merchantBody'),
    },
    {
      icon: ApertureIcon,
      label: t('howItWorks.actor.system'),
      caption: t('howItWorks.actor.systemBody'),
    },
    {
      icon: MotorbikeIcon,
      label: t('howItWorks.actor.driver'),
      caption: t('howItWorks.actor.driverBody'),
    },
    {
      icon: PersonIcon,
      label: t('howItWorks.actor.customer'),
      caption: t('howItWorks.actor.customerBody'),
    },
  ];

  const benefits = [
    { id: 'speed', icon: BoltIcon },
    { id: 'price', icon: WalletIcon },
    { id: 'safety', icon: ShieldIcon },
    { id: 'support', icon: HeadsetIcon },
  ] as const;

  return (
    <>
      <Seo title={t('nav.howItWorks')} description={t('seo.howItWorks.description')} />

      <PageHero
        title={t('howItWorks.hero.title')}
        subtitle={t('howItWorks.hero.subtitle')}
        align="center"
      />

      <Section canvas="light" data-section="chain">
        <SectionHeading title={t('howItWorks.chainTitle')} subtitle={t('howItWorks.chainSubtitle')} />
        <StepFlow steps={chain} label={t('howItWorks.chainTitle')} badgeSize="xl" numbered />
      </Section>

      <Section canvas="tint" data-section="benefits">
        <SectionHeading title={t('howItWorks.benefitsTitle')} />

        <FeatureGrid columns={4}>
          {benefits.map((benefit) => (
            <FeatureCard
              key={benefit.id}
              icon={benefit.icon}
              title={t(`howItWorks.benefit.${benefit.id}`)}
              body={t(`howItWorks.benefit.${benefit.id}Body`)}
              centered
            />
          ))}
        </FeatureGrid>
      </Section>

      <CtaBand
        title={t('howItWorks.cta.title')}
        actions={[
          { label: t('howItWorks.cta.primary'), to: paths.apply.merchant },
          { label: t('howItWorks.cta.secondary'), to: paths.services },
        ]}
      />
    </>
  );
};

export default HowItWorksPage;
