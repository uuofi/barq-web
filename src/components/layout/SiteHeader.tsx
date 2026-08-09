import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { site } from '@/config/site';
import { PersonIcon, MenuIcon, CloseIcon } from '@/components/icons';
import Container from './Container';
import Logo from './Logo';
import styles from './SiteHeader.module.css';

/**
 * Primary navigation.
 *
 * The site is a real multi-page site: every item here is a route, so all of
 * them are `NavLink`s and the active one is marked with `aria-current="page"`
 * by react-router. (This used to be a curated list of `#anchor` links into a
 * one-page layout, which is why the previous version had to special-case the
 * active state — that problem is gone with the anchors.)
 *
 * Order is the READING order in RTL: `nav.home` renders closest to the logo on
 * the right, stepping left toward the CTA.
 */
const NAV_ITEMS = [
  { key: 'nav.home', to: paths.home },
  { key: 'nav.about', to: paths.about },
  { key: 'nav.services', to: paths.services },
  { key: 'nav.merchants', to: paths.merchants },
  { key: 'nav.drivers', to: paths.drivers },
  { key: 'nav.blog', to: paths.blog },
  { key: 'nav.pricing', to: paths.pricing },
] as const;

export const SiteHeader = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setIsMenuOpen(false);

  /*
   * Navigating closes the panel. Without this, tapping a link on mobile
   * changes the page behind an overlay that stays open — the single most
   * common mobile-nav bug.
   */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  /*
   * Escape closes it and returns focus to the button that opened it. A
   * keyboard user who opens the panel must have a way out that does not
   * require tabbing through every link first (the `escape-routes` rule).
   */
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMenuOpen(false);
      toggleRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className={styles.header} data-component="site-header">
      <Container as="div" size="wide" className={styles.inner}>
        <Link to={paths.home} onClick={closeMenu} className={styles.brand} aria-label={site.name}>
          <span>{site.name}</span>
          <Logo className={styles.brandIcon} />
        </Link>

        <button
          ref={toggleRef}
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
          <ul role="list" className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <NavLink to={item.to} onClick={closeMenu} className={styles.navLink} end>
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link to={paths.apply.driver} onClick={closeMenu} className={styles.cta}>
            <PersonIcon className={styles.ctaIcon} />
            {t('nav.submitRequest')}
          </Link>
        </div>
      </Container>
    </header>
  );
};

export default SiteHeader;
