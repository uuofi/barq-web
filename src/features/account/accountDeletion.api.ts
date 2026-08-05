import { http } from '@/lib/http/apiClient';
import { endpoints } from '@/lib/http/endpoints';
import {
  deletionReceiptSchema,
  type DeleteAccountFormValues,
  type DeletionReceipt,
} from './accountDeletion.schema';

/**
 * Transport for the account-deletion request.
 *
 * This is the only call on the site that carries a password, and the only one
 * that changes anything on the backend. Two consequences are visible here:
 *
 *  - the values are forwarded as-is, with no local caching and no retry. The
 *    server throttles this path hard (5 attempts per IP per hour), so a client
 *    retry would burn the user's own budget on a request that already failed
 *    for a reason retrying cannot fix.
 *  - the response is validated like every other, but its contents are dates
 *    the page PRINTS to the user — a malformed payload must fail loudly rather
 *    than render "Invalid Date" under a message about permanent deletion.
 */
export const accountDeletionApi = {
  deleteAccount: (values: DeleteAccountFormValues): Promise<DeletionReceipt> =>
    http.post(endpoints.deleteAccount, values, deletionReceiptSchema),
};

export default accountDeletionApi;
