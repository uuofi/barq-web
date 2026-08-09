import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './Field.module.css';

interface FieldShellProps {
  label: string;
  /** Resolved error message, already translated. */
  error?: string;
  /** Persistent helper text under the control. */
  hint?: string;
  required?: boolean;
  /** Marks the field "(اختياري)" instead of showing a required asterisk. */
  optional?: boolean;
  className?: string;
  children: (ids: { inputId: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/**
 * The label / control / error / hint scaffold every field shares.
 *
 * It owns the wiring that is easy to get subtly wrong and impossible to see
 * when it is: the generated id linking `<label for>` to the control, the
 * `aria-describedby` chain that attaches the hint AND the error to the input,
 * and `aria-invalid`. Passing them down through a render prop means an
 * individual field cannot forget one.
 *
 * The error is announced with `role="alert"` so a screen-reader user hears a
 * validation failure at the moment it appears, rather than only discovering it
 * by tabbing back through the form.
 */
const FieldShell = ({
  label,
  error,
  hint,
  required = false,
  optional = false,
  className,
  children,
}: FieldShellProps) => {
  const { t } = useTranslation();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required ? (
          <>
            <span className={styles.required} aria-hidden="true">
              *
            </span>
            <span className="visually-hidden">{t('forms.required')}</span>
          </>
        ) : null}
        {optional ? <span className={styles.optional}>({t('contact.form.optional')})</span> : null}
      </label>

      {children({ inputId, describedBy: describedBy || undefined, invalid: Boolean(error) })}

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          <CloseIcon className={styles.errorIcon} />
          {error}
        </p>
      ) : null}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Text input                                                                  */
/* -------------------------------------------------------------------------- */

type TextFieldProps = Omit<ComponentPropsWithoutRef<'input'>, 'id' | 'className'> &
  Omit<FieldShellProps, 'children'>;

/**
 * `forwardRef` because react-hook-form's `register()` returns a ref, and
 * without forwarding it the library cannot focus the first invalid field on a
 * failed submit.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, required, optional, className, ...inputProps }, ref) => (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      optional={optional}
      className={className}
    >
      {({ inputId, describedBy, invalid }) => (
        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          className={cn(styles.control, invalid && styles.invalid)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </FieldShell>
  )
);
TextField.displayName = 'TextField';

/* -------------------------------------------------------------------------- */
/* Textarea                                                                    */
/* -------------------------------------------------------------------------- */

type TextAreaFieldProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'id' | 'className'> &
  Omit<FieldShellProps, 'children'>;

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, hint, required, optional, className, ...textareaProps }, ref) => (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      optional={optional}
      className={className}
    >
      {({ inputId, describedBy, invalid }) => (
        <textarea
          {...textareaProps}
          ref={ref}
          id={inputId}
          className={cn(styles.control, styles.textarea, invalid && styles.invalid)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </FieldShell>
  )
);
TextAreaField.displayName = 'TextAreaField';

/* -------------------------------------------------------------------------- */
/* Select                                                                      */
/* -------------------------------------------------------------------------- */

type SelectFieldProps = Omit<ComponentPropsWithoutRef<'select'>, 'id' | 'className'> &
  Omit<FieldShellProps, 'children'> & {
    options: readonly { value: string; label: string }[];
    /** Shown as a disabled first option, e.g. "اختر مدينتك". */
    placeholder?: string;
  };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { label, error, hint, required, optional, className, options, placeholder, ...selectProps },
    ref
  ) => (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      optional={optional}
      className={className}
    >
      {({ inputId, describedBy, invalid }) => (
        <select
          {...selectProps}
          ref={ref}
          id={inputId}
          className={cn(styles.control, styles.select, invalid && styles.invalid)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
);
SelectField.displayName = 'SelectField';

/* -------------------------------------------------------------------------- */
/* Choice group (radio cards)                                                  */
/* -------------------------------------------------------------------------- */

export interface Choice {
  value: string;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

interface ChoiceGroupProps {
  legend: string;
  name: string;
  choices: readonly Choice[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

/**
 * A radio group rendered as selectable cards ("نوع المركبة", "نوع النشاط").
 *
 * Built on real `<input type="radio">` elements inside a `<fieldset>` with a
 * `<legend>`, not on clickable divs. That is what gives it arrow-key
 * navigation, correct "2 of 4" announcements, and native form participation
 * for free — none of which is recoverable once you reach for `role="radio"`
 * and a keydown handler.
 */
export const ChoiceGroup = ({
  legend,
  name,
  choices,
  value,
  onChange,
  error,
  hint,
  required = false,
  className,
}: ChoiceGroupProps) => {
  const { t } = useTranslation();
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const hintId = `${groupId}-hint`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <fieldset
      className={cn(styles.fieldset, styles.field, className)}
      aria-describedby={describedBy || undefined}
      aria-invalid={Boolean(error) || undefined}
    >
      <legend className={styles.legend}>
        {legend}
        {required ? (
          <>
            <span className={styles.required} aria-hidden="true">
              *
            </span>
            <span className="visually-hidden">{t('forms.required')}</span>
          </>
        ) : null}
      </legend>

      <div className={styles.choices}>
        {choices.map((choice) => (
          <label key={choice.value} className={styles.choice}>
            <input
              className={styles.choiceInput}
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            {choice.icon ? <choice.icon className={styles.choiceIcon} /> : null}
            <span className={styles.choiceLabel}>{choice.label}</span>
          </label>
        ))}
      </div>

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          <CloseIcon className={styles.errorIcon} />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
};
