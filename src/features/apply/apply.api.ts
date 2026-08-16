import { z } from 'zod';
import { http } from '@/lib/http/apiClient';
import { endpoints } from '@/lib/http/endpoints';

/**
 * Transport for the driver/merchant apply forms.
 *
 * Both submit to POST /public/applications, which creates the SAME
 * `pending_review` User a mobile-app signup creates: the submission lands in
 * the admin panel's approvals queue (delivery-admin ApprovalsPage) and the
 * applicant can log into the app the moment an admin approves it. There is no
 * separate "lead" or "application" collection.
 *
 * Why not POST /auth/register, which the apps use? Because that endpoint
 * answers 202 with an SMS challenge whenever OTP_ENABLED is on, and the web
 * funnel deliberately sends no code — see auth.service.js#submitApplication.
 * This path always answers 201 with the created account.
 *
 * The driver photo is NOT part of this payload: it is uploaded first, on its
 * own endpoint (`uploadDriverPhoto` below), and only the resulting URL is sent.
 * See delivery-backend/src/validators/auth.validators.js for the authoritative
 * field list this payload must match — the same chain validates both paths.
 */

/** The three vehicle types auth.validators.js accepts for a driver. */
export type VehicleType = 'motorcycle' | 'car' | 'bicycle';

export interface DriverRegistrationPayload {
  role: 'driver';
  name: string;
  phone: string;
  password: string;
  governorate: string;
  driver: {
    vehicleType: VehicleType;
    /** Absolute URL returned by `uploadDriverPhoto`. Required for a driver. */
    photoUrl: string;
  };
}

export interface MerchantRegistrationPayload {
  role: 'merchant';
  name: string;
  phone: string;
  password: string;
  email?: string;
  governorate: string;
  merchant: {
    storeName?: string;
    addressText?: string;
    businessType?: string;
    estimatedOrdersPerDay?: number;
  };
}

/**
 * Only what the confirmation page needs. The full response also carries the
 * created user, deliberately left unparsed — this is a public, unauthenticated
 * page and it has no use for the account record it just created.
 */
const applicationResultSchema = z.object({
  pendingApproval: z.boolean(),
  message: z.string(),
});

export type ApplicationResult = z.infer<typeof applicationResultSchema>;

const uploadedPhotoSchema = z.object({
  url: z.string().url(),
});

export type UploadedPhoto = z.infer<typeof uploadedPhotoSchema>;

/** Field name multer is configured to read (upload.middleware.js). */
const PHOTO_FIELD = 'photo';

export const applyApi = {
  registerDriver: (payload: DriverRegistrationPayload): Promise<ApplicationResult> =>
    http.post(endpoints.submitApplication, payload, applicationResultSchema),

  registerMerchant: (payload: MerchantRegistrationPayload): Promise<ApplicationResult> =>
    http.post(endpoints.submitApplication, payload, applicationResultSchema),

  /**
   * Uploads the applicant's photo and returns its public URL.
   *
   * Called when the file is CHOSEN, not at submit: it is by far the slowest
   * part of the form, and doing it up front means the slow bit happens while
   * the applicant is still typing, with a visible result, instead of stalling
   * the button they just pressed.
   */
  uploadDriverPhoto: (file: File): Promise<UploadedPhoto> => {
    const form = new FormData();
    form.append(PHOTO_FIELD, file);
    return http.postForm(endpoints.uploadDriverPhoto, form, uploadedPhotoSchema);
  },
};

export default applyApi;
