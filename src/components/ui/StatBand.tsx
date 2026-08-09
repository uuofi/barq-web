import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './StatBand.module.css';

export interface Stat {
  value: string;
  label: string;
}

interface StatBandProps {
  stats: readonly Stat[];
  /** Drops the violet gradient — the Cities page treatment. */
  plain?: boolean;
  className?: string;
}

/**
 * A row of headline figures.
 *
 * Each figure is a `<dt>`/`<dd>` pair inside a description list: the number is
 * meaningless without its label, and a definition list is the one structure
 * that states that relationship rather than leaving two adjacent spans for the
 * reader to associate. The value is marked as the description and the label as
 * the term, so "عميل مسجل: +12,000" is what gets announced.
 */
export const StatBand = ({ stats, plain = false, className }: StatBandProps) => (
  <dl
    className={cn(styles.band, plain && styles.plain, className)}
    style={{ '--stat-columns': stats.length } as CSSProperties}
  >
    {stats.map((stat) => (
      <div key={stat.label} className={styles.item}>
        <dd className={styles.value}>{stat.value}</dd>
        <dt className={styles.label}>{stat.label}</dt>
      </div>
    ))}
  </dl>
);

export default StatBand;
