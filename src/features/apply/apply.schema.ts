import { z } from 'zod';
import { PHONE_PATTERN } from '@/config/constants';

/**
 * Application form contracts for the driver and merchant funnels.
 *
 * As with `contact.schema.ts`, every message is an i18n KEY rather than a
 * sentence: the component resolves it with `t()`, so one schema validates both
 * locales. Rules mirror the backend's own validators — client validation here
 * is a UX convenience and the server must re-validate.
 *
 * Each wizard step gets its OWN schema, and the full form is their
 * intersection. That is what lets "التالي" validate only the fields on screen:
 * a single whole-form schema would fail step 1 because step 3 is empty, and
 * the only way out of that is to make everything optional, which then lets an
 * incomplete application through at the end.
 */

const requiredText = (max = 80) =>
  z.string().trim().min(2, 'forms.tooShort').max(max, 'forms.tooLong');

const phone = z.string().trim().regex(PHONE_PATTERN, 'forms.invalidPhone');

const optionalEmail = z
  .string()
  .trim()
  .email('forms.invalidEmail')
  .optional()
  .or(z.literal('').transform(() => undefined));

/** A non-empty selection from a radio group or select. */
const requiredChoice = z.string().min(1, 'forms.required');

/* -------------------------------------------------------------------------- */
/* Driver                                                                      */
/* -------------------------------------------------------------------------- */

export const driverStep1Schema = z.object({
  fullName: requiredText(),
  phone,
  city: requiredChoice,
  birthDate: z.string().min(1, 'forms.required'),
});

export const driverStep2Schema = z.object({
  vehicleType: requiredChoice,
  vehicleModel: requiredText(60),
  plateNumber: z.string().trim().min(2, 'forms.tooShort').max(20, 'forms.tooLong'),
});

/**
 * Documents. Each entry is the chosen file's NAME, not the file itself — the
 * wizard keeps the `File` objects in component state for upload and only the
 * name in validated form state, so a re-render never has to serialise a Blob.
 */
export const driverStep3Schema = z.object({
  nationalId: z.string().min(1, 'forms.required'),
  license: z.string().min(1, 'forms.required'),
  vehicleReg: z.string().min(1, 'forms.required'),
});

export const driverStep4Schema = z.object({
  experience: requiredChoice,
  availability: requiredChoice,
  notes: z.string().trim().max(500, 'forms.tooLong').optional(),
});

export const driverApplicationSchema = driverStep1Schema
  .merge(driverStep2Schema)
  .merge(driverStep3Schema)
  .merge(driverStep4Schema);

export type DriverApplication = z.infer<typeof driverApplicationSchema>;

/** The per-step schemas in wizard order. Index 4 (review) has nothing to check. */
export const DRIVER_STEP_SCHEMAS = [
  driverStep1Schema,
  driverStep2Schema,
  driverStep3Schema,
  driverStep4Schema,
  z.object({}),
] as const;

/* -------------------------------------------------------------------------- */
/* Merchant                                                                    */
/* -------------------------------------------------------------------------- */

export const merchantStep1Schema = z.object({
  businessName: requiredText(120),
  ownerName: requiredText(),
  phone,
  email: optionalEmail,
  city: requiredChoice,
  address: z.string().trim().min(5, 'forms.tooShort').max(200, 'forms.tooLong'),
});

export const merchantStep2Schema = z.object({
  businessType: requiredChoice,
  ordersPerDay: z
    .string()
    .trim()
    .min(1, 'forms.required')
    .refine((value) => Number.parseInt(value, 10) > 0, 'forms.required'),
});

export const merchantApplicationSchema = merchantStep1Schema.merge(merchantStep2Schema);

export type MerchantApplication = z.infer<typeof merchantApplicationSchema>;

export const MERCHANT_STEP_SCHEMAS = [
  merchantStep1Schema,
  merchantStep2Schema,
  z.object({}),
] as const;
