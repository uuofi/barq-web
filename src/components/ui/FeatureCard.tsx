import type { ComponentType, CSSProperties, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils/cn';
import IconBadge from './IconBadge';
import styles from './FeatureCard.module.css';

interface FeatureGridProps {
  children: ReactNode;
  /** Columns at desktop width. Steps down to 2, then 1, automatically. */
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * The grid every feature row on the site uses.
 *
 * The column count travels as a CSS custom property rather than a class per
 * count, so the responsive step-down rules live in exactly one place in the
 * stylesheet instead of being repeated for `.cols3`, `.cols4`, `.cols5`.
 */
export const FeatureGrid = ({ children, columns = 3, className }: FeatureGridProps) => (
  <div
    className={cn(styles.grid, className)}
    style={{ '--feature-columns': columns } as CSSProperties}
  >
    {children}
  </div>
);

interface FeatureCardProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body?: string;
  /** Centres the medallion and text — the "why us" / "values" treatment. */
  centered?: boolean;
  /** Restyles for the ink canvas. */
  onDark?: boolean;
  /** Adds the hover lift. Only for cards that are actually clickable. */
  interactive?: boolean;
  badgeSize?: 'sm' | 'md' | 'lg' | 'xl';
  children?: ReactNode;
  className?: string;
}

export const FeatureCard = ({
  icon,
  title,
  body,
  centered = false,
  onDark = false,
  interactive = false,
  badgeSize = 'lg',
  children,
  className,
}: FeatureCardProps) => (
  <article
    className={cn(
      styles.card,
      centered && styles.centered,
      onDark && styles.onDark,
      interactive && styles.interactive,
      className
    )}
  >
    {icon ? (
      <IconBadge
        icon={icon}
        size={badgeSize}
        shape={centered ? 'circle' : 'squircle'}
        tone={onDark ? 'onDark' : 'default'}
        className={styles.badge}
      />
    ) : null}
    <h3 className={styles.title}>{title}</h3>
    {body ? <p className={styles.body}>{body}</p> : null}
    {children}
  </article>
);

export default FeatureCard;
