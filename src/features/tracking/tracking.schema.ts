import { z } from 'zod';
import { ORDER_STATUSES, GOVERNORATES } from '@/config/constants';

/**
 * The tracking feature's data contract.
 *
 * Schemas are defined FIRST and types are inferred from them — never the
 * other way round. A hand-written `interface` is a promise the compiler can't
 * keep at runtime; a Zod schema validates the actual bytes on the wire and
 * gives the same static type for free (`z.infer`).
 *
 * PRIVACY NOTE (important, and a backend requirement):
 * an unauthenticated tracking endpoint must return ONLY the fields below.
 * Anyone who guesses an order code would otherwise get a customer's phone
 * number and home address. The schema is written `.strict()`-adjacent on
 * purpose: if the backend ever starts returning extra sensitive fields, they
 * are stripped here before touching a component.
 */

/** What the visitor types into the tracking input. */
export const trackingCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(4, 'forms.tooShort')
  .max(16, 'forms.tooLong')
  // Alphanumeric only: the order code is short and human-transcribed, so
  // anything else is a typo, not a lookup worth sending to the server.
  .regex(/^[A-Z0-9-]+$/, 'forms.required');

export const trackingFormSchema = z.object({
  code: trackingCodeSchema,
});

export type TrackingFormValues = z.infer<typeof trackingFormSchema>;

/** One step in the public order timeline. */
export const trackingEventSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  at: z.string().datetime({ offset: true }),
});

/**
 * The public projection of an order. Note what is ABSENT and must stay
 * absent: customer name/phone/address, driver identity, order value.
 */
export const publicOrderSchema = z.object({
  code: z.string(),
  status: z.enum(ORDER_STATUSES),
  governorate: z.enum(GOVERNORATES).nullable().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }).optional(),
  deliveredAt: z.string().datetime({ offset: true }).nullable().optional(),
  timeline: z.array(trackingEventSchema).default([]),
});

export type PublicOrder = z.infer<typeof publicOrderSchema>;
export type TrackingEvent = z.infer<typeof trackingEventSchema>;
