import { Link, NavLink } from 'react-router-dom';
import { navigationGroups } from '../../app/navigation';
import styles from './Sidebar.module.css';

export function Sidebar({ id, open, onNavigate }) {
  const sidebarClass = open
    ? `${styles.sidebar} ${styles.open}`
    : styles.sidebar;

  return (
    <aside id={id} className={sidebarClass}>
      <Link className={styles.brand} to="/" onClick={onNavigate}>
        <span className={styles.wordmark}>SafeHer</span>
        <span className={styles.tagline}>Delhi crime records, examined</span>
      </Link>

      <nav className={styles.nav} aria-label="Main">
        {navigationGroups.map((group) => (
          <section key={group.label} className={styles.group}>
            <h2 className={styles.groupLabel}>{group.label}</h2>
            <ul className={styles.links}>
              {group.links.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.link} ${styles.active}`
                        : styles.link
                    }
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <p className={styles.note}>
        A portfolio project using registered crime records. Not a guide for
        personal safety decisions.
      </p>
    </aside>
  );
}
