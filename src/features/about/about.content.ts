import type { ComponentType, SVGProps } from 'react';
import { BoltIcon, ShieldIcon, ApertureIcon, LightbulbIcon, UsersIcon } from '@/components/icons';

/**
 * About page content as DATA — same rationale as `features/home/home.content.ts`.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface JourneyMilestone {
  id: string;
  /** Gregorian year shown on the card; formatted with `formatNumber` at render time. */
  year: number;
  hijriKey: string;
  titleKey: string;
  descriptionKey: string;
  /** The single accent card closing the roadmap — no year, gradient surface. */
  highlighted?: boolean;
}

/**
 * The roadmap grid is rendered inside a `direction: ltr` wrapper (see
 * `.journeyGrid` in AboutPage.module.css) so the timeline always reads
 * left → right like a chronology, matching the approved design — the same
 * reasoning as the home hero's `.heroInner` override. Order here is
 * therefore chronological, not RTL reading order.
 */
export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: 'growth',
    year: 2026,
    hijriKey: 'about.journey.growth.hijri',
    titleKey: 'about.journey.growth.title',
    descriptionKey: 'about.journey.growth.description',
  },
  {
    id: 'launch',
    year: 2026,
    hijriKey: 'about.journey.launch.hijri',
    titleKey: 'about.journey.launch.title',
    descriptionKey: 'about.journey.launch.description',
  },
  {
    id: 'expansion',
    year: 2026,
    hijriKey: 'about.journey.expansion.hijri',
    titleKey: 'about.journey.expansion.title',
    descriptionKey: 'about.journey.expansion.description',
  },
  {
    id: 'future',
    year: 2026,
    hijriKey: 'about.journey.future.hijri',
    titleKey: 'about.journey.future.title',
    descriptionKey: 'about.journey.future.description',
    highlighted: true,
  },
];

export interface ValueItem {
  id: string;
  icon: IconComponent;
  labelKey: string;
}

/**
 * "Our values" icon row. Order is READING order (first = rightmost in RTL),
 * same convention as `home.content.ts` WHY_FEATURES — visually left → right
 * this renders speed, security, transparency, innovation, teamwork.
 */
export const VALUES: ValueItem[] = [
  { id: 'teamwork', icon: UsersIcon, labelKey: 'about.value.teamwork' },
  { id: 'innovation', icon: LightbulbIcon, labelKey: 'about.value.innovation' },
  { id: 'transparency', icon: ApertureIcon, labelKey: 'about.value.transparency' },
  { id: 'security', icon: ShieldIcon, labelKey: 'about.value.security' },
  { id: 'speed', icon: BoltIcon, labelKey: 'about.value.speed' },
];
