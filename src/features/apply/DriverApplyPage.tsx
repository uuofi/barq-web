import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import { GOVERNORATES, GOVERNORATE_LABELS } from '@/config/constants';
import { CloseIcon } from '@/components/icons';
import { Button, PageHero, Section, SelectField, TextField } from '@/components/ui';
import { RequestError } from '@/lib/http/RequestError';
// The card/field/footer chrome is shared with the merchant wizard; this page
// renders it directly because it has a single step and so needs none of
// ApplyLayout's step navigation.
import styles from './ApplyLayout.module.css';
import PhotoUpload from './PhotoUpload';
import TermsAgreement from './TermsAgreement';
import { useRegisterDriver } from './useApplyRegistration';
import {
  DRIVER_INITIAL_VALUES,
  driverApplicationSchema,
  type DriverFormValues,
} from './apply.schema';

/**
 * The vehicle type every driver signs up with.
 *
 * The backend requires one, and the app's own sign-up screen does not ask —
 * it sends 'motorcycle' for everyone (see DEFAULT_VEHICLE_TYPE in
 * driver-register.tsx) and lets an admin correct it during review. This form
 * asks exactly what that screen asks, so it does the same. Changing this is a
 * two-place edit, deliberately.
 */
const DEFAULT_VEHICLE_TYPE = 'motorcycle' as const;

/**
 * Driver application — "تقديم طلب كسائق".
 *
 * A single screen asking for exactly what the driver app's sign-up screen asks
 * for (delivery-app/app/(auth)/driver-register.tsx): photo, governorate, name,
 * phone, password + confirmation, terms. Submitting creates the same locked
 * `pending_review` account an in-app signup creates, so the request appears in
 * the admin panel's approvals queue and the applicant can sign into the app the
 * moment an admin approves it.
 *
 * It used to be a five-step wizard collecting birth date, vehicle details,
 * three document uploads, experience and availability — none of which the app
 * asked for and none of which the backend required. Those steps are gone: an
 * applicant on the website and an applicant in the app now answer the same
 * questions.
 */
export const DriverApplyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submission = useRegisterDriver();

  const [values, setValues] = useState<DriverFormValues>(DRIVER_INITIAL_VALUES);
  /** Field name → i18n key, resolved at the point of display. */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [photoUploading, setPhotoUploading] = useState(false);

  const setValue = <K extends keyof DriverFormValues>(field: K, value: DriverFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear this field's error as soon as it changes, so a corrected input
    // stops showing red immediately rather than waiting for the next submit.
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  /** Stable — <PhotoUpload> reports upload state through an effect. */
  const handleUploadingChange = useCallback((uploading: boolean) => {
    setPhotoUploading(uploading);
  }, []);

  const errorFor = (field: keyof DriverFormValues) => {
    const key = errors[field];
    return key ? t(key) : undefined;
  };

  const governorateOptions = GOVERNORATES.map((id) => ({
    value: id,
    label: GOVERNORATE_LABELS[id],
  }));

  const handleSubmit = async () => {
    setSubmitError(undefined);

    // Never submit over an upload in flight: `photoUrl` is still '' at that
    // point, so this would fail validation and tell the applicant their photo
    // is missing while they are watching it upload.
    if (photoUploading) return;

    const parsed = driverApplicationSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        // First error per field wins — three messages under one input is noise.
        if (typeof field === 'string' && !(field in nextErrors)) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      await submission.mutateAsync({
        role: 'driver',
        name: parsed.data.fullName,
        phone: parsed.data.phone,
        password: parsed.data.password,
        governorate: parsed.data.governorate,
        driver: {
          vehicleType: DEFAULT_VEHICLE_TYPE,
          photoUrl: parsed.data.photoUrl,
        },
      });
      // `replace` — the confirmation must not be reachable by pressing Back
      // from wherever the applicant goes next, which would suggest the
      // application can be submitted twice.
      navigate(paths.apply.success, { replace: true, state: { role: 'driver' } });
    } catch (error) {
      setSubmitError(resolveSubmitError(error, t));
    }
  };

  return (
    <>
      <Seo title={t('apply.driver.title')} description={t('seo.applyDriver.description')} />

      <PageHero
        title={t('apply.driver.title')}
        subtitle={t('apply.driver.subtitle')}
        align="center"
      />

      <Section canvas="tint" data-section="apply">
        <div className={styles.card}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
            noValidate
          >
            <h2 className={styles.stepTitle}>{t('apply.driver.form.title')}</h2>
            <p className={styles.reviewLead}>{t('apply.driver.form.lead')}</p>

            <div className={styles.fields}>
              <PhotoUpload
                value={values.photoUrl}
                error={errorFor('photoUrl')}
                onChange={(photoUrl) => setValue('photoUrl', photoUrl)}
                onUploadingChange={handleUploadingChange}
              />

              <SelectField
                label={t('apply.driver.form.governorate')}
                placeholder={t('apply.driver.form.governoratePlaceholder')}
                required
                options={governorateOptions}
                value={values.governorate}
                error={errorFor('governorate')}
                onChange={(event) => setValue('governorate', event.target.value)}
              />

              <TextField
                label={t('apply.driver.form.fullName')}
                placeholder={t('apply.driver.form.fullNamePlaceholder')}
                required
                autoComplete="name"
                value={values.fullName}
                error={errorFor('fullName')}
                onChange={(event) => setValue('fullName', event.target.value)}
              />

              <TextField
                label={t('apply.driver.form.phone')}
                placeholder={t('apply.driver.form.phonePlaceholder')}
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                maxLength={11}
                value={values.phone}
                error={errorFor('phone')}
                // Digits only, capped at 11 — the same keystroke filter the app
                // applies, so "٠٧٧٠ 123 4567" pasted from a contact card cannot
                // reach the 07XXXXXXXXX check as an unfixable failure.
                onChange={(event) =>
                  setValue('phone', event.target.value.replace(/\D/g, '').slice(0, 11))
                }
              />

              <div className={styles.row}>
                <TextField
                  label={t('apply.driver.form.password')}
                  placeholder={t('apply.driver.form.passwordPlaceholder')}
                  required
                  type="password"
                  autoComplete="new-password"
                  hint={t('apply.driver.form.passwordHint')}
                  value={values.password}
                  error={errorFor('password')}
                  onChange={(event) => setValue('password', event.target.value)}
                />

                <TextField
                  label={t('apply.driver.form.confirmPassword')}
                  placeholder={t('apply.driver.form.confirmPasswordPlaceholder')}
                  required
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  error={errorFor('confirmPassword')}
                  onChange={(event) => setValue('confirmPassword', event.target.value)}
                />
              </div>

              <TermsAgreement
                checked={values.agreeTerms}
                error={errorFor('agreeTerms')}
                onChange={(checked) => setValue('agreeTerms', checked)}
              />
            </div>

            {submitError ? (
              <p className={styles.error} role="alert">
                <CloseIcon className={styles.errorIcon} />
                {submitError}
              </p>
            ) : null}

            <div className={styles.footer}>
              <Button
                type="submit"
                className={styles.footerPrimary}
                loading={submission.isPending}
                disabled={submission.isPending || photoUploading}
              >
                {t('apply.submit')}
              </Button>
            </div>

            <p className={styles.formNote}>{t('apply.driver.form.reviewNote')}</p>
          </form>
        </div>
      </Section>
    </>
  );
};

/**
 * Turns a submission failure into something the applicant can act on.
 *
 * 409 and 429 are the two the backend answers for reasons that are entirely
 * about this person's situation — the number is already registered, or too many
 * applications have come from this connection — and a generic "something went
 * wrong" would send them round in circles retrying. Everything else genuinely
 * is unexpected.
 */
const resolveSubmitError = (error: unknown, t: (key: string) => string): string => {
  if (!RequestError.is(error)) return t('errors.generic');
  if (error.status === 409) return t('errors.phoneRegistered');
  // The throttle's message is already an Arabic sentence naming the wait.
  if (error.isRateLimited) return error.message;
  if (error.isNetworkError) return t('errors.network');
  return t('errors.generic');
};

export default DriverApplyPage;
