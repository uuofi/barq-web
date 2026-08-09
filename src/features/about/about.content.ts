import type { ComponentType, SVGProps } from 'react';
import { BoltIcon, ShieldIcon, EyeIcon, LightbulbIcon, UsersIcon } from '@/components/icons';

/**
 * About page content as data. See `home.content.ts` for the rationale — the
 * timeline and the values row are rendered by mapping over these arrays, and
 * every label is an i18n key rather than a literal string.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface JourneyEntry {
  id: string;
  yearKey: string;
  titleKey: string;
  descriptionKey: string;
}

/**
 * The timeline, in chronological order. Rendered right-to-left in Arabic, so
 * the earliest entry sits at the start of the reading direction.
 */
export const JOURNEY: JourneyEntry[] = [
  {
    id: 'launch',
    yearKey: 'about.journey.launch.year',
    titleKey: 'about.journey.launch.title',
    descriptionKey: 'about.journey.launch.description',
  },
  {
    id: 'growth',
    yearKey: 'about.journey.growth.year',
    titleKey: 'about.journey.growth.title',
    descriptionKey: 'about.journey.growth.description',
  },
  {
    id: 'expansion',
    yearKey: 'about.journey.expansion.year',
    titleKey: 'about.journey.expansion.title',
    descriptionKey: 'about.journey.expansion.description',
  },
  {
    id: 'future',
    yearKey: 'about.journey.future.year',
    titleKey: 'about.journey.future.title',
    descriptionKey: 'about.journey.future.description',
  },
];

export interface ValueEntry {
  id: string;
  icon: IconComponent;
  labelKey: string;
  bodyKey: string;
}

export const VALUES: ValueEntry[] = [
  {
    id: 'speed',
    icon: BoltIcon,
    labelKey: 'about.value.speed',
    bodyKey: 'about.value.speedBody',
  },
  {
    id: 'security',
    icon: ShieldIcon,
    labelKey: 'about.value.security',
    bodyKey: 'about.value.securityBody',
  },
  {
    id: 'transparency',
    icon: EyeIcon,
    labelKey: 'about.value.transparency',
    bodyKey: 'about.value.transparencyBody',
  },
  {
    id: 'innovation',
    icon: LightbulbIcon,
    labelKey: 'about.value.innovation',
    bodyKey: 'about.value.innovationBody',
  },
  {
    id: 'teamwork',
    icon: UsersIcon,
    labelKey: 'about.value.teamwork',
    bodyKey: 'about.value.teamworkBody',
  },
];
