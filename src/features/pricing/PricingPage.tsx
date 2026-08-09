import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import { cn } from '@/lib/utils/cn';
import { PageHero, Section, CheckList, Button } from '@/components/ui';
import { PRICING_PLANS } from './pricing.content';
import styles from './PricingPage.module.css';

/**
 * Pricing page.
 *
 * Bands: hero → the three tiers → footnote.
 *
 * There is no closing CTA band here, unlike every other page: the tier buttons
 * ARE the call to action, and adding a fourth one underneath would leave the
 * page with four competing primary actions.
 */
export const PricingPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('nav.pricing')} description={t('seo.pricing.description')} />

      <PageHero
        title={t('pricing.hero.title')}
        subtitle={t('pricing.hero.subtitle')}
        align="center"
      />

      <Section canvas="light" data-section="pricing">
        <div className={styles.plans}>
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(styles.plan, plan.featured && styles.featured)}
              data-plan={plan.id}
            >
              {plan.featured ? <span className={styles.badge}>{t('pricing.popular')}</span> : null}

              <h2 className={styles.name}>{t(plan.nameKey)}</h2>
              <p className={styles.tagline}>{t(plan.taglineKey)}</p>

              <div className={styles.priceRow}>
                <span className={cn(styles.price, !plan.hasNumericPrice && styles.priceText)}>
                  {t(plan.priceKey)}
                </span>
                {plan.hasNumericPrice ? (
                  <span className={styles.pricePeriod}>{t('pricing.perMonth')}</span>
                ) : null}
              </div>

              <CheckList
                className={styles.features}
                tone={plan.featured ? 'violet' : 'success'}
                items={plan.featureKeys.map((key) => t(key))}
              />

              <Button
                className={styles.action}
                to={plan.action === 'contact' ? paths.contact : paths.apply.merchant}
                variant={plan.featured ? 'primary' : 'light'}
                block
              >
                {t(plan.ctaKey)}
              </Button>
            </article>
          ))}
        </div>

        <p className={styles.footnote}>{t('pricing.footnote')}</p>
      </Section>
    </>
  );
};

export default PricingPage;
