import { useCallback, useMemo, useState } from 'react';
import type { z } from 'zod';

/** A validation failure, keyed by field name, with i18n keys as values. */
export type FieldErrors = Record<string, string>;

interface UseWizardOptions<TValues extends Record<string, unknown>> {
  /** One schema per step, in order. The review step passes an empty object. */
  schemas: readonly z.ZodType<unknown>[];
  initialValues: TValues;
}

/**
 * State machine for a multi-step form.
 *
 * Two decisions worth stating:
 *
 * 1. Values live in ONE flat object across all steps, not one object per step.
 *    The review screen needs to show everything at once and the submission
 *    needs to send everything at once; splitting the state would mean
 *    reassembling it in two places.
 *
 * 2. `next()` validates only the CURRENT step's schema. Someone on step 1 has
 *    not filled step 3 yet, so validating the whole form there would fail on
 *    fields that are not on screen — errors a visitor cannot act on, attached
 *    to inputs they cannot see.
 *
 * Errors are cleared per-field as soon as that field changes, so a corrected
 * input stops showing red immediately rather than waiting for the next
 * "التالي".
 */
export const useWizard = <TValues extends Record<string, unknown>>({
  schemas,
  initialValues,
}: UseWizardOptions<TValues>) => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  const totalSteps = schemas.length;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const setValue = useCallback(<K extends keyof TValues>(field: K, value: TValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field as string];
      return next;
    });
  }, []);

  /** Validates the current step. Returns true and clears errors when valid. */
  const validateStep = useCallback((): boolean => {
    const schema = schemas[step];
    if (!schema) return true;

    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      // First error per field wins: showing three messages under one input is
      // noise, and the first is the one the visitor hits first anyway.
      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field] = issue.message;
      }
    }
    setErrors(nextErrors);
    return false;
  }, [schemas, step, values]);

  const next = useCallback(() => {
    if (!validateStep()) return false;
    setStep((current) => Math.min(current + 1, totalSteps - 1));
    return true;
  }, [validateStep, totalSteps]);

  const previous = useCallback(() => {
    // Going back never validates: someone stepping backwards to fix something
    // must not be blocked by the very field they are going back to fix.
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const progress = useMemo(() => Math.round(((step + 1) / totalSteps) * 100), [step, totalSteps]);

  return {
    step,
    totalSteps,
    isFirst,
    isLast,
    values,
    errors,
    setValue,
    validateStep,
    next,
    previous,
    progress,
  };
};

export default useWizard;
