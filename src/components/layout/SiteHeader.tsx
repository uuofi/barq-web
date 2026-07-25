import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { site } from '@/config/site';
import { BoltIcon, PersonIcon, MenuIcon, CloseIcon } from '@/components/icons';
import Container from './Container';
import styles from './SiteHeader.module.css';

/**
 * Primary navigation — pixel-matched to the approved home page design.
 *
 * The site is a single scrolling page: Home / About / Coverage / Services /
 * Merchants / Drivers / FAQ are all sections of `/`, not separate routes, so
 * every item but Home anchors into that page rather than navigating to a new
 * URL. Coverage sits right after About, per the requested nav order (see
 * `CoverageSection.tsx`, rendered directly under `AboutSection` in
 * `HomePage.tsx`). This is a fixed, curated set, not the full
 * `mainNavRoutes` derived list used elsewhere in this codebase.
 */
const NAV_ITEMS = [
  { key: 'nav.home', to: paths.home },
  { key: 'nav.about', to: `${paths.home}#about` },
  { key: 'nav.coverage', to: `${paths.home}#coverage` },
  { key: 'nav.services', to: `${paths.home}#how-it-works` },
  { key: 'nav.merchants', to: `${paths.home}#merchants` },
  { key: 'nav.drivers', to: `${paths.home}#drivers` },
  { key: 'nav.faq', to: `${paths.home}#faq` },
] as const;

export const SiteHeader = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header} data-component="site-header">
      <Container as="div" className={styles.inner}>
        <Link to={paths.home} onClick={closeMenu} className={styles.brand} aria-label={site.name}>
          <span>{site.name}</span>
          <BoltIcon className={styles.brandIcon} />
        </Link>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={() => setIsMenuOpen((open) => !open)}
          className={styles.menuToggle}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          id="primary-navigation"
          aria-label={t('nav.home')}
          data-open={isMenuOpen}
          className={styles.nav}
        >
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) =>
              /*
               * NavLink's active-state matching only looks at pathname, not
               * hash — every "#section" item below resolves to the same "/"
               * pathname as Home, so with NavLink they'd ALL render
               * `aria-current="page"` at once. Only Home (a real, hash-free
               * route) gets NavLink; anchor items are plain links until this
               * page has real scroll-spy.
               */
              item.to.includes('#') ? (
                <li key={item.key}>
                  <Link to={item.to} onClick={closeMenu} className={styles.navLink}>
                    {t(item.key)}
                  </Link>
                </li>
              ) : (
                <li key={item.key}>
                  <NavLink to={item.to} onClick={closeMenu} className={styles.navLink} end>
                    {t(item.key)}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>

        <Link to={paths.download} onClick={closeMenu} className={styles.cta}>
          <PersonIcon className={styles.ctaIcon} />
          {t('nav.submitRequest')}
        </Link>
      </Container>
    </header>
  );
};

export default SiteHeader;
