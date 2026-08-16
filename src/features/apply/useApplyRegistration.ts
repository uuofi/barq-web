import { useMutation } from '@tanstack/react-query';
import { analytics } from '@/lib/analytics';
import { applyApi, type DriverRegistrationPayload, type MerchantRegistrationPayload } from './apply.api';

/**
 * Submission hooks for the driver/merchant apply forms. See apply.api.ts for
 * why these post to /public/applications rather than to /auth/register.
 */

export const useRegisterDriver = () =>
  useMutation({
    mutationFn: (payload: DriverRegistrationPayload) => applyApi.registerDriver(payload),
    onSuccess: () => analytics.track({ name: 'application_submitted', role: 'driver' }),
  });

export const useRegisterMerchant = () =>
  useMutation({
    mutationFn: (payload: MerchantRegistrationPayload) => applyApi.registerMerchant(payload),
    onSuccess: () => analytics.track({ name: 'application_submitted', role: 'merchant' }),
  });

/**
 * Photo upload for the driver form. Runs when the file is chosen, well before
 * the application itself is submitted — see applyApi.uploadDriverPhoto.
 */
export const useUploadDriverPhoto = () =>
  useMutation({
    mutationFn: (file: File) => applyApi.uploadDriverPhoto(file),
  });
