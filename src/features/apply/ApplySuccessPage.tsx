import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { paths } from '@/app/router/paths';
import { CheckIcon } from '@/components/icons';
import { Section, Button } from '@/components/ui';
import styles from './ApplySuccessPage.module.css';

const NEXT_STEP_KEYS = ['apply.success.next1', 'apply.success.next2', 'apply.success.next3'];

/**
 * "تم استلام طلبك" — the terminal confirmation for both funnels.
 *
 * `noIndex` is set explicitly. This page has no standalone value in search
 * results, and indexing it would put a confirmation of an application in front
 * of people who never made one.
 *
 * It renders the same for a driver and a merchant. The submitting page passes
 * the role in navigation state, which is available for analytics, but the
 * message itself does not differ — and inventing a difference would mean two
 * screens to keep in sync for no benefit to the reader.
 */
export const ApplySuccessPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('apply.success.title')} noIndex />

      <Section canvas="tint" data-page="apply-success">
        <div className={styles.card}>
          {/*
            `role="status"` on the confirmation: arriving here is a route
            change, and without a live region a screen-reader user lands on a
            new page with no announcement that the submission succeeded.
          */}
          <div role="status">
            <span className={styles.mark} aria-hidden="true">
              <CheckIcon />
            </span>

            <h1 className={styles.title}>{t('apply.success.title')}</h1>
            <p className={styles.body}>{t('apply.success.body')}</p>
          </div>

          <div className={styles.action}>
            <Button to={paths.home}>{t('apply.success.home')}</Button>
          </div>

          <div className={styles.next}>
            <h2 className={styles.nextTitle}>{t('apply.success.nextTitle')}</h2>
            <ol role="list" className={styles.steps}>
              {NEXT_STEP_KEYS.map((key) => (
                <li key={key} className={styles.step}>
                  {t(key)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </>
  );
};

export default ApplySuccessPage;
