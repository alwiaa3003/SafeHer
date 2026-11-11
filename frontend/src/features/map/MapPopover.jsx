import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import styles from './MapExplorer.module.css';

// A floating panel opened from a toolbar button. Escape closes it and returns focus.
export function MapPopover({ id, title, open, onClose, returnFocusTo, children }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        returnFocusTo?.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, returnFocusTo]);

  if (!open) return null;
  return (
    <section id={id} ref={panelRef} tabIndex={-1} className={styles.popover} aria-labelledby={`${id}-title`}>
      <div className={styles.popoverHead}>
        <h2 id={`${id}-title`} className={styles.popoverTitle}>{title}</h2>
        <button type="button" className={styles.iconButton} onClick={() => { onClose(); returnFocusTo?.current?.focus(); }} aria-label={`Close ${title.toLowerCase()}`}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  );
}
