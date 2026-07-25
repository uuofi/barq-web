import type { ComponentType, SVGProps } from 'react';
import { WalletIcon, DocumentIcon, HeadsetIcon, MotorbikeIcon } from '@/components/icons';

/**
 * Merchant section content as DATA — same rationale as `home/home.content.ts`.
 * The "how it works" flow reuses `MERCHANT_STEPS` from home.content.ts rather
 * than duplicating it; this file only holds what's specific to the section.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface MerchantBenefit {
  id: string;
  icon: IconComponent;
  labelKey: string;
}

/** Reading order (first = rightmost in RTL) — same convention as WHY_FEATURES. */
export const MERCHANT_BENEFITS: MerchantBenefit[] = [
  { id: 'fast-delivery', icon: MotorbikeIcon, labelKey: 'merchants.benefit.fastDelivery' },
  { id: 'support', icon: HeadsetIcon, labelKey: 'merchants.benefit.support' },
  { id: 'dashboard', icon: DocumentIcon, labelKey: 'merchants.benefit.dashboard' },
  { id: 'earnings', icon: WalletIcon, labelKey: 'merchants.benefit.earnings' },
];
