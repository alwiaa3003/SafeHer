import { Menu, PanelLeftClose, PanelLeftOpen, Pin, PinOff, X } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useMatches } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppShell.module.css';
import { useAutoHideNav } from './useAutoHideNav';

const SIDEBAR_ID = 'site-sidebar';
const DESKTOP_QUERY = '(min-width: 801px)';

// The Crime Map's navigation: an edge handle (wide screens) or a floating menu button
// (narrow and touch screens), and the shared Sidebar in its auto-hiding variant.
function AutoHideNavigation({ nav, regionRef, handleRef }) {
  const label = nav.visible ? 'Hide navigation' : 'Show navigation';
  let HandleIcon = nav.visible ? PanelLeftClose : PanelLeftOpen;
  if (!nav.isWide) HandleIcon = nav.visible ? X : Menu;

  const pinButton = nav.isWide ? (
    <button
      type="button"
      className={styles.pinButton}
      aria-pressed={nav.pinned}
      aria-label={nav.pinned ? 'Unpin navigation' : 'Pin navigation open'}
      title={nav.pinned ? 'Unpin navigation' : 'Pin navigation open'}
      onClick={nav.togglePin}
    >
      {nav.pinned ? <PinOff size={16} aria-hidden="true" /> : <Pin size={16} aria-hidden="true" />}
    </button>
  ) : null;

  return (
    <>
      {nav.modal && <div className={styles.drawerBackdrop} data-testid="menu-backdrop" onClick={() => nav.close({ restoreFocus: true })} />}
      <div ref={regionRef} className={styles.navRegion} data-state={nav.state} {...nav.regionProps}>
        {nav.canHover && !nav.visible && <div className={styles.edgeZone} data-testid="nav-edge" aria-hidden="true" {...nav.edgeProps} />}
        <Sidebar
          id={SIDEBAR_ID}
          variant="autoHide"
          open={nav.visible}
          docked={nav.docked}
          onNavigate={nav.onNavigate}
          headerAction={pinButton}
        />
        <button
          ref={handleRef}
          type="button"
          className={nav.isWide ? styles.edgeHandle : styles.floatingMenuButton}
          data-open={nav.visible}
          aria-expanded={nav.visible}
          aria-controls={SIDEBAR_ID}
          aria-label={label}
          title={label}
          onClick={nav.onHandleClick}
        >
          <HandleIcon size={nav.isWide ? 16 : 20} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const menuButtonRef = useRef(null);
  const previousPath = useRef(pathname);
  const matches = useMatches();
  const fullBleed = matches.some((match) => match.handle?.fullBleed);
  const autoHide = matches.some((match) => match.handle?.autoHideNav);
  const navRegionRef = useRef(null);
  const navHandleRef = useRef(null);
  const nav = useAutoHideNav(autoHide, { regionRef: navRegionRef, handleRef: navHandleRef });

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

  const shellClass = autoHide ? `${styles.shell} ${styles.shellAutoHide}` : styles.shell;
  const mainClass = fullBleed ? `${styles.main} ${styles.mainFull}` : styles.main;

  return (
    <div className={shellClass} data-nav={autoHide ? nav.state : undefined}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      {autoHide ? (
        <AutoHideNavigation nav={nav} regionRef={navRegionRef} handleRef={navHandleRef} />
      ) : (
        <>
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
        </>
      )}

      <main
        ref={mainRef}
        id="main-content"
        className={mainClass}
        tabIndex={-1}
        inert={autoHide ? nav.modal : menuOpen}
      >
        <div className={fullBleed ? styles.contentFull : styles.content}>
          {/* Pages other than the map load on first visit; the shell and navigation stay put. */}
          <Suspense fallback={<p className={styles.pageLoading} role="status">Loading page…</p>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
