import { useId } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CloseIcon } from '@/components/icons';
import { paths } from '@/app/router/paths';
import styles from './ApplyLayout.module.css';

interface TermsAgreementProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

/**
 * "أوافق على سياسة الخصوصية والشروط والأحكام" — the same consent the app's
 * sign-up screens require (delivery-app <TermsAgreement>), pointing at the same
 * two documents, which live on this site.
 *
 * `<Trans>` rather than string concatenation: the two links sit INSIDE the
 * sentence, and where they fall differs by language. Splitting the sentence
 * into "prefix + link + and + link" fragments would make the Arabic and English
 * word order untranslatable without code changes.
 *
 * Both links open in a new tab. Navigating away mid-form would discard
 * everything already typed, which is a harsh price for checking what you are
 * agreeing to.
 */
export const TermsAgreement = ({ checked, onChange, error }: TermsAgreementProps) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.terms}>
      <div className={styles.termsRow}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.termsCheckbox}
          checked={checked}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label className={styles.termsLabel} htmlFor={inputId}>
          <Trans
            i18nKey="apply.driver.form.terms"
            components={{
              privacy: (
                <Link className={styles.termsLink} to={paths.legal.privacy} target="_blank" />
              ),
              terms: <Link className={styles.termsLink} to={paths.legal.terms} target="_blank" />,
            }}
          />
        </label>
      </div>

      {error ? (
        <p id={errorId} className={styles.photoError} role="alert">
          <CloseIcon className={styles.photoErrorIcon} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default TermsAgreement;
