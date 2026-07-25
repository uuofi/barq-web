import type { ComponentType, SVGProps } from 'react';
import { WalletIcon, CalendarIcon, HeadsetIcon, PinIcon } from '@/components/icons';

/**
 * Driver section content as DATA — same rationale as `home/home.content.ts`.
 * The "how it works" flow reuses `DRIVER_STEPS` from home.content.ts rather
 * than duplicating it; this file only holds what's specific to the section.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface DriverBenefit {
  id: string;
  icon: IconComponent;
  labelKey: string;
}

/** Reading order (first = rightmost in RTL) — same convention as WHY_FEATURES. */
export const DRIVER_BENEFITS: DriverBenefit[] = [
  { id: 'nearby-orders', icon: PinIcon, labelKey: 'drivers.benefit.nearbyOrders' },
  { id: 'support', icon: HeadsetIcon, labelKey: 'drivers.benefit.support' },
  { id: 'flexible-hours', icon: CalendarIcon, labelKey: 'drivers.benefit.flexibleHours' },
  { id: 'daily-earnings', icon: WalletIcon, labelKey: 'drivers.benefit.dailyEarnings' },
];
