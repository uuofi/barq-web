import { useMutation } from '@tanstack/react-query';
import { RequestError } from '@/lib/http/RequestError';
import { accountDeletionApi } from './accountDeletion.api';
import {
  DELETION_BLOCK_CODES,
  activeOrdersDetailsSchema,
  outstandingBalanceDetailsSchema,
  type DeleteAccountFormValues,
  type DeletionReceipt,
} from './accountDeletion.schema';

/**
 * Submission + failure interpretation for the deletion form.
 *
 * Deliberately NOT tracked in analytics. Every other conversion on this site
 * fires an event; this one must not. Sending "this person asked to be erased"
 * to a third-party vendor, keyed to a session that can be joined back to them,
 * would undo the very thing the user came here to do.
 *
 * There is also no retry (see queryClient.ts: mutations retry once, and only
 * on a network error) — the backend allows five attempts per IP per hour, and
 * spending that budget automatically would lock a user out of deleting their
 * own account.
 */

/** A refusal the page can explain precisely, rather than a generic failure. */
export type DeletionBlock =
  | { kind: 'activeOrders'; activeOrders: number }
  | { kind: 'outstandingBalance'; totalOutstanding: number; unpaidCount: number };

/**
 * Reads the backend's coded 409 into something the UI can render.
 *
 * `details` is validated rather than trusted: it is printed to the user inside
 * a sentence about money and orders, so a shape change on the backend must
 * degrade to the generic message instead of rendering `undefined` next to a
 * currency symbol.
 */
export const readDeletionBlock = (error: unknown): DeletionBlock | null => {
  if (!RequestError.is(error)) return null;

  if (error.code === DELETION_BLOCK_CODES.activeOrders) {
    const parsed = activeOrdersDetailsSchema.safeParse(error.details);
    return parsed.success ? { kind: 'activeOrders', activeOrders: parsed.data.activeOrders } : null;
  }

  if (error.code === DELETION_BLOCK_CODES.outstandingBalance) {
    const parsed = outstandingBalanceDetailsSchema.safeParse(error.details);
    return parsed.success
      ? {
          kind: 'outstandingBalance',
          totalOutstanding: parsed.data.totalOutstanding,
          unpaidCount: parsed.data.unpaidCount,
        }
      : null;
  }

  return null;
};

/** True when the failure is "those credentials don't match an account". */
export const isInvalidCredentials = (error: unknown): boolean =>
  RequestError.is(error) && error.status === 401;

/** True when the throttle refused the attempt. */
export const isThrottled = (error: unknown): boolean =>
  RequestError.is(error) && error.isRateLimited;

export const useDeleteAccount = () =>
  useMutation<DeletionReceipt, unknown, DeleteAccountFormValues>({
    mutationFn: (values) => accountDeletionApi.deleteAccount(values),
  });

export default useDeleteAccount;
