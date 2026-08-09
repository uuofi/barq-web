import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { site } from '@/config/site';
import { cn } from '@/lib/utils/cn';
import { telHref, whatsappHref } from '@/lib/utils/url';
import { FacebookIcon, InstagramIcon, XIcon, LinkedinIcon } from '@/components/icons';
import Container from './Container';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';
import styles from './SiteFooter.module.css';

/**
 * Site footer.
 *
 * Contact rows and social icons render conditionally on `site.contact.*` /
 * `site.social.*`, which come from env and from the brand config. That is
 * deliberate: a footer must never show an empty `tel:` link, a placeholder
 * like "+964 XXX", or a social icon pointing at a page that does not exist.
 * Missing config = missing row.
 *
 * `LanguageSwitcher` lives here rather than in the header: the approved design
 * has no language control in its header, and the footer is the one landmark
 * every page shares that isn't pinned to that design.
 */

const PLATFORM_LINKS = [
  { key: 'nav.services', to: paths.services },
  { key: 'nav.merchants', to: paths.merchants },
  { key: 'nav.drivers', to: paths.drivers },
  { key: 'nav.pricing', to: paths.pricing },
  { key: 'nav.howItWorks', to: paths.howItWorks },
] as const;

const COMPANY_LINKS = [
  { key: 'nav.about', to: paths.about },
  { key: 'footer.coverage', to: paths.coverage },
  { key: 'nav.blog', to: paths.blog },
  { key: 'nav.contact', to: paths.contact },
] as const;

const SUPPORT_LINKS = [
  { key: 'nav.download', to: paths.download },
  { key: 'footer.terms', to: paths.legal.terms },
  { key: 'footer.privacy', to: paths.legal.privacy },
  // Reachable from every page: the app stores expect the deletion URL to be
  // findable from the site itself, not only from a link buried in the app's
  // settings.
  { key: 'account.delete.title', to: paths.account.delete },
] as const;

const SOCIAL_LINKS = [
  { key: 'facebook', href: site.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
  { key: 'instagram', href: site.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
  { key: 'x', href: site.social.x, Icon: XIcon, label: 'X' },
  { key: 'linkedin', href: site.social.linkedin, Icon: LinkedinIcon, label: 'LinkedIn' },
] as const;

export const SiteFooter = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const socials = SOCIAL_LINKS.filter((item) => item.href);

  return (
    <footer className={styles.footer} data-component="site-footer">
      <Container size="wide">
        <div className={styles.top}>
          <div>
            <Link to={paths.home} className={styles.brand} aria-label={site.name}>
              <span>{site.name}</span>
              <Logo className={styles.brandIcon} />
            </Link>
            <p className={styles.tagline}>{t('footer.tagline')}</p>

            <address className={cn(styles.contact, styles.linkList)}>
              {site.contact.phone && (
                <a className={styles.link} href={telHref(site.contact.phone)} dir="ltr">
                  {site.contact.phone}
                </a>
              )}
              {site.contact.email && (
                <a className={styles.link} href={`mailto:${site.contact.email}`} dir="ltr">
                  {site.contact.email}
                </a>
              )}
              {site.contact.whatsapp && (
                <a
                  className={styles.link}
                  href={whatsappHref(site.contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </address>

            {socials.length > 0 && (
              <div className={styles.social}>
                {socials.map(({ key, href, Icon, label }) => (
                  <a
                    key={key}
                    href={href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Icon-only control: without this it announces as an
                    // unlabelled link.
                    aria-label={label}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterColumn title={t('footer.sections.platform')} links={PLATFORM_LINKS} />
          <FooterColumn title={t('footer.sections.company')} links={COMPANY_LINKS} />
          <FooterColumn title={t('footer.sections.support')} links={SUPPORT_LINKS} />
        </div>

        <div className={styles.bottom}>
          <p data-component="footer-legal">
            © {year} {site.legalName} — {t('footer.rights')}
          </p>
          <LanguageSwitcher />
        </div>
      </Container>
    </footer>
  );
};

/** Shared markup for the three link columns. */
const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: readonly { key: string; to: string }[];
}) => {
  const { t } = useTranslation();

  return (
    <nav aria-label={title}>
      <h2 className={styles.columnTitle}>{title}</h2>
      <ul role="list" className={styles.linkList}>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={styles.link}>
              {t(link.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SiteFooter;
