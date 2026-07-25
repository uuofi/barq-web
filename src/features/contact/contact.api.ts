import { http } from '@/lib/http/apiClient';
import { endpoints } from '@/lib/http/endpoints';
import {
  submissionResultSchema,
  type ContactFormValues,
  type LeadFormValues,
  type SubmissionResult,
} from './contact.schema';

/**
 * Transport for contact + lead submissions.
 *
 * ⚠️ Both endpoints are `planned` — see src/lib/http/endpoints.ts. The
 * backend has no public write surface yet, and adding one needs its own rate
 * limiter (the existing `authLimiter` covers /auth only). Gated behind
 * VITE_FEATURE_LEAD_FORMS until then.
 *
 * The honeypot `website` field is stripped here rather than sent: it exists
 * only to detect bots client-side, and forwarding it would leak the trick.
 */

const stripHoneypot = <T extends { website?: string }>(values: T): Omit<T, 'website'> => {
  const { website: _honeypot, ...rest } = values;
  return rest;
};

export const contactApi = {
  submitContact: (values: ContactFormValues): Promise<SubmissionResult> =>
    http.post(endpoints.submitContact, stripHoneypot(values), submissionResultSchema),

  submitLead: (values: LeadFormValues): Promise<SubmissionResult> =>
    http.post(endpoints.submitLead, stripHoneypot(values), submissionResultSchema),
};

export default contactApi;
