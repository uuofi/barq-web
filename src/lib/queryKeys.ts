/**
 * Centralised React Query key factory.
 *
 * Hand-written key arrays are the classic source of cache bugs: one component
 * writes `['order', code]` and another invalidates `['orders', code]`, so the
 * refetch silently never happens. Deriving every key from this file makes
 * that impossible and gives invalidation a hierarchy:
 *
 *     queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
 *
 * invalidates every tracking query at once, because each specific key is
 * prefixed by its scope's `all`.
 */

export const queryKeys = {
  health: {
    all: ['health'] as const,
    status: () => [...queryKeys.health.all, 'status'] as const,
  },

  tracking: {
    all: ['tracking'] as const,
    byCode: (code: string) => [...queryKeys.tracking.all, 'code', code] as const,
  },

  content: {
    all: ['content'] as const,
    faq: (locale: string) => [...queryKeys.content.all, 'faq', locale] as const,
    legal: (document: string, locale: string) =>
      [...queryKeys.content.all, 'legal', document, locale] as const,
  },
} as const;

export default queryKeys;
