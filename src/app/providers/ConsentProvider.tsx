import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/config/constants';
import { setAnalyticsConsent } from '@/lib/analytics';

/**
 * Cookie/analytics consent state.
 *
 * The architectural point: consent is the GATE in front of `lib/analytics`,
 * not a decorative banner. No third-party identifier leaves the browser until
 * `grant()` runs — `setAnalyticsConsent(false)` also drops anything the
 * analytics queue buffered while the visitor was deciding.
 *
 * The UI (banner) is intentionally not here. This provider owns state only;
 * a presentational component consumes `useConsent()` and renders it.
 */

export type ConsentStatus = 'unknown' | 'granted' | 'denied';

export interface ConsentContextValue {
  status: ConsentStatus;
  grant: () => void;
  deny: () => void;
}

export const ConsentContext = createContext<ConsentContextValue | null>(null);

const readStoredConsent = (): ConsentStatus => {
  const stored = storage.read(STORAGE_KEYS.cookieConsent);
  return stored === 'granted' || stored === 'denied' ? stored : 'unknown';
};

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<ConsentStatus>(readStoredConsent);

  // Applied on mount too, so a returning visitor's stored choice is honoured
  // before any component gets a chance to emit an event.
  useEffect(() => {
    setAnalyticsConsent(status === 'granted');
  }, [status]);

  const persist = useCallback((next: Exclude<ConsentStatus, 'unknown'>) => {
    storage.write(STORAGE_KEYS.cookieConsent, next);
    setStatus(next);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      status,
      grant: () => persist('granted'),
      deny: () => persist('denied'),
    }),
    [status, persist]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export default ConsentProvider;
