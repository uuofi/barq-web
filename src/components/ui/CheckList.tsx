import type { ReactNode } from 'react';
import { CheckCircleIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './CheckList.module.css';

interface CheckListProps {
  items: readonly string[];
  /** Optional card heading. Omit to render a bare list inside another card. */
  title?: string;
  /** Wraps the list in the white card surface. */
  card?: boolean;
  /** Two columns at desktop width. */
  columns?: boolean;
  /** Violet ticks instead of the default green. */
  tone?: 'success' | 'violet';
  className?: string;
  children?: ReactNode;
}

/**
 * A list of included features, each prefixed with a tick.
 *
 * The tick is `aria-hidden` and carries no meaning on its own — every row is
 * an included item, so the icon is redundant decoration rather than a
 * per-row status. A list that mixed included and excluded rows would need a
 * textual state per row, not just a colour change, and is deliberately not
 * something this component can express.
 */
export const CheckList = ({
  items,
  title,
  card = false,
  columns = false,
  tone = 'success',
  className,
  children,
}: CheckListProps) => {
  const list = (
    // `role="list"` is redundant markup in theory and required in practice:
    // it is what the reset keys its marker removal off, and it restores the
    // list semantics Safari drops from any `list-style: none` list.
    <ul role="list" className={cn(styles.list, columns && styles.columns)}>
      {items.map((item) => (
        <li key={item} className={styles.item}>
          <CheckCircleIcon className={styles.tick} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  if (!card) {
    return <div className={cn(tone === 'violet' && styles.violet, className)}>{list}</div>;
  }

  return (
    <div className={cn(styles.card, tone === 'violet' && styles.violet, className)}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {list}
      {children}
    </div>
  );
};

export default CheckList;
