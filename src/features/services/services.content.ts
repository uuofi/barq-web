import type { ComponentType, SVGProps } from 'react';
import { BoltIcon, CalendarIcon, TruckIcon, PinIcon, HeadsetIcon } from '@/components/icons';

/** The five service cards, in reading order. */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface ServiceEntry {
  id: string;
  icon: IconComponent;
  titleKey: string;
  bodyKey: string;
}

export const SERVICES: ServiceEntry[] = [
  {
    id: 'instant',
    icon: BoltIcon,
    titleKey: 'services.item.instant',
    bodyKey: 'services.item.instantBody',
  },
  {
    id: 'scheduled',
    icon: CalendarIcon,
    titleKey: 'services.item.scheduled',
    bodyKey: 'services.item.scheduledBody',
  },
  {
    id: 'fleet',
    icon: TruckIcon,
    titleKey: 'services.item.fleet',
    bodyKey: 'services.item.fleetBody',
  },
  {
    id: 'tracking',
    icon: PinIcon,
    titleKey: 'services.item.tracking',
    bodyKey: 'services.item.trackingBody',
  },
  {
    id: 'support',
    icon: HeadsetIcon,
    titleKey: 'services.item.support',
    bodyKey: 'services.item.supportBody',
  },
];
