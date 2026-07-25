import type { SVGProps } from 'react';

/**
 * The site's icon set — stroke-based SVGs, no icon library dependency.
 *
 * Every icon shares one visual language on purpose (per the UI/UX style
 * rule "icon-style-consistent"): 24×24 viewBox, 1.75 stroke, round caps/joins,
 * `currentColor` so an icon inherits its container's color instead of a
 * hardcoded fill. Decorative icons carry `aria-hidden` — the adjacent text
 * label is what a screen reader announces, so the icon never speaks twice.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const BoltIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export const PersonIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </svg>
);

export const StoreIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
    <path d="M3 5h18l1.2 4.2a2 2 0 0 1-2 2.3 2.2 2.2 0 0 1-2.2-2M3 5l-1.2 4.2a2 2 0 0 0 2 2.3 2.2 2.2 0 0 0 2.2-2m0 0a2.2 2.2 0 0 0 2.2 2 2.2 2.2 0 0 0 2.2-2m0 0a2.2 2.2 0 0 0 2.2 2 2.2 2.2 0 0 0 2.2-2m0 0a2.2 2.2 0 0 0 2.2 2 2.2 2.2 0 0 0 2.2-2.3L21 5" />
    <path d="M9 20v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
  </svg>
);

export const ShieldIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3 5 5.5v5.2c0 4.5 2.9 8.2 7 9.3 4.1-1.1 7-4.8 7-9.3V5.5L12 3Z" />
    <path d="m9.2 12 2 2 3.6-4" />
  </svg>
);

export const PinIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

export const CalendarIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
  </svg>
);

export const HeadsetIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <rect x="3" y="13" width="4" height="6" rx="1.5" />
    <rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M19 19.5v.5a3 3 0 0 1-3 3h-2.5" />
  </svg>
);

export const WalletIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h11a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 17 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
    <path d="M15.5 13a1.5 1.5 0 1 0 0-.01" />
    <path d="M3.5 9.5h16" />
  </svg>
);

export const MotorbikeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="6" cy="17" r="2.5" />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M8.3 17h7.4M11 17l1.5-5.5H9l1-3h4l1.8 4.3 2.8 1.2c.9.4 1.4 1.3 1.4 2.2v1" />
    <path d="M4 12.5 6 9h3" />
  </svg>
);

export const DocumentIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
    <path d="M14 3.5v4h4M9 12.5h6M9 16h6" />
  </svg>
);

export const CheckCircleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.3 12.2 2.4 2.4 5-5.2" />
  </svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const EyeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </svg>
);

export const TargetIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const ApertureIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5 15.5 12 12 16.5 8.5 12Z" />
  </svg>
);

export const LightbulbIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 18.5h6M10 21h4" />
    <path d="M12 3a6.5 6.5 0 0 0-4 11.6c.7.6 1.1 1.4 1.1 2.4h5.8c0-1 .4-1.8 1.1-2.4A6.5 6.5 0 0 0 12 3Z" />
  </svg>
);

export const UsersIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="8.5" cy="8" r="3" />
    <circle cx="16.3" cy="9.2" r="2.4" />
    <path d="M2.8 20c.9-3.6 3.1-5.5 5.7-5.5s4.8 1.9 5.7 5.5" />
    <path d="M14.9 15c2 .3 3.5 1.9 4.3 5" />
  </svg>
);
