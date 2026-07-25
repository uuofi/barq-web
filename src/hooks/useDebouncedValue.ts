import { useEffect, useState } from 'react';

/**
 * Debounces a rapidly-changing value.
 *
 * Used by search-style inputs (order tracking) so a query fires once the
 * visitor stops typing instead of on every keystroke. Debouncing the VALUE
 * rather than the callback keeps it usable as a React Query key directly:
 *
 *   const debounced = useDebouncedValue(code, 400);
 *   useQuery({ queryKey: queryKeys.tracking.byCode(debounced), ... })
 */
export const useDebouncedValue = <T>(value: T, delayMs = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export default useDebouncedValue;
