/**
 * Conditional className joiner.
 *
 * Deliberately dependency-free (no clsx/tailwind-merge): this site's styling
 * layer is plain CSS Modules + design tokens, so class conflict resolution is
 * not a concern — only conditional composition is.
 *
 *   cn('card', isActive && 'card--active', error ? 'is-error' : null)
 */
export type ClassValue = string | number | false | null | undefined;

export const cn = (...values: ClassValue[]): string =>
  values.filter((value): value is string | number => Boolean(value)).join(' ');

export default cn;
