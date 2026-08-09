import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { breadcrumbSchema, organizationSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { site } from '@/config/site';
import { telHref } from '@/lib/utils/url';
import { cn } from '@/lib/utils/cn';
import {
  CallIcon,
  MailIcon,
  PinIcon,
  ClockIcon,
  CheckCircleIcon,
  CloseIcon,
  FacebookIcon,
  InstagramIcon,
  XIcon,
  LinkedinIcon,
} from '@/components/icons';
import {
  PageHero,
  Section,
  IconBadge,
  Button,
  TextField,
  TextAreaField,
  ImageSlot,
} from '@/components/ui';
import { contactFormSchema, type ContactFormValues } from './contact.schema';
import { useSubmitContact } from './useContactForm';
import styles from './ContactPage.module.css';

const SOCIAL_LINKS = [
  { key: 'facebook', href: site.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
  { key: 'instagram', href: site.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
  { key: 'x', href: site.social.x, Icon: XIcon, label: 'X' },
  { key: 'linkedin', href: site.social.linkedin, Icon: LinkedinIcon, label: 'LinkedIn' },
] as const;

/**
 * Contact page.
 *
 * Bands: hero → info panel + message form → map.
 *
 * The form binds `contactFormSchema` through `zodResolver`, so the messages
 * rendered under each input are the schema's own i18n keys resolved with
 * `t()` — validation lives in one place and serves both locales.
 *
 * `mode: 'onBlur'` rather than `onChange`: validating every keystroke shows
 * "رقم الهاتف غير صحيح" while someone is still typing the second digit of a
 * number that will be perfectly valid, which trains people to ignore errors.
 */
export const ContactPage = () => {
  const { t } = useTranslation();
  const title = t('nav.contact');
  const submission = useSubmitContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
  });

  const jsonLd = useMemo(
    () => [
      organizationSchema(),
      breadcrumbSchema([
        { name: t('nav.home'), path: paths.home },
        { name: title, path: paths.contact },
      ]),
    ],
    [t, title]
  );

  const onSubmit = handleSubmit(async (values) => {
    await submission.mutateAsync(values);
    // Clearing on success is what makes the confirmation unambiguous: the
    // message is gone because it was sent, not still sitting there looking
    // unsent.
    reset();
  });

  /** Schema messages arrive as i18n keys; resolve them at the point of use. */
  const errorFor = (field: keyof ContactFormValues) => {
    const message = errors[field]?.message;
    return message ? t(message) : undefined;
  };

  const socials = SOCIAL_LINKS.filter((item) => item.href);

  return (
    <>
      <Seo title={title} description={t('seo.contact.description')} jsonLd={jsonLd} />

      <PageHero
        title={t('contact.hero.title')}
        subtitle={t('contact.hero.subtitle')}
        align="center"
      />

      <Section canvas="light" data-page="contact">
        <div className={styles.split}>
          {/* ------------------------------------------------------------ */}
          {/* Info panel                                                   */}
          {/* ------------------------------------------------------------ */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>{t('contact.info.title')}</h2>

            <address className={styles.details}>
              {site.contact.phone ? (
                <a className={styles.detail} href={telHref(site.contact.phone)}>
                  <IconBadge icon={CallIcon} size="sm" />
                  <span className={styles.detailBody}>
                    <span className={styles.detailLabel}>{t('contact.info.phoneLabel')}</span>
                    {/* `dir="ltr"` — an Iraqi number rendered in an RTL
                        paragraph otherwise displays its digit groups in the
                        wrong order. */}
                    <span className={styles.detailValue} dir="ltr">
                      {site.contact.phone}
                    </span>
                  </span>
                </a>
              ) : null}

              {site.contact.email ? (
                <a className={styles.detail} href={`mailto:${site.contact.email}`}>
                  <IconBadge icon={MailIcon} size="sm" />
                  <span className={styles.detailBody}>
                    <span className={styles.detailLabel}>{t('contact.info.emailLabel')}</span>
                    <span className={styles.detailValue} dir="ltr">
                      {site.contact.email}
                    </span>
                  </span>
                </a>
              ) : null}

              <div className={styles.detail}>
                <IconBadge icon={PinIcon} size="sm" />
                <span className={styles.detailBody}>
                  <span className={styles.detailLabel}>{t('contact.info.addressLabel')}</span>
                  <span className={styles.detailValue}>{t('contact.info.address')}</span>
                </span>
              </div>

              <div className={styles.detail}>
                <IconBadge icon={ClockIcon} size="sm" />
                <span className={styles.detailBody}>
                  <span className={styles.detailLabel}>{t('contact.info.hoursLabel')}</span>
                  <span className={styles.detailValue}>{t('contact.info.hours')}</span>
                </span>
              </div>
            </address>

            {socials.length > 0 ? (
              <div>
                <h3 className={styles.socialTitle}>{t('footer.followUs')}</h3>
                <div className={styles.social}>
                  {socials.map(({ key, href, Icon, label }) => (
                    <a
                      key={key}
                      href={href}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Message form                                                 */}
          {/* ------------------------------------------------------------ */}
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <h2 className={styles.formTitle}>{t('contact.form.title')}</h2>

            {submission.isSuccess ? (
              <p className={cn(styles.feedback, styles.feedbackSuccess)} role="status">
                <CheckCircleIcon className={styles.feedbackIcon} />
                {t('contact.form.success')}
              </p>
            ) : null}

            {submission.isError ? (
              <p className={cn(styles.feedback, styles.feedbackError)} role="alert">
                <CloseIcon className={styles.feedbackIcon} />
                {t('errors.generic')}
              </p>
            ) : null}

            <div className={styles.row}>
              <TextField
                label={t('contact.form.name')}
                placeholder={t('contact.form.namePlaceholder')}
                required
                autoComplete="name"
                error={errorFor('name')}
                {...register('name')}
              />

              <TextField
                label={t('contact.form.phone')}
                placeholder={t('contact.form.phonePlaceholder')}
                required
                // `tel` opens the phone keypad; `autoComplete` lets the
                // browser fill it from the saved profile.
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                error={errorFor('phone')}
                {...register('phone')}
              />
            </div>

            <div className={styles.row}>
              <TextField
                label={t('contact.form.email')}
                placeholder={t('contact.form.emailPlaceholder')}
                optional
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                error={errorFor('email')}
                {...register('email')}
              />

              <TextField
                label={t('contact.form.subject')}
                placeholder={t('contact.form.subjectPlaceholder')}
                optional
                error={errorFor('subject')}
                {...register('subject')}
              />
            </div>

            <TextAreaField
              label={t('contact.form.message')}
              placeholder={t('contact.form.messagePlaceholder')}
              required
              rows={6}
              error={errorFor('message')}
              {...register('message')}
            />

            {/* Honeypot. Hidden with CSS, never `type="hidden"` — bots fill
                hidden inputs but generally skip an off-screen one. See
                `useContactForm.ts` for what happens when it is filled. */}
            <input
              className="honeypot"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              {...register('website')}
            />

            <Button type="submit" loading={isSubmitting || submission.isPending} block>
              {isSubmitting || submission.isPending
                ? t('forms.submitting')
                : t('contact.form.submit')}
            </Button>
          </form>
        </div>

        <div className={styles.map}>
          <ImageSlot alt={t('contact.mapAlt')} width={1600} height={500} />
        </div>
      </Section>
    </>
  );
};

export default ContactPage;
