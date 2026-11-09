import { ArrowRight, Building2, Layers, Map, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panel } from '../../components/Panel/Panel';
import styles from './ExploreFurther.module.css';

const LINKS = [
  { to: '/crime-trends', label: 'View crime trends', icon: TrendingUp },
  { to: '/crime-categories', label: 'Explore categories and definitions', icon: Layers },
  { to: '/metro-comparison', label: 'Compare Delhi City with other metros', icon: Building2 },
  { to: '/geographic-explorer', label: 'Explore geographic context', icon: Map },
];

export function ExploreFurther() {
  return (
    <Panel title="Explore further">
      <ul className={styles.list}>
        {LINKS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link className={styles.link} to={to}>
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
