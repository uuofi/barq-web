import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import { GOVERNORATES, GOVERNORATE_LABELS } from '@/config/constants';
import { MotorbikeIcon, TruckIcon, RouteIcon } from '@/components/icons';
import {
  PageHero,
  TextField,
  TextAreaField,
  SelectField,
  ChoiceGroup,
  type Choice,
} from '@/components/ui';
import { useSubmitLead } from '@/features/contact/useContactForm';
import ApplyLayout, { ApplySummary, applyStyles as styles } from './ApplyLayout';
import DocumentUpload from './DocumentUpload';
import useWizard from './useWizard';
import { DRIVER_STEP_SCHEMAS, type DriverApplication } from './apply.schema';

const INITIAL: DriverApplication = {
  fullName: '',
  phone: '',
  city: '',
  birthDate: '',
  vehicleType: '',
  vehicleModel: '',
  plateNumber: '',
  nationalId: '',
  license: '',
  vehicleReg: '',
  experience: '',
  availability: '',
  notes: '',
};

/**
 * Driver application — the five-step funnel ("تقديم طلب كسائق").
 *
 * Steps: personal details → vehicle → documents → experience & availability →
 * review.
 *
 * The uploaded `File` objects are held in a ref rather than in wizard state:
 * they are needed once, at submit, and putting a Blob in React state means
 * every keystroke on a later step re-renders against an object that cannot be
 * compared cheaply. Only the file NAMES live in validated state, which is what
 * the review screen and the schema actually need.
 */
export const DriverApplyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submission = useSubmitLead();
  const files = useRef<Record<string, File | null>>({});
  const [submitError, setSubmitError] = useState<string | undefined>();

  const wizard = useWizard<DriverApplication>({
    schemas: DRIVER_STEP_SCHEMAS,
    initialValues: INITIAL,
  });

  const { values, errors, setValue } = wizard;

  /** Schema errors are i18n keys; resolve at the point of display. */
  const errorFor = (field: keyof DriverApplication) => {
    const key = errors[field as string];
    return key ? t(key) : undefined;
  };

  const cityOptions = GOVERNORATES.map((id) => ({
    value: id,
    label: GOVERNORATE_LABELS[id],
  }));

  const vehicleChoices: Choice[] = [
    { value: 'motorcycle', label: t('apply.driver.step2.vehicleMotorcycle'), icon: MotorbikeIcon },
    { value: 'car', label: t('apply.driver.step2.vehicleCar'), icon: TruckIcon },
    { value: 'bicycle', label: t('apply.driver.step2.vehicleBicycle'), icon: RouteIcon },
  ];

  const experienceChoices: Choice[] = [
    { value: 'none', label: t('apply.driver.step4.experienceNone') },
    { value: 'under-one', label: t('apply.driver.step4.experienceOne') },
    { value: 'one-to-three', label: t('apply.driver.step4.experienceThree') },
    { value: 'over-three', label: t('apply.driver.step4.experienceMore') },
  ];

  const availabilityChoices: Choice[] = [
    { value: 'morning', label: t('apply.driver.step4.availabilityMorning') },
    { value: 'evening', label: t('apply.driver.step4.availabilityEvening') },
    { value: 'full', label: t('apply.driver.step4.availabilityFull') },
  ];

  const labelOf = (choices: Choice[], value: string) =>
    choices.find((choice) => choice.value === value)?.label ?? '';

  const stepTitles = [
    t('apply.driver.step1.title'),
    t('apply.driver.step2.title'),
    t('apply.driver.step3.title'),
    t('apply.driver.step4.title'),
    t('apply.driver.step5.title'),
  ];

  const handleSubmit = async () => {
    setSubmitError(undefined);
    try {
      await submission.mutateAsync({
        role: 'driver',
        name: values.fullName,
        phone: values.phone,
      });
      // `replace` — the confirmation must not be reachable by pressing Back
      // from wherever the visitor goes next, which would suggest the
      // application can be submitted twice.
      navigate(paths.apply.success, { replace: true, state: { role: 'driver' } });
    } catch {
      setSubmitError(t('errors.generic'));
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

      <ApplyLayout
        step={wizard.step}
        totalSteps={wizard.totalSteps}
        progress={wizard.progress}
        stepTitle={stepTitles[wizard.step] ?? ''}
        isFirst={wizard.isFirst}
        isLast={wizard.isLast}
        submitting={submission.isPending}
        errorMessage={submitError}
        onNext={wizard.next}
        onPrevious={wizard.previous}
        onSubmit={handleSubmit}
      >
        {/* ---------------- Step 1 — personal details ------------------- */}
        {wizard.step === 0 && (
          <div className={styles.fields}>
            <TextField
              label={t('apply.driver.step1.fullName')}
              placeholder={t('apply.driver.step1.fullNamePlaceholder')}
              required
              autoComplete="name"
              value={values.fullName}
              error={errorFor('fullName')}
              onChange={(event) => setValue('fullName', event.target.value)}
            />

            <div className={styles.row}>
              <TextField
                label={t('apply.driver.step1.phone')}
                placeholder={t('apply.driver.step1.phonePlaceholder')}
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                value={values.phone}
                error={errorFor('phone')}
                onChange={(event) => setValue('phone', event.target.value)}
              />

              <TextField
                label={t('apply.driver.step1.birthDate')}
                required
                type="date"
                autoComplete="bday"
                value={values.birthDate}
                error={errorFor('birthDate')}
                onChange={(event) => setValue('birthDate', event.target.value)}
              />
            </div>

            <SelectField
              label={t('apply.driver.step1.city')}
              placeholder={t('apply.driver.step1.cityPlaceholder')}
              required
              options={cityOptions}
              value={values.city}
              error={errorFor('city')}
              onChange={(event) => setValue('city', event.target.value)}
            />
          </div>
        )}

        {/* ---------------- Step 2 — vehicle ---------------------------- */}
        {wizard.step === 1 && (
          <div className={styles.fields}>
            <ChoiceGroup
              legend={t('apply.driver.step2.vehicleType')}
              name="vehicleType"
              required
              choices={vehicleChoices}
              value={values.vehicleType}
              error={errorFor('vehicleType')}
              onChange={(value) => setValue('vehicleType', value)}
            />

            <div className={styles.row}>
              <TextField
                label={t('apply.driver.step2.vehicleModel')}
                placeholder={t('apply.driver.step2.vehicleModelPlaceholder')}
                required
                value={values.vehicleModel}
                error={errorFor('vehicleModel')}
                onChange={(event) => setValue('vehicleModel', event.target.value)}
              />

              <TextField
                label={t('apply.driver.step2.plateNumber')}
                placeholder={t('apply.driver.step2.plateNumberPlaceholder')}
                required
                value={values.plateNumber}
                error={errorFor('plateNumber')}
                onChange={(event) => setValue('plateNumber', event.target.value)}
              />
            </div>
          </div>
        )}

        {/* ---------------- Step 3 — documents -------------------------- */}
        {wizard.step === 2 && (
          <div className={styles.fields}>
            <div className={styles.uploads}>
              <DocumentUpload
                label={t('apply.driver.step3.nationalId')}
                value={values.nationalId}
                error={errorFor('nationalId')}
                onChange={(name, file) => {
                  files.current.nationalId = file;
                  setValue('nationalId', name);
                }}
              />
              <DocumentUpload
                label={t('apply.driver.step3.license')}
                value={values.license}
                error={errorFor('license')}
                onChange={(name, file) => {
                  files.current.license = file;
                  setValue('license', name);
                }}
              />
              <DocumentUpload
                label={t('apply.driver.step3.vehicleReg')}
                value={values.vehicleReg}
                error={errorFor('vehicleReg')}
                onChange={(name, file) => {
                  files.current.vehicleReg = file;
                  setValue('vehicleReg', name);
                }}
              />
            </div>

            <p className={styles.reviewLead}>{t('apply.driver.step3.hint')}</p>
          </div>
        )}

        {/* ---------------- Step 4 — experience ------------------------- */}
        {wizard.step === 3 && (
          <div className={styles.fields}>
            <ChoiceGroup
              legend={t('apply.driver.step4.experience')}
              name="experience"
              required
              choices={experienceChoices}
              value={values.experience}
              error={errorFor('experience')}
              onChange={(value) => setValue('experience', value)}
            />

            <ChoiceGroup
              legend={t('apply.driver.step4.availability')}
              name="availability"
              required
              choices={availabilityChoices}
              value={values.availability}
              error={errorFor('availability')}
              onChange={(value) => setValue('availability', value)}
            />

            <TextAreaField
              label={t('apply.driver.step4.notes')}
              placeholder={t('apply.driver.step4.notesPlaceholder')}
              optional
              rows={4}
              value={values.notes ?? ''}
              error={errorFor('notes')}
              onChange={(event) => setValue('notes', event.target.value)}
            />
          </div>
        )}

        {/* ---------------- Step 5 — review ----------------------------- */}
        {wizard.step === 4 && (
          <ApplySummary
            rows={[
              { label: t('apply.driver.step1.fullName'), value: values.fullName },
              { label: t('apply.driver.step1.phone'), value: values.phone },
              {
                label: t('apply.driver.step1.city'),
                value: cityOptions.find((city) => city.value === values.city)?.label ?? '',
              },
              { label: t('apply.driver.step1.birthDate'), value: values.birthDate },
              {
                label: t('apply.driver.step2.vehicleType'),
                value: labelOf(vehicleChoices, values.vehicleType),
              },
              { label: t('apply.driver.step2.vehicleModel'), value: values.vehicleModel },
              { label: t('apply.driver.step2.plateNumber'), value: values.plateNumber },
              { label: t('apply.driver.step3.nationalId'), value: values.nationalId },
              { label: t('apply.driver.step3.license'), value: values.license },
              { label: t('apply.driver.step3.vehicleReg'), value: values.vehicleReg },
              {
                label: t('apply.driver.step4.experience'),
                value: labelOf(experienceChoices, values.experience),
              },
              {
                label: t('apply.driver.step4.availability'),
                value: labelOf(availabilityChoices, values.availability),
              },
              { label: t('apply.driver.step4.notes'), value: values.notes ?? '' },
            ]}
          />
        )}
      </ApplyLayout>
    </>
  );
};

export default DriverApplyPage;
