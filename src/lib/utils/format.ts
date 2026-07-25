import { DEFAULT_CURRENCY } from '@/config/constants';

/**
 * Locale-aware formatting helpers.
 *
 * All of these take an explicit `locale` rather than reading i18n state, so
 * they stay pure and testable. Components get the locale from
 * `useLocale()` (src/hooks/useLocale.ts) and pass it down.
 *
 * `Intl` formatters are cached: constructing one is genuinely expensive and a
 * list re-rendering 50 rows would otherwise build 50 formatters per paint.
 */

type SupportedLocale = 'ar' | 'en';

/** BCP-47 tags. `ar-IQ` gives Iraqi month names and the right numeral shape. */
const LOCALE_TAG: Record<SupportedLocale, string> = {
  ar: 'ar-IQ',
  en: 'en-US',
};

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

const numberFormatter = (locale: SupportedLocale, options: Intl.NumberFormatOptions) => {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE_TAG[locale], options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
};

const dateFormatter = (locale: SupportedLocale, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALE_TAG[locale], options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
};

export const formatNumber = (
  value: number,
  locale: SupportedLocale = 'ar',
  options: Intl.NumberFormatOptions = {}
): string => numberFormatter(locale, options).format(value);

/**
 * Money. The platform settles in IQD, which has no minor unit — so fraction
 * digits are forced to 0 rather than inheriting Intl's default of 2.
 */
export const formatCurrency = (
  value: number,
  locale: SupportedLocale = 'ar',
  currency: string = DEFAULT_CURRENCY
): string =>
  numberFormatter(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: Date | string, locale: SupportedLocale = 'ar'): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return dateFormatter(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

export const formatDateTime = (value: Date | string, locale: SupportedLocale = 'ar'): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return dateFormatter(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/** "منذ ٣ دقائق" / "3 minutes ago". */
export const formatRelativeTime = (
  value: Date | string,
  locale: SupportedLocale = 'ar',
  now: Date = new Date()
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absolute = Math.abs(diffSeconds);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 3600],
    ['hour', 86_400],
    ['day', 604_800],
    ['week', 2_629_800],
    ['month', 31_557_600],
  ];

  const formatter = new Intl.RelativeTimeFormat(LOCALE_TAG[locale], { numeric: 'auto' });

  let previousLimit = 1;
  for (const [unit, limit] of units) {
    if (absolute < limit) return formatter.format(Math.round(diffSeconds / previousLimit), unit);
    previousLimit = limit;
  }
  return formatter.format(Math.round(diffSeconds / 31_557_600), 'year');
};
