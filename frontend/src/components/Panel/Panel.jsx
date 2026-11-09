import { useId } from 'react';
import styles from './Panel.module.css';

export function Panel({ title, description, aside, children, className }) {
  const headingId = useId();
  const panelClass = className ? `${styles.panel} ${className}` : styles.panel;

  return (
    <section className={panelClass} aria-labelledby={headingId}>
      <div className={styles.head}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
      {children}
    </section>
  );
}
