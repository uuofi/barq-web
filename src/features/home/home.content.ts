import type { ComponentType, SVGProps } from 'react';
import {
  BoltIcon,
  ShieldIcon,
  PinIcon,
  CalendarIcon,
  HeadsetIcon,
  WalletIcon,
  MotorbikeIcon,
  DocumentIcon,
  CheckCircleIcon,
} from '@/components/icons';

/**
 * Home page content as DATA, not JSX — same rationale as
 * `features/faq/faq.content.ts`: the "why us" grid and the two step-flows
 * are rendered by mapping over these arrays, so adding/reordering an item
 * never means touching markup, only this list.
 *
 * Labels are i18n KEYS (resolved with `t()` in the page), not literal
 * strings, so the English translation stays in lockstep automatically.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface FeatureItem {
  id: string;
  icon: IconComponent;
  labelKey: string;
}

/** "Why Al-Barq" icon row. Order is the READING order (first = rightmost in RTL). */
export const WHY_FEATURES: FeatureItem[] = [
  { id: 'fast-delivery', icon: BoltIcon, labelKey: 'home.feature.fastDelivery' },
  { id: 'trusted-safety', icon: ShieldIcon, labelKey: 'home.feature.trustedSafety' },
  { id: 'live-tracking', icon: PinIcon, labelKey: 'home.feature.liveTracking' },
  { id: 'daily-orders', icon: CalendarIcon, labelKey: 'home.feature.dailyOrders' },
  { id: 'support', icon: HeadsetIcon, labelKey: 'home.feature.support' },
];

export interface StatItem {
  id: string;
  /** Raw numeric value; formatted with `formatNumber` at render time. */
  value: number;
  /** Rendered before the number, e.g. "+". Empty string for none. */
  prefix: string;
  /** Rendered after the number, e.g. "%". Empty string for none. */
  suffix: string;
  labelKey: string;
}

export const STATS: StatItem[] = [
  { id: 'orders', value: 12_000, prefix: '+', suffix: '', labelKey: 'home.stat.orders' },
  { id: 'drivers', value: 450, prefix: '+', suffix: '', labelKey: 'home.stat.drivers' },
  { id: 'merchants', value: 220, prefix: '+', suffix: '', labelKey: 'home.stat.merchants' },
  { id: 'satisfaction', value: 98, prefix: '', suffix: '%', labelKey: 'home.stat.satisfaction' },
];

export interface FlowStep {
  id: string;
  icon: IconComponent;
  labelKey: string;
}

/** "For drivers" flow. Order is the READING order (first = rightmost). */
export const DRIVER_STEPS: FlowStep[] = [
  { id: 'receive-order', icon: WalletIcon, labelKey: 'home.driverStep.receiveOrder' },
  { id: 'head-to-pickup', icon: PinIcon, labelKey: 'home.driverStep.headToPickup' },
  { id: 'deliver', icon: MotorbikeIcon, labelKey: 'home.driverStep.deliver' },
  { id: 'collect-earnings', icon: WalletIcon, labelKey: 'home.driverStep.collectEarnings' },
];

/** "For merchants" flow. Order is the READING order (first = rightmost). */
export const MERCHANT_STEPS: FlowStep[] = [
  { id: 'create-order', icon: DocumentIcon, labelKey: 'home.merchantStep.createOrder' },
  { id: 'confirm-order', icon: CheckCircleIcon, labelKey: 'home.merchantStep.confirmOrder' },
  { id: 'driver-pickup', icon: MotorbikeIcon, labelKey: 'home.merchantStep.driverPickup' },
  { id: 'delivered', icon: CheckCircleIcon, labelKey: 'home.merchantStep.delivered' },
];
