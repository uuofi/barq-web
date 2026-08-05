import { z } from 'zod';
import { PUBLIC_ROLES } from '@/config/constants';

/**
 * The account-deletion contract.
 *
 * Error messages are i18n KEYS, resolved with `t()` at the input — the same
 * convention as contact.schema.ts, so one schema serves Arabic and English.
 *
 * The phone rule here is deliberately LOOSER than contact.schema.ts': it
 * mirrors the backend's `loginValidator` (digits only, no fixed length) rather
 * than `registerValidator`'s strict `07xxxxxxxxx`. Anyone who can sign in must
 * be able to delete themselves, including accounts created before the 11-digit
 * format was enforced — a stricter client rule would lock those users out of
 * their own erasure.
 */

/** The word the user must type to arm the button. Must match the backend's validator. */
export const DELETION_CONFIRM_WORD = 'حذف';

export const deleteAccountFormSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(6, 'forms.tooShort')
    .max(20, 'forms.tooLong')
    .regex(/^\d+$/, 'forms.invalidPhone'),

  password: z.string().min(1, 'forms.required'),

  /**
   * Typed confirmation rather than a checkbox. A checkbox is one stray tap; a
   * word has to be read and copied, which is the point on an irreversible
   * action reached by a public URL.
   */
  confirm: z.literal(DELETION_CONFIRM_WORD, {
    errorMap: () => ({ message: 'account.delete.form.confirmMismatch' }),
  }),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountFormSchema>;

/** What the backend returns once the account has been deactivated. */
export const deletionReceiptSchema = z.object({
  /** When the account stopped working — i.e. now. */
  deletedAt: z.string(),
  /** When the personal data is irreversibly scrubbed. */
  purgeAt: z.string(),
  /** Length of the grace window in days; printed rather than hardcoded here. */
  graceDays: z.number(),
  role: z.enum(PUBLIC_ROLES),
});

export type DeletionReceipt = z.infer<typeof deletionReceiptSchema>;

/**
 * The refusals the backend reports with a machine-readable `code`, so the page
 * can explain what to settle instead of showing "something went wrong".
 * Mirrors accountDeletion.service.js' own codes.
 */
export const DELETION_BLOCK_CODES = {
  activeOrders: 'ACCOUNT_HAS_ACTIVE_ORDERS',
  outstandingBalance: 'ACCOUNT_HAS_OUTSTANDING_BALANCE',
} as const;

/** `details` attached to an ACCOUNT_HAS_ACTIVE_ORDERS refusal. */
export const activeOrdersDetailsSchema = z.object({
  activeOrders: z.number(),
});

/** `details` attached to an ACCOUNT_HAS_OUTSTANDING_BALANCE refusal. */
export const outstandingBalanceDetailsSchema = z.object({
  totalOutstanding: z.number(),
  unpaidCount: z.number(),
  currency: z.string().optional(),
});
