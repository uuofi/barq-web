import { z } from 'zod';
import { GOVERNORATES, PHONE_PATTERN } from '@/config/constants';

/**
 * Application form contracts for the driver and merchant funnels.
 *
 * As with `contact.schema.ts`, every message is an i18n KEY rather than a
 * sentence: the component resolves it with `t()`, so one schema validates both
 * locales. Rules mirror the backend's own validators — client validation here
 * is a UX convenience and the server must re-validate.
 *
 * The MERCHANT funnel is a wizard, so each of its steps gets its own schema and
 * the full form is their intersection. That is what lets "التالي" validate only
 * the fields on screen: a single whole-form schema would fail step 1 because
 * step 2 is empty, and the only way out of that is to make everything optional,
 * which then lets an incomplete application through at the end. The DRIVER
 * funnel is a single screen and so needs only one schema.
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

/**
 * The account password set during self-registration (see apply.api.ts — an
 * application creates a real, locked account). Mirrors the backend's own
 * `min(6)` rule (auth.validators.js#registerValidator) so a rejection never
 * surprises the visitor after they have finished typing.
 */
const password = z.string().min(6, 'forms.passwordTooShort').max(72, 'forms.tooLong');

/**
 * Attaches the password-confirmation check to a step-1 schema. Applied AFTER
 * building the object (not merged into it) so the object form stays around
 * for `.merge()` — a `ZodEffects` from `.refine()` cannot be merged.
 */
const withPasswordMatch = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.refine((data) => data.password === data.confirmPassword, {
    message: 'forms.passwordMismatch',
    path: ['confirmPassword'],
  });

/* -------------------------------------------------------------------------- */
/* Driver                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Driver application.
 *
 * These are EXACTLY the fields the driver app's own sign-up screen asks for
 * (delivery-app/app/(auth)/driver-register.tsx) — photo, governorate, name,
 * phone, password + confirmation, and the terms checkbox — in the same order
 * and with the same rules. A driver who applies from the website and one who
 * signs up in the app are answering the same questions and producing the same
 * account, so the two forms are kept deliberately identical; anything added on
 * one side belongs on the other.
 *
 * The vehicle/documents/experience steps this form used to have are gone with
 * them: none was required by the app, none was required by the backend, and
 * every one of them was a step a web applicant had to clear that an app
 * applicant did not.
 */
const driverBase = z.object({
  /**
   * The URL returned by POST /uploads/driver-photo — NOT the File. The file is
   * uploaded the moment it is chosen, so by the time this validates there is
   * either a real URL or nothing, and "nothing" covers both "never picked one"
   * and "the upload failed", which need the same message anyway.
   */
  photoUrl: z.string().min(1, 'apply.driver.form.photoRequired'),
  /**
   * Typed as the closed governorate union, not a bare string, so the submit
   * payload needs no cast and an unlisted value cannot reach the backend's own
   * `isIn(GOVERNORATES)` check. The custom errorMap turns the empty initial
   * value into "this field is required" instead of Zod's enum wording.
   */
  governorate: z.enum(GOVERNORATES, { errorMap: () => ({ message: 'forms.required' }) }),
  fullName: requiredText(),
  phone,
  password,
  confirmPassword: z.string().min(1, 'forms.required'),
  /**
   * `.refine(v => v)` rather than `z.literal(true)`: an unticked box must fail
   * validation, but the field still has to HOLD `false` — that is its initial
   * value — and a literal type would make `false` unassignable in form state.
   */
  agreeTerms: z.boolean().refine((agreed) => agreed, 'apply.driver.form.termsRequired'),
});

export const driverApplicationSchema = withPasswordMatch(driverBase);

/** A validated application — `governorate` is narrowed, `agreeTerms` is true. */
export type DriverApplication = z.infer<typeof driverApplicationSchema>;

/**
 * What the inputs are bound to, which is NOT `z.input` of the schema above.
 *
 * The form starts empty, so `governorate` has to be able to hold `''` — a value
 * the schema exists precisely to reject. Typing the draft separately from the
 * parsed result is what keeps that honest: the page holds `DriverFormValues`,
 * `safeParse` turns it into a `DriverApplication`, and the submit payload is
 * built from the parsed value, so no cast is needed anywhere and an unvalidated
 * draft cannot be sent by accident.
 */
export interface DriverFormValues {
  photoUrl: string;
  governorate: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export const DRIVER_INITIAL_VALUES: DriverFormValues = {
  photoUrl: '',
  governorate: '',
  fullName: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
};

/* -------------------------------------------------------------------------- */
/* Merchant                                                                    */
/* -------------------------------------------------------------------------- */

const merchantStep1Base = z.object({
  businessName: requiredText(120),
  ownerName: requiredText(),
  phone,
  email: optionalEmail,
  city: requiredChoice,
  address: z.string().trim().min(5, 'forms.tooShort').max(200, 'forms.tooLong'),
  password,
  confirmPassword: z.string().min(1, 'forms.required'),
});

export const merchantStep1Schema = withPasswordMatch(merchantStep1Base);

export const merchantStep2Schema = z.object({
  businessType: requiredChoice,
  ordersPerDay: z
    .string()
    .trim()
    .min(1, 'forms.required')
    .refine((value) => Number.parseInt(value, 10) > 0, 'forms.required'),
});

export const merchantApplicationSchema = merchantStep1Base.merge(merchantStep2Schema);

export type MerchantApplication = z.infer<typeof merchantApplicationSchema>;

export const MERCHANT_STEP_SCHEMAS = [
  merchantStep1Schema,
  merchantStep2Schema,
  z.object({}),
] as const;
