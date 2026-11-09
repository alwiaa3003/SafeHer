import { useEffect } from 'react';
import styles from './PageHeader.module.css';

export function PageHeader({ eyebrow, title, description, documentTitle }) {
  const tabTitle = documentTitle ?? title;

  useEffect(() => {
    document.title = `${tabTitle} · SafeHer`;
  }, [tabTitle]);

  return (
    <header className={styles.header}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
