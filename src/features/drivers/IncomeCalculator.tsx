import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import styles from './IncomeCalculator.module.css';

/** Working days per month used for the monthly projection. */
const WORKING_DAYS_PER_MONTH = 26;

/** Defaults match the figures shown in the approved design (10 × 1,500). */
const DEFAULT_ORDERS_PER_DAY = 10;
const DEFAULT_RATE_PER_ORDER = 1_500;

/** Guard rails, so a typo cannot produce a nonsense headline figure. */
const LIMITS = {
  orders: { min: 1, max: 60 },
  rate: { min: 250, max: 20_000 },
} as const;

/**
 * Clamps a raw input value into range, falling back to `fallback` for a
 * non-numeric or empty entry.
 *
 * The clamp happens on RENDER of the result, not on change: rewriting the
 * input's own value while someone is mid-type is the classic way a numeric
 * field becomes unusable (you cannot clear it to type a new number, because
 * the empty string is instantly replaced by "1").
 */
const clamp = (raw: string, { min, max }: { min: number; max: number }, fallback: number) => {
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

/**
 * The "احسب دخلك" estimator.
 *
 * Deliberately client-only and stateless beyond the two inputs: it is an
 * illustration, not a quote. The disclaimer under it says so, because a figure
 * this prominent will otherwise be read as a promise.
 */
export const IncomeCalculator = () => {
  const { t } = useTranslation();
  const ordersId = useId();
  const rateId = useId();

  const [orders, setOrders] = useState(String(DEFAULT_ORDERS_PER_DAY));
  const [rate, setRate] = useState(String(DEFAULT_RATE_PER_ORDER));

  const ordersValue = clamp(orders, LIMITS.orders, DEFAULT_ORDERS_PER_DAY);
  const rateValue = clamp(rate, LIMITS.rate, DEFAULT_RATE_PER_ORDER);

  const daily = ordersValue * rateValue;
  const monthly = daily * WORKING_DAYS_PER_MONTH;

  // Western digits, matching the brand's figures elsewhere on the site.
  const currency = t('drivers.calculator.currency');
  const money = (value: number) => `${formatNumber(value, 'en')} ${currency}`;

  return (
    <div className={styles.card}>
      <div>
        <h3 className={styles.title}>{t('drivers.calculator.title')}</h3>
        <p className={styles.subtitle}>{t('drivers.calculator.subtitle')}</p>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ordersId}>
            {t('drivers.calculator.ordersLabel')}
          </label>
          <input
            id={ordersId}
            className={styles.input}
            /*
             * `inputMode="numeric"` brings up the digit keypad on mobile;
             * `type="number"` alone is inconsistent across Android keyboards
             * and adds spinners nobody wants at this size.
             */
            type="number"
            inputMode="numeric"
            /*
             * `lang="en"` + `dir="ltr"` on the control only. A number input
             * shapes its digits from the element's language, so under
             * `<html lang="ar">` these render as ١٠ and ١٥٠٠ while the result
             * below them reads "15,000" — two numeral systems in one card.
             * The brand's figures are Western digits everywhere on the site,
             * so the inputs are pinned to match.
             */
            lang="en"
            dir="ltr"
            min={LIMITS.orders.min}
            max={LIMITS.orders.max}
            value={orders}
            onChange={(event) => setOrders(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={rateId}>
            {t('drivers.calculator.rateLabel')}
          </label>
          <input
            id={rateId}
            className={styles.input}
            type="number"
            inputMode="numeric"
            /*
             * `lang="en"` + `dir="ltr"` on the control only. A number input
             * shapes its digits from the element's language, so under
             * `<html lang="ar">` these render as ١٠ and ١٥٠٠ while the result
             * below them reads "15,000" — two numeral systems in one card.
             * The brand's figures are Western digits everywhere on the site,
             * so the inputs are pinned to match.
             */
            lang="en"
            dir="ltr"
            min={LIMITS.rate.min}
            max={LIMITS.rate.max}
            step={250}
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </div>
      </div>

      {/*
        `aria-live="polite"` — the figures change as a sighted user types, and
        without this a screen-reader user would have to hunt for the result to
        discover that anything happened at all.
      */}
      <div className={styles.results} aria-live="polite">
        <p className={styles.result}>
          <span className={styles.resultLabel}>{t('drivers.calculator.dailyLabel')}</span>
          <span className={styles.resultValue}>{money(daily)}</span>
        </p>

        <p className={cn(styles.result, styles.resultHighlight)}>
          <span className={styles.resultLabel}>{t('drivers.calculator.monthlyLabel')}</span>
          <span className={styles.resultValue}>{money(monthly)}</span>
        </p>
      </div>

      <p className={styles.disclaimer}>{t('drivers.calculator.disclaimer')}</p>
    </div>
  );
};

export default IncomeCalculator;
