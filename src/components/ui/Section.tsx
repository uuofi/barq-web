import type { ReactNode } from 'react';
import Container from '@/components/layout/Container';
import { cn } from '@/lib/utils/cn';
import styles from './Section.module.css';

export type SectionCanvas = 'ink' | 'light' | 'tint';

interface SectionProps {
  children: ReactNode;
  /** Background treatment. Bands alternate down the page. */
  canvas?: SectionCanvas;
  /** Adds the decorative violet radial wash. Ink canvas only. */
  glow?: boolean;
  /** Vertical rhythm override. */
  spacing?: 'default' | 'tight' | 'flush';
  size?: 'narrow' | 'default' | 'wide' | 'full';
  /** Anchor target, so the header/footer can deep-link into a band. */
  id?: string;
  className?: string;
  /** Debug/analytics hook, mirroring the existing `data-section` convention. */
  'data-section'?: string;
}

/**
 * A full-bleed page band with a width-constrained interior.
 *
 * `canvas` is the only thing a page needs to decide. Everything downstream —
 * heading colour, muted-text colour, medallion tint, card borders — is derived
 * from it in CSS via the canvas class, so a page never re-specifies "on ink,
 * the subtitle is #b7b3cf". That derivation is the reason the same
 * `SectionHeading` renders correctly on all three backgrounds.
 */
export const Section = ({
  children,
  canvas = 'light',
  glow = false,
  spacing = 'default',
  size = 'default',
  id,
  className,
  ...rest
}: SectionProps) => (
  <section
    id={id}
    className={cn(
      styles.section,
      styles[canvas],
      glow && styles.glow,
      spacing !== 'default' && styles[spacing],
      className
    )}
    {...rest}
  >
    <Container size={size}>{children}</Container>
  </section>
);

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Small pill above the title. */
  eyebrow?: string;
  /** Centred by default, matching the board; `start` for split layouts. */
  align?: 'center' | 'start';
  /** Heading level. Pages have one h1; bands inside them use h2. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

/**
 * The title/subtitle pair that opens almost every band on the site.
 *
 * `as` is separate from the visual size on purpose: the heading LEVEL is a
 * document-structure decision (one h1 per page, no skipped levels) while the
 * type scale is a visual one. Tying them together is how sites end up with an
 * h3 chosen because "h2 looked too big".
 */
export const SectionHeading = ({
  title,
  subtitle,
  eyebrow,
  align = 'center',
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) => (
  <div className={cn(styles.heading, align === 'start' && styles.headingStart, className)}>
    {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
    <Tag className={styles.title}>{title}</Tag>
    {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
  </div>
);

export default Section;
