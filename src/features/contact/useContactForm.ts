import { useMutation } from '@tanstack/react-query';
import { analytics } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { contactApi } from './contact.api';
import type { ContactFormValues, LeadFormValues, SubmissionResult } from './contact.schema';

/**
 * Submission hooks for the public forms.
 *
 * Both share one policy that belongs here rather than in a component:
 *
 *  - the honeypot is checked BEFORE the request. A filled `website` field
 *    resolves as a fake success — a bot that gets an error message just
 *    retries, while one that "succeeds" moves on.
 *  - the conversion event fires on success only, in one place, so analytics
 *    can never drift from what actually happened.
 *  - `RequestError.fieldErrors` from the backend is left intact on the error
 *    object; the form maps it onto inputs via `error.messageFor(field)`.
 */

/** Resolves as if sent, without sending. See the honeypot note above. */
const fakeSuccess = (): SubmissionResult => ({
  id: 'ignored',
  createdAt: new Date().toISOString(),
});

export const useSubmitContact = () =>
  useMutation({
    mutationFn: (values: ContactFormValues) => {
      if (values.website) {
        logger.debug('contact form honeypot triggered — dropping submission');
        return Promise.resolve(fakeSuccess());
      }
      return contactApi.submitContact(values);
    },
    onSuccess: (_result, values) => {
      if (!values.website) analytics.track({ name: 'contact_submitted' });
    },
  });

export const useSubmitLead = () =>
  useMutation({
    mutationFn: (values: LeadFormValues) => {
      if (values.website) {
        logger.debug('lead form honeypot triggered — dropping submission');
        return Promise.resolve(fakeSuccess());
      }
      return contactApi.submitLead(values);
    },
    onSuccess: (_result, values) => {
      if (!values.website) analytics.track({ name: 'lead_submitted', role: values.role });
    },
  });
