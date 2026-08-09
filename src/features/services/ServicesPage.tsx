import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { serviceSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { GOVERNORATES, GOVERNORATE_LABELS } from '@/config/constants';
import { PageHero, Section, FeatureCard, FeatureGrid, CtaBand } from '@/components/ui';
import { SERVICES } from './services.content';

/**
 * Services page.
 *
 * Bands: hero → the 3×2 service grid → closing CTA.
 *
 * Carries `serviceSchema` rather than the home page's organisation/website
 * blocks: this is the page that actually describes what is offered and where,
 * so it is the one a crawler should read the service definition from.
 */
export const ServicesPage = () => {
  const { t } = useTranslation();

  const jsonLd = useMemo(
    () => [
      serviceSchema({
        name: t('services.hero.title'),
        description: t('seo.services.description'),
        areaServed: GOVERNORATES.map((id) => GOVERNORATE_LABELS[id]),
      }),
    ],
    [t]
  );

  return (
    <>
      <Seo
        title={t('nav.services')}
        description={t('seo.services.description')}
        jsonLd={jsonLd}
      />

      <PageHero
        title={t('services.hero.title')}
        subtitle={t('services.hero.subtitle')}
        align="center"
      />

      <Section canvas="light" data-section="services">
        <FeatureGrid columns={3}>
          {SERVICES.map((service) => (
            <FeatureCard
              key={service.id}
              icon={service.icon}
              title={t(service.titleKey)}
              body={t(service.bodyKey)}
              interactive
            />
          ))}
        </FeatureGrid>
      </Section>

      <CtaBand
        title={t('services.cta.title')}
        subtitle={t('services.cta.subtitle')}
        actions={[{ label: t('services.cta.button'), to: paths.contact }]}
      />
    </>
  );
};

export default ServicesPage;
