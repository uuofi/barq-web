import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import { GOVERNORATES, GOVERNORATE_LABELS } from '@/config/constants';
import {
  RestaurantIcon,
  PharmacyIcon,
  StoreIcon,
  BoxIcon,
  BuildingIcon,
} from '@/components/icons';
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
import useWizard from './useWizard';
import { MERCHANT_STEP_SCHEMAS, type MerchantApplication } from './apply.schema';

const INITIAL: MerchantApplication = {
  businessName: '',
  ownerName: '',
  phone: '',
  email: undefined,
  city: '',
  address: '',
  businessType: '',
  ordersPerDay: '',
};

/**
 * Merchant application — the three-step funnel ("تقديم طلب كتاجر").
 *
 * Steps: business details → business type & volume → review.
 *
 * Shares `ApplyLayout`, `useWizard` and the field primitives with the driver
 * funnel; the only thing that differs is which fields appear on which step.
 */
export const MerchantApplyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submission = useSubmitLead();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const wizard = useWizard<MerchantApplication>({
    schemas: MERCHANT_STEP_SCHEMAS,
    initialValues: INITIAL,
  });

  const { values, errors, setValue } = wizard;

  const errorFor = (field: keyof MerchantApplication) => {
    const key = errors[field as string];
    return key ? t(key) : undefined;
  };

  const cityOptions = GOVERNORATES.map((id) => ({
    value: id,
    label: GOVERNORATE_LABELS[id],
  }));

  const typeChoices: Choice[] = [
    { value: 'restaurant', label: t('apply.merchant.step2.restaurant'), icon: RestaurantIcon },
    { value: 'pharmacy', label: t('apply.merchant.step2.pharmacy'), icon: PharmacyIcon },
    { value: 'store', label: t('apply.merchant.step2.store'), icon: StoreIcon },
    { value: 'supermarket', label: t('apply.merchant.step2.supermarket'), icon: BoxIcon },
    { value: 'other', label: t('apply.merchant.step2.other'), icon: BuildingIcon },
  ];

  const stepTitles = [
    t('apply.merchant.step1.title'),
    t('apply.merchant.step2.title'),
    t('apply.merchant.step3.title'),
  ];

  const handleSubmit = async () => {
    setSubmitError(undefined);
    try {
      await submission.mutateAsync({
        role: 'merchant',
        name: values.ownerName,
        phone: values.phone,
        businessName: values.businessName,
      });
      navigate(paths.apply.success, { replace: true, state: { role: 'merchant' } });
    } catch {
      setSubmitError(t('errors.generic'));
    }
  };

  return (
    <>
      <Seo title={t('apply.merchant.title')} description={t('seo.applyMerchant.description')} />

      <PageHero
        title={t('apply.merchant.title')}
        subtitle={t('apply.merchant.subtitle')}
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
        {/* ---------------- Step 1 — business details ------------------- */}
        {wizard.step === 0 && (
          <div className={styles.fields}>
            <TextField
              label={t('apply.merchant.step1.businessName')}
              placeholder={t('apply.merchant.step1.businessNamePlaceholder')}
              required
              autoComplete="organization"
              value={values.businessName}
              error={errorFor('businessName')}
              onChange={(event) => setValue('businessName', event.target.value)}
            />

            <div className={styles.row}>
              <TextField
                label={t('apply.merchant.step1.ownerName')}
                placeholder={t('apply.merchant.step1.ownerNamePlaceholder')}
                required
                autoComplete="name"
                value={values.ownerName}
                error={errorFor('ownerName')}
                onChange={(event) => setValue('ownerName', event.target.value)}
              />

              <TextField
                label={t('apply.merchant.step1.phone')}
                placeholder={t('apply.merchant.step1.phonePlaceholder')}
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                value={values.phone}
                error={errorFor('phone')}
                onChange={(event) => setValue('phone', event.target.value)}
              />
            </div>

            <div className={styles.row}>
              <TextField
                label={t('apply.merchant.step1.email')}
                placeholder={t('apply.merchant.step1.emailPlaceholder')}
                optional
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                value={values.email ?? ''}
                error={errorFor('email')}
                onChange={(event) => setValue('email', event.target.value || undefined)}
              />

              <SelectField
                label={t('apply.merchant.step1.city')}
                placeholder={t('apply.driver.step1.cityPlaceholder')}
                required
                options={cityOptions}
                value={values.city}
                error={errorFor('city')}
                onChange={(event) => setValue('city', event.target.value)}
              />
            </div>

            <TextAreaField
              label={t('apply.merchant.step1.address')}
              placeholder={t('apply.merchant.step1.addressPlaceholder')}
              required
              rows={3}
              autoComplete="street-address"
              value={values.address}
              error={errorFor('address')}
              onChange={(event) => setValue('address', event.target.value)}
            />
          </div>
        )}

        {/* ---------------- Step 2 — type & volume ---------------------- */}
        {wizard.step === 1 && (
          <div className={styles.fields}>
            <ChoiceGroup
              legend={t('apply.merchant.step2.title')}
              name="businessType"
              required
              hint={t('apply.merchant.step2.hint')}
              choices={typeChoices}
              value={values.businessType}
              error={errorFor('businessType')}
              onChange={(value) => setValue('businessType', value)}
            />

            <TextField
              label={t('apply.merchant.step2.ordersPerDay')}
              placeholder={t('apply.merchant.step2.ordersPerDayPlaceholder')}
              required
              type="number"
              inputMode="numeric"
              // Western digits, matching every other figure on the site — a
              // number input otherwise shapes its value from `<html lang>`.
              lang="en"
              dir="ltr"
              min={1}
              value={values.ordersPerDay}
              error={errorFor('ordersPerDay')}
              onChange={(event) => setValue('ordersPerDay', event.target.value)}
            />
          </div>
        )}

        {/* ---------------- Step 3 — review ----------------------------- */}
        {wizard.step === 2 && (
          <ApplySummary
            rows={[
              { label: t('apply.merchant.step1.businessName'), value: values.businessName },
              { label: t('apply.merchant.step1.ownerName'), value: values.ownerName },
              { label: t('apply.merchant.step1.phone'), value: values.phone },
              { label: t('apply.merchant.step1.email'), value: values.email ?? '' },
              {
                label: t('apply.merchant.step1.city'),
                value: cityOptions.find((city) => city.value === values.city)?.label ?? '',
              },
              { label: t('apply.merchant.step1.address'), value: values.address },
              {
                label: t('apply.merchant.step2.title'),
                value:
                  typeChoices.find((choice) => choice.value === values.businessType)?.label ?? '',
              },
              { label: t('apply.merchant.step2.ordersPerDay'), value: values.ordersPerDay },
            ]}
          />
        )}
      </ApplyLayout>
    </>
  );
};

export default MerchantApplyPage;
