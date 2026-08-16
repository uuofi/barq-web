import { env } from '@/config/env';
import { logger } from '@/lib/logger';

/**
 * Vendor-agnostic analytics seam.
 *
 * The site must never import a vendor SDK directly in a component. Everything
 * goes through `analytics.track(...)`, which is a NO-OP until a provider is
 * installed via `setAnalyticsProvider`. Consequences:
 *
 *  - swapping GA for Plausible/PostHog touches exactly one file;
 *  - no third-party script loads before consent (see `hasConsent` below),
 *    which is what makes the cookie-consent gate actually meaningful rather
 *    than decorative;
 *  - event names are a typed union, so a renamed event breaks the build
 *    instead of quietly splitting a funnel in two.
 */

/** Every event the site is allowed to emit. Add here first, then call it. */
export type AnalyticsEvent =
  | { name: 'page_view'; path: string; title?: string }
  | { name: 'cta_click'; id: string; location: string }
  | { name: 'app_download_click'; platform: 'ios' | 'android' | 'apk' }
  | { name: 'lead_submitted'; role: 'merchant' | 'driver' }
  | { name: 'application_submitted'; role: 'merchant' | 'driver' }
  | { name: 'contact_submitted' }
  | { name: 'order_tracked'; found: boolean }
  | { name: 'language_changed'; to: string };

export interface AnalyticsProvider {
  pageView(path: string, title?: string): void;
  track(event: AnalyticsEvent): void;
}

let provider: AnalyticsProvider | null = null;
let consentGranted = false;

/** Buffered until a provider exists, so early events are not lost. */
const queue: AnalyticsEvent[] = [];
const MAX_QUEUED_EVENTS = 50;

const flush = (): void => {
  if (!provider || !consentGranted) return;
  while (queue.length > 0) {
    const event = queue.shift();
    if (event) provider.track(event);
  }
};

export const setAnalyticsProvider = (next: AnalyticsProvider | null): void => {
  provider = next;
  flush();
};

/** Called by the consent banner. No event leaves the browser before this. */
export const setAnalyticsConsent = (granted: boolean): void => {
  consentGranted = granted;
  if (granted) flush();
  else queue.length = 0;
};

export const analytics = {
  get isEnabled(): boolean {
    return Boolean(env.analyticsId) && consentGranted;
  },

  track(event: AnalyticsEvent): void {
    if (env.isDev) logger.debug(`analytics: ${event.name}`, event as Record<string, unknown>);
    if (!consentGranted || !provider) {
      if (queue.length < MAX_QUEUED_EVENTS) queue.push(event);
      return;
    }
    provider.track(event);
  },

  pageView(path: string, title?: string): void {
    this.track({ name: 'page_view', path, ...(title ? { title } : {}) });
  },
};

export default analytics;
