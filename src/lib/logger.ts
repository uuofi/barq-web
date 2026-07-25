import { env } from '@/config/env';

/**
 * Thin logging seam.
 *
 * Components and lib code call `logger.*` instead of `console.*` so that:
 *  - dev noise (debug/info) disappears from production bundles' output;
 *  - errors have ONE exit point, which is where a future Sentry/LogRocket
 *    integration plugs in — `setErrorReporter` below — without touching a
 *    single call site.
 */

type LogContext = Record<string, unknown>;

/** Installed by the app shell if/when an error-reporting SDK is added. */
type ErrorReporter = (error: unknown, context?: LogContext) => void;

let reportError: ErrorReporter | null = null;

export const setErrorReporter = (reporter: ErrorReporter | null): void => {
  reportError = reporter;
};

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (env.isDev) console.debug(`[barq] ${message}`, context ?? '');
  },

  info(message: string, context?: LogContext): void {
    if (env.isDev) console.info(`[barq] ${message}`, context ?? '');
  },

  warn(message: string, context?: LogContext): void {
    console.warn(`[barq] ${message}`, context ?? '');
  },

  /**
   * Always logged, and always forwarded to the reporter when one is
   * installed. `error` accepts an Error or any thrown value.
   */
  error(message: string, contextOrError?: LogContext | unknown): void {
    console.error(`[barq] ${message}`, contextOrError ?? '');
    if (reportError) {
      const isContext =
        typeof contextOrError === 'object' &&
        contextOrError !== null &&
        !(contextOrError instanceof Error);
      reportError(
        contextOrError instanceof Error ? contextOrError : new Error(message),
        isContext ? (contextOrError as LogContext) : undefined
      );
    }
  },
};

export default logger;
