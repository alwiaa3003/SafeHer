import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './MethodologyNote.module.css';

export function MethodologyNote() {
  return (
    <aside className={styles.note} aria-label="Methodology note">
      <Info size={20} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
      <p>
        <strong>Reading these figures.</strong> They count police-registered cases, which is not
        the same as how often crime occurs. NCRB cautions that more registered crime does not
        indicate a place is comparatively unsafe. Only the most serious offence in each case is
        counted. See <Link to="/methodology">Methodology</Link> for how figures are checked and
        their limits.
      </p>
    </aside>
  );
}
