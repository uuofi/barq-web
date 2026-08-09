import type { ComponentPropsWithoutRef } from 'react';
// `logo-icon.png` is a 128×128 downscale of `logo.png` (source: 1600×1600,
// 2.9MB) generated once for this use — the header/footer render the mark at
// ~1.4em, so shipping the full-resolution file on every page would cost
// nearly 3MB for a ~28px icon. 128px still covers ~4.5x pixel density at
// that display size.
import logoSrc from '@/assets/logo-icon.png';

type LogoProps = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'>;

/**
 * The brand mark — the bolt logomark, not an icon standing in for it.
 *
 * Rendered once here rather than inline in the header and footer so the two
 * never drift (one importing the asset, the other still on `BoltIcon`, say).
 * `alt=""`: the mark is always paired with the wordmark text right next to
 * it (see `SiteHeader`/`SiteFooter`), so a screen reader announcing the logo
 * again would repeat "برق" back to back.
 */
export const Logo = (props: LogoProps) => (
  <img src={logoSrc} alt="" width={128} height={128} decoding="async" {...props} />
);

export default Logo;
