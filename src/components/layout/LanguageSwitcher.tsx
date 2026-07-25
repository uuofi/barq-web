import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGUAGES, type Language } from '@/i18n';
import { analytics } from '@/lib/analytics';

const LANGUAGE_LABELS: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
};

/**
 * Language toggle.
 *
 * Delegates entirely to `changeLanguage()` in src/i18n — which is what also
 * persists the choice and flips `<html lang|dir>`. This component must never
 * touch `document.documentElement` itself; direction has exactly one owner.
 */
export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = i18n.language as Language;

  const handleChange = (next: Language) => {
    if (next === current) return;
    void changeLanguage(next);
    analytics.track({ name: 'language_changed', to: next });
  };

  return (
    <div data-component="language-switcher" role="group" aria-label={t('nav.language')}>
      {SUPPORTED_LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          lang={language}
          aria-pressed={language === current}
          onClick={() => handleChange(language)}
        >
          {LANGUAGE_LABELS[language]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
