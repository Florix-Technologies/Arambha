'use client';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './HelpTip.module.css';
export default function HelpTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const id = useId();
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', key, true);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key, true); };
  }, [open]);
  return <span ref={root} className={styles.root}><button type="button" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>?</button>{open && <span id={id} className={styles.bubble} role="note">{text}</span>}</span>;
}
