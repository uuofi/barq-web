import { useTranslation } from 'react-i18next';
import { directionOf, DEFAULT_LANGUAGE, isLanguage, type Language } from '@/i18n';

export interface LocaleInfo {
  language: Language;
  direction: 'rtl' | 'ltr';
  isRtl: boolean;
}

/**
 * The current locale, typed.
 *
 * `i18n.language` is a plain `string` and can carry a region suffix
 * ('ar-IQ'). Components that pass it to `formatCurrency` or a `Record<Language, …>`
 * lookup need the narrowed union, so the normalisation happens here once
 * rather than being re-derived (differently) at each call site.
 */
export const useLocale = (): LocaleInfo => {
  const { i18n } = useTranslation();

  const base = i18n.language?.split('-')[0];
  const language: Language = isLanguage(base) ? base : DEFAULT_LANGUAGE;
  const direction = directionOf(language);

  return { language, direction, isRtl: direction === 'rtl' };
};

export default useLocale;
