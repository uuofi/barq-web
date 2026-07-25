import { z } from 'zod';
import { PHONE_PATTERN, PUBLIC_ROLES } from '@/config/constants';

/**
 * Contact & lead form contracts.
 *
 * Error messages are i18n KEYS, not sentences. React Hook Form surfaces
 * `error.message`, and the component resolves it with `t(...)` — so one
 * schema serves both Arabic and English without duplicating validation.
 *
 * Rules mirror the backend's own validators (`auth.validators.js`): the phone
 * pattern is the Iraqi `07xxxxxxxxx` format the platform already enforces.
 * Client validation is a UX convenience — the server must re-validate.
 */

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'forms.tooShort').max(80, 'forms.tooLong'),

  phone: z.string().trim().regex(PHONE_PATTERN, 'forms.invalidPhone'),

  // Optional: many users in this market have no email address.
  email: z
    .string()
    .trim()
    .email('forms.invalidEmail')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  message: z.string().trim().min(10, 'forms.tooShort').max(1000, 'forms.tooLong'),

  /**
   * Honeypot. Bots fill every field they find; humans never see this one
   * (hidden via CSS, NOT `type="hidden"` — bots skip those). A non-empty
   * value means the submission is dropped client-side without a request.
   */
  website: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** Signup-interest form on the merchants/drivers pages. */
export const leadFormSchema = z.object({
  role: z.enum(PUBLIC_ROLES),
  name: z.string().trim().min(2, 'forms.tooShort').max(80, 'forms.tooLong'),
  phone: z.string().trim().regex(PHONE_PATTERN, 'forms.invalidPhone'),
  /** Store name for merchants; ignored for drivers. */
  businessName: z.string().trim().max(120, 'forms.tooLong').optional(),
  website: z.string().max(0).optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

/** What the backend returns on a successful submission. */
export const submissionResultSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
});

export type SubmissionResult = z.infer<typeof submissionResultSchema>;
