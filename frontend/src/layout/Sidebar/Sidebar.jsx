import { Link, NavLink } from 'react-router-dom';
import { navigationGroups } from '../../app/navigation';
import styles from './Sidebar.module.css';

// One navigation for every page. On the Crime Map it is used in the auto-hiding variant:
// fixed at the left edge, slid out of view while hidden, and inert so hidden links cannot be focused.
export function Sidebar({ id, open, onNavigate, variant = 'standard', docked = false, headerAction = null }) {
  const autoHide = variant === 'autoHide';
  const classes = [styles.sidebar];
  if (open) classes.push(styles.open);
  if (autoHide) classes.push(styles.autoHide);
  if (autoHide && docked) classes.push(styles.docked);

  return (
    <aside
      id={id}
      className={classes.join(' ')}
      inert={autoHide && !open ? true : undefined}
      aria-label={autoHide ? 'Site navigation' : undefined}
    >
      <div className={styles.head}>
        <Link className={styles.brand} to="/" onClick={onNavigate}>
          <span className={styles.wordmark}>SafeHer</span>
          <span className={styles.tagline}>Delhi crime records, examined</span>
        </Link>
        {headerAction}
      </div>

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
