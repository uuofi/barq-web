import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '@/components/icons';
import { Button, Section } from '@/components/ui';
import styles from './ApplyLayout.module.css';

interface ApplyLayoutProps {
  /** Zero-based index of the current step. */
  step: number;
  totalSteps: number;
  progress: number;
  /** Heading for the step currently on screen. */
  stepTitle: string;
  isFirst: boolean;
  isLast: boolean;
  submitting?: boolean;
  /** Rendered above the buttons when submission fails. */
  errorMessage?: string;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

/**
 * The shared chrome for both application wizards.
 *
 * It owns the progress indicator and the step navigation; the individual
 * wizard owns only the fields. That split is what keeps the driver's five
 * steps and the merchant's three visually identical — and it means the
 * "التالي / السابق / إرسال الطلب" logic is written once.
 *
 * The step region is a live region (`aria-live="polite"`): advancing a step
 * replaces the entire contents of the card without navigating, which a screen
 * reader would otherwise announce as nothing at all.
 */
export const ApplyLayout = ({
  step,
  totalSteps,
  progress,
  stepTitle,
  isFirst,
  isLast,
  submitting = false,
  errorMessage,
  onNext,
  onPrevious,
  onSubmit,
  children,
}: ApplyLayoutProps) => {
  const { t } = useTranslation();

  return (
    <Section canvas="tint" data-section="apply">
      <div className={styles.card}>
        <div className={styles.progressHeader}>
          <span className={styles.stepLabel}>
            {t('apply.stepOf', { current: step + 1, total: totalSteps })}
          </span>
          <span className={styles.progressValue}>{progress}%</span>
        </div>

        {/*
          A real `progressbar` role with its value attributes, not a decorative
          bar: the percentage is meaningful information about how much of the
          application is left, and a sighted user gets it from the fill.
        */}
        <div
          className={styles.track}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('apply.stepOf', { current: step + 1, total: totalSteps })}
        >
          <div className={styles.bar} style={{ inlineSize: `${progress}%` }} />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isLast) onSubmit();
            else onNext();
          }}
          noValidate
        >
          <div aria-live="polite">
            <h2 className={styles.stepTitle}>{stepTitle}</h2>
            {children}
          </div>

          {errorMessage ? (
            <p className={styles.error} role="alert">
              <CloseIcon className={styles.errorIcon} />
              {errorMessage}
            </p>
          ) : null}

          <div className={styles.footer}>
            <Button
              type="submit"
              className={styles.footerPrimary}
              loading={submitting}
              disabled={submitting}
            >
              {isLast ? t('apply.submit') : t('apply.next')}
            </Button>

            {!isFirst ? (
              <Button
                type="button"
                variant="light"
                className={styles.footerSecondary}
                onClick={onPrevious}
                disabled={submitting}
              >
                {t('apply.previous')}
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </Section>
  );
};

interface SummaryProps {
  rows: readonly { label: string; value: string }[];
}

/** The read-only table on each wizard's final "مراجعة الطلب" step. */
export const ApplySummary = ({ rows }: SummaryProps) => {
  const { t } = useTranslation();

  return (
    <>
      <p className={styles.reviewLead}>{t('apply.reviewLead')}</p>
      <dl className={styles.summary}>
        {rows
          // Optional fields that were left blank are omitted rather than shown
          // as an empty row — a summary of what was entered, not of what could
          // have been.
          .filter((row) => row.value)
          .map((row) => (
            <div key={row.label} className={styles.summaryRow}>
              <dt className={styles.summaryLabel}>{row.label}</dt>
              <dd className={styles.summaryValue}>{row.value}</dd>
            </div>
          ))}
      </dl>
    </>
  );
};

export { styles as applyStyles };
export default ApplyLayout;
