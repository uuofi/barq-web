import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { isExternalUrl } from '@/lib/utils/url';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'outline' | 'light' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretches to the container width — used by forms and mobile CTAs. */
  block?: boolean;
  /** Swaps the label for a spinner and blocks re-submission. */
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps | 'type'> & {
    to?: never;
    href?: never;
    type?: 'button' | 'submit' | 'reset';
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps | 'href'> & {
    /** Internal route — renders a react-router <Link>. */
    to: string;
    href?: never;
  };

type ButtonAsAnchor = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps | 'href'> & {
    /** Off-site or protocol URL (tel:, mailto:) — renders a plain <a>. */
    href: string;
    to?: never;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

/**
 * One button, three possible elements.
 *
 * A CTA in this design is sometimes a real action (submit a form), sometimes
 * an internal route ("سجل كتاجر" → /apply/merchant), and sometimes an outbound
 * link (a phone number). They must be visually identical but semantically
 * distinct: rendering a route as a <button> with onClick would break
 * middle-click, "open in new tab", and the browser's own link affordances,
 * while rendering an action as an <a href="#"> is worse still. So the element
 * is chosen from the props rather than being fixed.
 *
 * External URLs additionally get `rel="noreferrer"` — a `target="_blank"` link
 * without it hands the opened page a live `window.opener` handle.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  children,
  className,
  ...rest
}: ButtonProps) => {
  const classes = cn(
    styles.button,
    styles[variant],
    size !== 'md' && styles[size],
    block && styles.block,
    className
  );

  const body = loading ? (
    <>
      <span className={styles.spinner} aria-hidden="true" />
      {children}
    </>
  ) : (
    children
  );

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkProps } = rest as ButtonAsLink;
    return (
      <Link to={to} className={classes} {...linkProps}>
        {body}
      </Link>
    );
  }

  if ('href' in rest && rest.href !== undefined) {
    const { href, target, rel, ...anchorProps } = rest as ButtonAsAnchor;
    const external = isExternalUrl(href);
    return (
      <a
        href={href}
        className={classes}
        target={target ?? (external ? '_blank' : undefined)}
        rel={rel ?? (external ? 'noreferrer' : undefined)}
        {...anchorProps}
      >
        {body}
      </a>
    );
  }

  const { type = 'button', disabled, ...buttonProps } = rest as ButtonAsButton;
  return (
    <button
      type={type}
      className={classes}
      // A loading button must not accept a second click — that is how
      // duplicate applications get submitted.
      disabled={disabled || loading}
      {...buttonProps}
    >
      {body}
    </button>
  );
};

export default Button;
