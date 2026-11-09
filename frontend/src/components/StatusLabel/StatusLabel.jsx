import { CircleCheck, CircleDashed, CircleMinus } from 'lucide-react';
import { STATUS_KIND } from '../../data/status';
import styles from './StatusLabel.module.css';

const VARIANTS = {
  [STATUS_KIND.VERIFIED]: { icon: CircleCheck, text: 'Verified', className: styles.verified },
  [STATUS_KIND.INCOMPLETE]: { icon: CircleDashed, text: 'Incomplete', className: styles.incomplete },
  [STATUS_KIND.UNAVAILABLE]: { icon: CircleMinus, text: 'Unavailable', className: styles.unavailable },
};

// Status is always carried by words and an icon, never by colour alone.
export function StatusLabel({ kind, children }) {
  const { icon: Icon, text, className } = VARIANTS[kind];
  return (
    <span className={`${styles.label} ${className}`} data-status={kind}>
      <Icon size={16} strokeWidth={2} aria-hidden="true" className={styles.icon} />
      {children ?? text}
    </span>
  );
}
