import { PageHeader } from '../PageHeader/PageHeader';
import styles from './PageShell.module.css';

// A truthful placeholder: it says what a page will do and what it depends on.
// It deliberately has no charts or figures.
export function PageShell({ eyebrow, title, description, questions, dataNote }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className={styles.panels}>
        <section className={styles.panel} aria-labelledby="planned-heading">
          <h2 id="planned-heading" className={styles.heading}>
            This page will answer
          </h2>
          <ul className={styles.list}>
            {questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>
        <section className={styles.panel} aria-labelledby="state-heading">
          <h2 id="state-heading" className={styles.heading}>
            Current state
          </h2>
          <p className={styles.note}>{dataNote}</p>
        </section>
      </div>
    </>
  );
}
