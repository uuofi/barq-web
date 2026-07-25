import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ContainerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'className'> {
  /** Optional: a section skeleton with no content yet is a valid state. */
  children?: ReactNode;
  /** Renders as a different element — `section`, `article`, `header`… */
  as?: ElementType;
  /** Layout width. Maps to a token in styles/tokens.css. */
  size?: 'narrow' | 'default' | 'wide' | 'full';
  className?: string;
}

/**
 * The site's single horizontal-rhythm primitive.
 *
 * Every page section wraps its content in one of these instead of setting its
 * own max-width and padding. That is what keeps a 12-page marketing site from
 * drifting into eight slightly different gutter widths — the classic failure
 * mode when each page is built in isolation.
 *
 * It applies no visual styling of its own beyond width/gutters; the concrete
 * values live in tokens.css so they can be retuned globally.
 *
 * Remaining props are forwarded to the rendered element. That matters for the
 * `data-page` / `data-section` hooks the pages set: without the spread they
 * would be silently swallowed, and TypeScript would not catch it — JSX
 * exempts hyphenated attribute names from excess-property checking.
 */
export const Container = ({
  children,
  as: Element = 'div',
  size = 'default',
  className,
  ...rest
}: ContainerProps) => (
  <Element className={cn('container', `container--${size}`, className)} {...rest}>
    {children}
  </Element>
);

export default Container;
