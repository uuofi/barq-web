import type { ComponentType, SVGProps } from 'react';
import {
  BoltIcon,
  ShieldIcon,
  PinIcon,
  HeadsetIcon,
  PersonIcon,
  DocumentIcon,
  RouteIcon,
  BoxIcon,
  MotorbikeIcon,
  CheckCircleIcon,
} from '@/components/icons';
import appDriverImg from '@/assets/app-driver.jpg';
import appMerchantImg from '@/assets/app-merchant.jpg';

/**
 * Home page content as DATA, not JSX — same rationale as
 * `features/faq/faq.content.ts`: the "why us" grid and the step flow are
 * rendered by mapping over these arrays, so adding or reordering an item never
 * means touching markup, only this list.
 *
 * Labels are i18n KEYS (resolved with `t()` in the page), not literal strings,
 * so the English translation stays in lockstep automatically.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface FeatureItem {
  id: string;
  icon: IconComponent;
  labelKey: string;
  bodyKey: string;
}

/** "لماذا برق؟" grid. Order is the READING order (first = rightmost in RTL). */
export const WHY_FEATURES: FeatureItem[] = [
  {
    id: 'fast-delivery',
    icon: BoltIcon,
    labelKey: 'home.feature.fastDelivery',
    bodyKey: 'home.feature.fastDeliveryBody',
  },
  {
    id: 'trusted-safety',
    icon: ShieldIcon,
    labelKey: 'home.feature.trustedSafety',
    bodyKey: 'home.feature.trustedSafetyBody',
  },
  {
    id: 'live-tracking',
    icon: PinIcon,
    labelKey: 'home.feature.liveTracking',
    bodyKey: 'home.feature.liveTrackingBody',
  },
  {
    id: 'support',
    icon: HeadsetIcon,
    labelKey: 'home.feature.support',
    bodyKey: 'home.feature.supportBody',
  },
];

export interface StepItem {
  id: string;
  icon: IconComponent;
  labelKey: string;
  captionKey: string;
}

/** "كيف يعمل برق؟" flow. Order is the READING order (first = rightmost). */
export const HOW_STEPS: StepItem[] = [
  {
    id: 'register',
    icon: PersonIcon,
    labelKey: 'home.step.register',
    captionKey: 'home.step.registerBody',
  },
  {
    id: 'create-order',
    icon: DocumentIcon,
    labelKey: 'home.step.createOrder',
    captionKey: 'home.step.createOrderBody',
  },
  { id: 'match', icon: RouteIcon, labelKey: 'home.step.match', captionKey: 'home.step.matchBody' },
  { id: 'pickup', icon: BoxIcon, labelKey: 'home.step.pickup', captionKey: 'home.step.pickupBody' },
  {
    id: 'deliver',
    icon: MotorbikeIcon,
    labelKey: 'home.step.deliver',
    captionKey: 'home.step.deliverBody',
  },
  {
    id: 'confirm',
    icon: CheckCircleIcon,
    labelKey: 'home.step.confirm',
    captionKey: 'home.step.confirmBody',
  },
];

export interface AppItem {
  id: string;
  titleKey: string;
  bodyKey: string;
  /**
   * Photo slot. `null` renders the placeholder frame instead of an <img> —
   * kept as an option so a future card can ship without art ready yet.
   */
  image: { src: string; width: number; height: number } | null;
}

/**
 * "تطبيقات برق" showcase. Driver and merchant only — the admin dashboard
 * card was dropped on request, leaving the two end-user apps.
 *
 * Both images are 1000×666 JPEGs re-encoded from the 1537×1023 originals
 * supplied for this card (`app-driver.jpg` / `app-merchant.jpg`) — the
 * source PNGs were ~2MB each with no transparency, so JPEG at this size
 * carries the same detail for a fraction of the weight.
 */
export const APPS: AppItem[] = [
  {
    id: 'driver',
    titleKey: 'home.app.driver',
    bodyKey: 'home.app.driverBody',
    image: { src: appDriverImg, width: 1000, height: 666 },
  },
  {
    id: 'merchant',
    titleKey: 'home.app.merchant',
    bodyKey: 'home.app.merchantBody',
    image: { src: appMerchantImg, width: 1000, height: 666 },
  },
];
