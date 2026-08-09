/**
 * The three pricing tiers, in the visual order of the approved design:
 * Enterprise, Business (highlighted, centre), Starter.
 *
 * `priceKey` resolves to a formatted string rather than a number — the
 * Enterprise tier's "price" is the words «اتفاق خاص», not an amount, and
 * modelling it as a nullable number would push that special case into the
 * component.
 */

export interface PricingPlan {
  id: 'enterprise' | 'business' | 'starter';
  nameKey: string;
  taglineKey: string;
  priceKey: string;
  /** false → the price is a phrase, so no "د.ع / شهرياً" suffix is shown. */
  hasNumericPrice: boolean;
  featureKeys: string[];
  ctaKey: string;
  /** The recommended tier. Exactly one plan may set this. */
  featured?: boolean;
  /** Where the tier's button goes. */
  action: 'apply' | 'contact';
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'enterprise',
    nameKey: 'pricing.plan.enterprise.name',
    taglineKey: 'pricing.plan.enterprise.tagline',
    priceKey: 'pricing.plan.enterprise.price',
    hasNumericPrice: false,
    featureKeys: [
      'pricing.plan.enterprise.feature1',
      'pricing.plan.enterprise.feature2',
      'pricing.plan.enterprise.feature3',
      'pricing.plan.enterprise.feature4',
      'pricing.plan.enterprise.feature5',
    ],
    ctaKey: 'pricing.plan.enterprise.cta',
    action: 'contact',
  },
  {
    id: 'business',
    nameKey: 'pricing.plan.business.name',
    taglineKey: 'pricing.plan.business.tagline',
    priceKey: 'pricing.plan.business.price',
    hasNumericPrice: true,
    featureKeys: [
      'pricing.plan.business.feature1',
      'pricing.plan.business.feature2',
      'pricing.plan.business.feature3',
      'pricing.plan.business.feature4',
      'pricing.plan.business.feature5',
    ],
    ctaKey: 'pricing.plan.business.cta',
    featured: true,
    action: 'apply',
  },
  {
    id: 'starter',
    nameKey: 'pricing.plan.starter.name',
    taglineKey: 'pricing.plan.starter.tagline',
    priceKey: 'pricing.plan.starter.price',
    hasNumericPrice: true,
    featureKeys: [
      'pricing.plan.starter.feature1',
      'pricing.plan.starter.feature2',
      'pricing.plan.starter.feature3',
      'pricing.plan.starter.feature4',
    ],
    ctaKey: 'pricing.plan.starter.cta',
    action: 'apply',
  },
];
