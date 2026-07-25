import type { SVGProps } from 'react';

/**
 * The curved transition from the dark hero to the light section beneath it.
 *
 * A single reusable shape rather than inlined per-page: the curve's control
 * points are tuned once here, and `fill="currentColor"` lets each caller pick
 * the colour (the section it's fading INTO) via a CSS `color` on the wrapper,
 * instead of duplicating the path with a different hardcoded fill.
 */
export const WaveDivider = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1440 110"
    preserveAspectRatio="none"
    aria-hidden="true"
    fill="currentColor"
    {...props}
  >
    <path d="M0,64 C240,110 480,20 720,36 C960,52 1200,96 1440,58 L1440,110 L0,110 Z" />
  </svg>
);

export default WaveDivider;
