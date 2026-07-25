import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { site } from '@/config/site';
import { telHref, whatsappHref } from '@/lib/utils/url';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Site footer — structure only.
 *
 * Contact rows render conditionally on `site.contact.*`, which come from env.
 * That is deliberate: a footer must never show an empty `tel:` link or a
 * placeholder like "+964 XXX" in production. Missing config = missing row.
 *
 * `LanguageSwitcher` lives here rather than in the header: the approved home
 * page design has no language control in its header, and the footer is the
 * one landmark every page shares that isn't pinned to that design.
 */
export const SiteFooter = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer data-component="site-footer">
      <nav aria-label={t('footer.terms')}>
        <ul>
          <li>
            <Link to={`${paths.home}#about`}>{t('nav.about')}</Link>
          </li>
          <li>
            <Link to={`${paths.home}#coverage`}>{t('footer.coverage')}</Link>
          </li>
          <li>
            <Link to={`${paths.home}#faq`}>{t('nav.faq')}</Link>
          </li>
          <li>
            <Link to={paths.legal.terms}>{t('footer.terms')}</Link>
          </li>
          <li>
            <Link to={paths.legal.privacy}>{t('footer.privacy')}</Link>
          </li>
        </ul>
      </nav>

      <address data-component="footer-contact">
        {site.contact.phone && <a href={telHref(site.contact.phone)}>{site.contact.phone}</a>}
        {site.contact.email && <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>}
        {site.contact.whatsapp && (
          <a href={whatsappHref(site.contact.whatsapp)} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        )}
      </address>

      <LanguageSwitcher />

      <p data-component="footer-legal">
        © {year} {site.legalName} — {t('footer.rights')}
      </p>
    </footer>
  );
};

export default SiteFooter;
