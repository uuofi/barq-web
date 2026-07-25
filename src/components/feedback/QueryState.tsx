import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RequestError } from '@/lib/http/RequestError';
import PageLoader from './PageLoader';

interface QueryStateProps<T> {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  /** Rendered when the request succeeded and returned data. */
  children: (data: T) => ReactNode;
  /** Rendered when the request succeeded but there is nothing to show. */
  empty?: ReactNode;
  /** Treats a successful-but-empty result as the empty state. */
  isEmpty?: (data: T) => boolean;
  onRetry?: () => void;
}

/**
 * The one place loading / error / empty / success branching is written.
 *
 * Without a component like this, every data-driven page reimplements the same
 * four-way branch and they drift: one shows a raw error string, another shows
 * nothing at all on a network failure. Here the error copy is chosen ONCE
 * from `RequestError`'s classifiers, and retry is only offered when a retry
 * could actually succeed.
 */
export function QueryState<T>({
  isLoading,
  error,
  data,
  children,
  empty,
  isEmpty,
  onRetry,
}: QueryStateProps<T>) {
  const { t } = useTranslation();

  if (isLoading) return <PageLoader />;

  if (error) {
    const requestError = RequestError.is(error) ? error : null;
    const message = requestError
      ? requestError.isNetworkError
        ? t('errors.network')
        : requestError.message
      : t('errors.generic');

    return (
      <div role="alert" data-state="query-error">
        <p>{message}</p>
        {/* Offering "retry" on a 404 is a lie — it will fail identically. */}
        {onRetry && (!requestError || requestError.isRetryable) && (
          <button type="button" onClick={onRetry}>
            {t('common.retry')}
          </button>
        )}
      </div>
    );
  }

  if (data === undefined) return null;
  if (isEmpty?.(data)) return <>{empty ?? null}</>;

  return <>{children(data)}</>;
}

export default QueryState;
