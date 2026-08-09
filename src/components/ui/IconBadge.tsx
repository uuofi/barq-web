import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './IconBadge.module.css';

interface IconBadgeProps {
  /** An icon component from `@/components/icons`. */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'squircle';
  tone?: 'default' | 'onDark' | 'solid' | 'success';
  className?: string;
}

/**
 * A decorative icon medallion.
 *
 * It renders no label and is always `aria-hidden` (inherited from the icon
 * set's own base props): every medallion on this site sits directly beside
 * real text that says the same thing. Announcing the icon too would make a
 * screen reader read every feature card's title twice.
 */
export const IconBadge = ({
  icon: Icon,
  size = 'md',
  shape = 'circle',
  tone = 'default',
  className,
}: IconBadgeProps) => (
  <span
    className={cn(
      styles.badge,
      styles[size],
      styles[shape],
      tone !== 'default' && styles[tone],
      className
    )}
  >
    <Icon />
  </span>
);

export default IconBadge;
