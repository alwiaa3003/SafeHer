import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppShell.module.css';

const SIDEBAR_ID = 'site-sidebar';
const DESKTOP_QUERY = '(min-width: 801px)';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const menuButtonRef = useRef(null);
  const previousPath = useRef(pathname);

  // After a page change, move keyboard and screen-reader users to the new page.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [pathname]);

  // While the mobile menu is open, Escape closes it.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Widening the window back to desktop should not leave the menu "open".
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.topBar}>
        <Link className={styles.topBarBrand} to="/">
          SafeHer
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls={SIDEBAR_ID}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>

      <Sidebar
        id={SIDEBAR_ID}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />

      {menuOpen && (
        <div
          className={styles.backdrop}
          data-testid="menu-backdrop"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main
        ref={mainRef}
        id="main-content"
        className={styles.main}
        tabIndex={-1}
        inert={menuOpen}
      >
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
