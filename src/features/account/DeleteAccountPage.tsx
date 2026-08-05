import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import Container from '@/components/layout/Container';
import { ShieldIcon, DocumentIcon, CheckCircleIcon, EyeIcon } from '@/components/icons';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { useLocale } from '@/hooks/useLocale';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { site } from '@/config/site';
import { telHref, whatsappHref } from '@/lib/utils/url';
import {
  deleteAccountFormSchema,
  DELETION_CONFIRM_WORD,
  type DeleteAccountFormValues,
} from './accountDeletion.schema';
import {
  useDeleteAccount,
  readDeletionBlock,
  isInvalidCredentials,
  isThrottled,
} from './useDeleteAccount';
import styles from './DeleteAccountPage.module.css';

/**
 * Self-service account deletion (حذف الحساب).
 *
 * This page exists for two audiences at once, and the layout serves both:
 *
 *  - a user who wants their account gone, and needs it to take one screen and
 *    no support ticket;
 *  - a store reviewer (Google Play / App Store), who must be able to open this
 *    URL WITHOUT the app installed and see, in plain language, what gets
 *    deleted, what is kept, and how long it takes. Hence the "what happens"
 *    panel above the form — it is not decoration, it is the requirement.
 *
 * Deliberate friction: the account is identified by password, and the word
 * "حذف" has to be typed. Everything on this site is one tap; this is the one
 * action where an accidental tap must not be enough.
 *
 * `noIndex` is NOT set — unlike the tracking result page, this URL is meant to
 * be findable, and the app stores check that it resolves publicly.
 */
export const DeleteAccountPage = () => {
  const { t } = useTranslation();
  const { language } = useLocale();
  const deletion = useDeleteAccount();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const title = t('account.delete.title');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountFormSchema),
    // Errors appear as the user leaves a field rather than on every keystroke:
    // an "invalid" flashing under a password being typed is noise.
    mode: 'onBlur',
  });

  const onSubmit = (values: DeleteAccountFormValues) => deletion.mutate(values);

  /** A refusal we can name precisely (order in flight / unpaid balance). */
  const block = readDeletionBlock(deletion.error);

  const receipt = deletion.data;

  /* ---------------------------------------------------------------------- */
  /* Success — the form is replaced entirely. Leaving a filled password form  */
  /* on screen after the account is gone would be both confusing and unsafe.  */
  /* ---------------------------------------------------------------------- */
  if (receipt) {
    return (
      <>
        <Seo
          title={t('account.delete.done.title')}
          description={t('seo.deleteAccount.description')}
        />
        <Container as="section" size="narrow" data-page="account-delete">
          <div className={styles.receipt} role="status">
            <span className={styles.receiptIcon} aria-hidden="true">
              <CheckCircleIcon width={28} height={28} />
            </span>
            <h1 className={styles.receiptTitle}>{t('account.delete.done.title')}</h1>
            <p className={styles.receiptLead}>{t('account.delete.done.lead')}</p>

            <dl className={styles.receiptFacts}>
              <div className={styles.receiptRow}>
                <dt>{t('account.delete.done.deactivatedLabel')}</dt>
                <dd>{formatDate(receipt.deletedAt, language)}</dd>
              </div>
              <div className={styles.receiptRow}>
                <dt>{t('account.delete.done.purgeLabel')}</dt>
                <dd>{formatDate(receipt.purgeAt, language)}</dd>
              </div>
            </dl>

            <p className={styles.receiptNote}>
              {t('account.delete.done.undoNote', { days: receipt.graceDays })}
            </p>

            <Link to={paths.home} className={styles.backLink}>
              {t('common.backHome')}
            </Link>
          </div>
        </Container>
      </>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* The form                                                                */
  /* ---------------------------------------------------------------------- */
  return (
    <>
      <Seo
        title={title}
        description={t('seo.deleteAccount.description')}
        jsonLd={[
          breadcrumbSchema([
            { name: t('nav.home'), path: paths.home },
            { name: title, path: paths.account.delete },
          ]),
        ]}
      />

      <Container as="section" size="narrow" data-page="account-delete">
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{t('account.delete.lead')}</p>
        </header>

        {/* What actually happens — the part a store reviewer reads. */}
        <section className={styles.explainer} aria-labelledby="deletion-effects">
          <h2 id="deletion-effects" className={styles.explainerTitle}>
            {t('account.delete.effects.title')}
          </h2>

          <div className={styles.effectsGrid}>
            <div className={styles.effectCard}>
              <span className={styles.effectIcon} aria-hidden="true">
                <ShieldIcon width={20} height={20} />
              </span>
              <h3 className={styles.effectHeading}>{t('account.delete.effects.removed.title')}</h3>
              <ul className={styles.effectList}>
                <li>{t('account.delete.effects.removed.item1')}</li>
                <li>{t('account.delete.effects.removed.item2')}</li>
                <li>{t('account.delete.effects.removed.item3')}</li>
                <li>{t('account.delete.effects.removed.item4')}</li>
              </ul>
            </div>

            <div className={styles.effectCard}>
              <span className={styles.effectIcon} aria-hidden="true">
                <DocumentIcon width={20} height={20} />
              </span>
              <h3 className={styles.effectHeading}>{t('account.delete.effects.kept.title')}</h3>
              <ul className={styles.effectList}>
                <li>{t('account.delete.effects.kept.item1')}</li>
                <li>{t('account.delete.effects.kept.item2')}</li>
              </ul>
              <p className={styles.effectNote}>{t('account.delete.effects.kept.note')}</p>
            </div>
          </div>

          <p className={styles.timeline}>{t('account.delete.effects.timeline')}</p>
        </section>

        {/* Conditions that must be settled first — stated up front, so a user
            is not surprised by a refusal after typing a password. */}
        <section className={styles.requirements} aria-labelledby="deletion-requirements">
          <h2 id="deletion-requirements" className={styles.requirementsTitle}>
            {t('account.delete.requirements.title')}
          </h2>
          <ul className={styles.requirementsList}>
            <li>{t('account.delete.requirements.item1')}</li>
            <li>{t('account.delete.requirements.item2')}</li>
          </ul>
        </section>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2 className={styles.formTitle}>{t('account.delete.form.title')}</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="delete-phone">
              {t('account.delete.form.phoneLabel')}
            </label>
            <input
              id="delete-phone"
              className={styles.input}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              placeholder="07XXXXXXXXX"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'delete-phone-error' : undefined}
              {...register('phone')}
            />
            {errors.phone && (
              <p id="delete-phone-error" className={styles.fieldError} role="alert">
                {t(errors.phone.message ?? 'forms.required')}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="delete-password">
              {t('account.delete.form.passwordLabel')}
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="delete-password"
                className={styles.input}
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                dir="ltr"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'delete-password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-pressed={passwordVisible}
                aria-label={t(
                  passwordVisible ? 'account.delete.form.hidePassword' : 'account.delete.form.showPassword'
                )}
              >
                <EyeIcon width={18} height={18} />
              </button>
            </div>
            {errors.password && (
              <p id="delete-password-error" className={styles.fieldError} role="alert">
                {t(errors.password.message ?? 'forms.required')}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="delete-confirm">
              {t('account.delete.form.confirmLabel', { word: DELETION_CONFIRM_WORD })}
            </label>
            <input
              id="delete-confirm"
              className={styles.input}
              type="text"
              autoComplete="off"
              aria-invalid={Boolean(errors.confirm)}
              aria-describedby={errors.confirm ? 'delete-confirm-error' : undefined}
              {...register('confirm')}
            />
            {errors.confirm && (
              <p id="delete-confirm-error" className={styles.fieldError} role="alert">
                {t(errors.confirm.message ?? 'account.delete.form.confirmMismatch', {
                  word: DELETION_CONFIRM_WORD,
                })}
              </p>
            )}
          </div>

          {/* One alert region for every server-side outcome, so a screen
              reader announces exactly one thing per submission. */}
          {deletion.isError && (
            <div className={styles.alert} role="alert">
              {block?.kind === 'activeOrders' && (
                <>
                  <strong className={styles.alertTitle}>
                    {t('account.delete.errors.activeOrders.title')}
                  </strong>
                  <p>
                    {t('account.delete.errors.activeOrders.body', { count: block.activeOrders })}
                  </p>
                </>
              )}

              {block?.kind === 'outstandingBalance' && (
                <>
                  <strong className={styles.alertTitle}>
                    {t('account.delete.errors.outstandingBalance.title')}
                  </strong>
                  <p>
                    {t('account.delete.errors.outstandingBalance.body', {
                      amount: formatCurrency(block.totalOutstanding, language),
                      count: block.unpaidCount,
                    })}
                  </p>
                </>
              )}

              {!block && isInvalidCredentials(deletion.error) && (
                <p>{t('account.delete.errors.invalidCredentials')}</p>
              )}

              {!block && isThrottled(deletion.error) && <p>{t('account.delete.errors.throttled')}</p>}

              {!block && !isInvalidCredentials(deletion.error) && !isThrottled(deletion.error) && (
                <p>{t('account.delete.errors.generic')}</p>
              )}
            </div>
          )}

          <button type="submit" className={styles.submit} disabled={deletion.isPending}>
            {deletion.isPending ? t('forms.submitting') : t('account.delete.form.submit')}
          </button>

          <p className={styles.formFootnote}>{t('account.delete.form.footnote')}</p>
        </form>

        {/* An escape hatch for anyone who cannot get past the form — a
            forgotten password must not become a locked door in front of a
            deletion request. */}
        <section className={styles.support} aria-labelledby="deletion-support">
          <h2 id="deletion-support" className={styles.supportTitle}>
            {t('account.delete.support.title')}
          </h2>
          <p className={styles.supportBody}>{t('account.delete.support.body')}</p>
          <div className={styles.supportLinks}>
            {site.contact.phone && (
              <a className={styles.supportLink} href={telHref(site.contact.phone)} dir="ltr">
                {site.contact.phone}
              </a>
            )}
            {site.contact.whatsapp && (
              <a
                className={styles.supportLink}
                href={whatsappHref(site.contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            )}
            {site.contact.email && (
              <a className={styles.supportLink} href={`mailto:${site.contact.email}`} dir="ltr">
                {site.contact.email}
              </a>
            )}
          </div>
          <Link to={paths.legal.privacy} className={styles.privacyLink}>
            {t('account.delete.support.privacyLink')}
          </Link>
        </section>
      </Container>
    </>
  );
};

export default DeleteAccountPage;
