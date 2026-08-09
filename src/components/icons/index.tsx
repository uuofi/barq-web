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

export const TruckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2.5 7.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9h-11v-9Z" />
    <path d="M13.5 10h3.2a1 1 0 0 1 .8.4l2.6 3.4a1 1 0 0 1 .2.6v2.1h-6.8" />
    <circle cx="7" cy="18" r="1.9" />
    <circle cx="17" cy="18" r="1.9" />
  </svg>
);

export const ApiIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
    <path d="M8 15V9h2.2a1.8 1.8 0 0 1 0 3.6H8M13.6 9v6M16.4 9h2.1M16.4 15h2.1M16.4 9v6" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 16.5v-4M12 16.5v-8M16 16.5v-5.5M20 16.5v-9" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const PhoneIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5Z" />
    <path d="M10.5 17.5h3" />
  </svg>
);

export const CallIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7.2 3.8 9 3.2a1 1 0 0 1 1.2.6l1 2.6a1 1 0 0 1-.3 1.1L9.4 8.8a12 12 0 0 0 5.8 5.8l1.3-1.5a1 1 0 0 1 1.1-.3l2.6 1a1 1 0 0 1 .6 1.2l-.6 1.8a1.6 1.6 0 0 1-1.7 1.1A15.5 15.5 0 0 1 5.5 5.5a1.6 1.6 0 0 1 1.7-1.7Z" />
  </svg>
);

export const MailIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="m3.2 6.5 8.8 6 8.8-6" />
  </svg>
);

export const UploadIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 15.5V4M8.2 7.8 12 4l3.8 3.8" />
    <path d="M4 15v3.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V15" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const SparkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
  </svg>
);

export const HandshakeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m12 8.5-2 2a1.6 1.6 0 0 1-2.3-2.3l2.6-2.6a2 2 0 0 1 1.4-.6h2.6a2 2 0 0 1 1.4.6l2.8 2.8" />
    <path d="M3.5 8.4 6 5.9M20.5 8.4 18 5.9" />
    <path d="m12 8.5 4.6 4.6a1.6 1.6 0 0 1-2.3 2.3l-.7-.7-.8.8a1.6 1.6 0 0 1-2.3-2.3" />
    <path d="M10.5 13.2a1.6 1.6 0 0 1-2.3 2.3l-.8-.8" />
  </svg>
);

export const RouteIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M15.5 6H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8.5" />
  </svg>
);

export const BuildingIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20V6.5a1 1 0 0 1 .7-1l6-1.9a1 1 0 0 1 1.3 1V20" />
    <path d="M12 10h6.5a1 1 0 0 1 1 1v9M2.5 20h19" />
    <path d="M7 9h2M7 12.5h2M15 13.5h1.5M15 16.5h1.5" />
  </svg>
);

export const RestaurantIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6.5 3v7a2.5 2.5 0 0 0 5 0V3M9 10.5V21" />
    <path d="M17.5 3c-1.4 1-2 2.6-2 4.5s.6 3.2 2 4V21" />
  </svg>
);

export const PharmacyIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const BoxIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.2 20 7v10l-8 3.8L4 17V7l8-3.8Z" />
    <path d="M4 7.2 12 11l8-3.8M12 11v9.6" />
  </svg>
);

export const LockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </svg>
);

export const IdCardIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <circle cx="8.5" cy="11" r="2.2" />
    <path d="M5.2 16c.6-1.6 1.8-2.4 3.3-2.4s2.7.8 3.3 2.4M14.5 10h4M14.5 13.5h4" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const FacebookIcon = (props: IconProps) => (
  <svg {...base({ ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.12V9.9H7.6V13h2.7v8h3.2Z" />
  </svg>
);

export const InstagramIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const XIcon = (props: IconProps) => (
  <svg {...base({ ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="M17.2 3h3.3l-7.2 8.2L21.8 21h-6.6l-4.3-5.6L5.9 21H2.6l7.7-8.8L2.5 3h6.8l3.9 5.2L17.2 3Zm-1.2 16h1.8L8.1 4.9H6.1L16 19Z" />
  </svg>
);

export const LinkedinIcon = (props: IconProps) => (
  <svg {...base({ ...props, fill: 'currentColor', stroke: 'none' })}>
    <path d="M6.9 20.5H3.6V9.4h3.3v11.1ZM5.25 7.95a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8ZM20.5 20.5h-3.3v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85v5.5H10V9.4h3.16v1.52h.05a3.47 3.47 0 0 1 3.12-1.71c3.34 0 3.96 2.2 3.96 5.06v6.23Z" />
  </svg>
);
