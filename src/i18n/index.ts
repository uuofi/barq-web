import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/config/constants';
import { site } from '@/config/site';
import ar from './locales/ar.json';
import en from './locales/en.json';

/**
 * Internationalisation + document direction.
 *
 * Arabic RTL is the DEFAULT and the fallback — this is an Iraqi platform, and
 * English is the secondary locale, not the reference one. Two consequences
 * baked in below:
 *
 *  1. `fallbackLng` is 'ar', so a missing English string shows Arabic rather
 *     than a raw key like `nav.merchants`.
 *  2. Direction is applied to <html> here (and pre-applied before first paint
 *     by the inline script in index.html) — no component should ever set
 *     `dir` itself, or two sources of truth will fight.
 */

export const SUPPORTED_LANGUAGES = site.locale.supported;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = site.locale.default;

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

export const directionOf = (language: Language): 'rtl' | 'ltr' =>
  language === 'ar' ? 'rtl' : 'ltr';

/** Must stay in sync with the inline bootstrap script in index.html. */
const readStoredLanguage = (): Language => {
  const stored = storage.read(STORAGE_KEYS.language);
  if (isLanguage(stored)) return stored;

  // Fall back to the browser preference before defaulting to Arabic.
  if (typeof navigator !== 'undefined') {
    const preferred = navigator.languages?.find((tag) => isLanguage(tag.split('-')[0]));
    const base = preferred?.split('-')[0];
    if (isLanguage(base)) return base;
  }
  return DEFAULT_LANGUAGE;
};

/** The ONLY place <html lang|dir> is written after boot. */
export const applyDocumentLanguage = (language: Language): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language;
  document.documentElement.dir = directionOf(language);
};

export const changeLanguage = async (language: Language): Promise<void> => {
  await i18n.changeLanguage(language);
  storage.write(STORAGE_KEYS.language, language);
  applyDocumentLanguage(language);
};

const initialLanguage = readStoredLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // React already escapes.
  },
  returnNull: false,
});

applyDocumentLanguage(initialLanguage);

export default i18n;
