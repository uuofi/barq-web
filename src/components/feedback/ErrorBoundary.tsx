import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/lib/logger';

/**
 * Generic React error boundary.
 *
 * Must be a class component: React exposes no hook equivalent of
 * `componentDidCatch`. Used twice — once outside all providers (AppProviders)
 * and once around <Outlet /> (RootLayout) — so a page crash never takes the
 * navigation down with it.
 *
 * The fallback copy is intentionally NOT translated: this boundary also wraps
 * the i18n provider, so `t()` may be exactly what failed. Hardcoded Arabic is
 * the reliable choice at this layer.
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('React render error', {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;
    if (fallback) return fallback(error, this.reset);

    return (
      <section role="alert" data-state="render-error">
        <h2>تعذّر عرض هذا الجزء</h2>
        <p>حدث خطأ أثناء عرض الصفحة. جرّب إعادة التحميل.</p>
        <button type="button" onClick={() => window.location.reload()}>
          إعادة تحميل الصفحة
        </button>
      </section>
    );
  }
}

export default ErrorBoundary;
