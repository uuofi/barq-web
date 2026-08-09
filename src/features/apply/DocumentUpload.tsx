import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadIcon, CheckCircleIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './ApplyLayout.module.css';

/** Accepted document formats and the 5MB ceiling stated in the step's hint. */
const ACCEPT = 'image/jpeg,image/png,application/pdf';
const MAX_BYTES = 5 * 1024 * 1024;

interface DocumentUploadProps {
  label: string;
  /** The chosen file's name, or '' when nothing is selected yet. */
  value: string;
  onChange: (fileName: string, file: File | null) => void;
  error?: string;
}

/**
 * One document slot on the driver wizard's upload step.
 *
 * The `<input type="file">` is transparent and stretched over the whole box
 * rather than replaced by a button: it stays a real file input, so it is
 * keyboard-reachable, opens the native picker, and reports its own
 * filled/empty state to assistive technology without any extra ARIA.
 *
 * Oversized files are rejected here rather than at submit time — telling
 * someone their 12MB photo was too large only after they have completed two
 * more steps is the kind of feedback that loses applications.
 */
export const DocumentUpload = ({ label, value, onChange, error }: DocumentUploadProps) => {
  const { t } = useTranslation();
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const handleChange = (file: File | undefined) => {
    if (!file) {
      onChange('', null);
      return;
    }
    if (file.size > MAX_BYTES) {
      onChange('', null);
      return;
    }
    onChange(file.name, file);
  };

  const filled = Boolean(value);

  return (
    <div>
      <label className={cn(styles.upload, filled && styles.uploadFilled)} htmlFor={inputId}>
        <input
          id={inputId}
          className={styles.uploadInput}
          type="file"
          accept={ACCEPT}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => handleChange(event.target.files?.[0])}
        />

        {filled ? (
          <CheckCircleIcon className={styles.uploadIcon} />
        ) : (
          <UploadIcon className={styles.uploadIcon} />
        )}

        <span className={styles.uploadLabel}>{label}</span>
        <span className={styles.uploadHint}>
          {filled ? value : t('apply.driver.step3.upload')}
        </span>
      </label>

      {error ? (
        <p id={errorId} className={cn(styles.error, styles.uploadError)} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default DocumentUpload;
