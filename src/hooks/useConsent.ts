import { useContext } from 'react';
import { ConsentContext, type ConsentContextValue } from '@/app/providers/ConsentProvider';

/**
 * Access to consent state.
 *
 * Split from the provider file so Fast Refresh keeps working: a module that
 * exports both a component and a hook gets its state remounted on every edit.
 */
export const useConsent = (): ConsentContextValue => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used inside <ConsentProvider>');
  }
  return context;
};

export default useConsent;
