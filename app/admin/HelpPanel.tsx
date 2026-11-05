'use client';
import { useEffect, useRef } from 'react';
import { HELP_GUIDES } from '@/lib/helpContent';
import styles from './HelpPanel.module.css';

export default function HelpPanel({ open, onOpenChange, onRestart }: { open: boolean; onOpenChange: (open: boolean) => void; onRestart: () => void }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const opener = trigger.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = panel.current?.querySelector<HTMLButtonElement>('button');
    close?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); onOpenChange(false); }
      if (event.key === 'Tab') {
        const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>('button, summary') ?? []);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const focus = (event: FocusEvent) => { if (!panel.current?.contains(event.target as Node)) close?.focus(); };
    document.addEventListener('keydown', key, true);
    document.addEventListener('focusin', focus);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key, true);
      document.removeEventListener('focusin', focus);
      opener?.focus();
    };
  }, [open, onOpenChange]);
  return <>
    <button ref={trigger} type="button" className={styles.trigger} data-tour="help" data-testid="help-open" aria-expanded={open} aria-controls="admin-help" onClick={() => onOpenChange(true)}>Help</button>
    {open && <div className={styles.overlay}>
      <div ref={panel} id="admin-help" className={styles.panel} role="dialog" aria-modal="true" aria-label="Help" data-testid="help-panel">
        <header className={styles.header}><h2>Help</h2><button type="button" onClick={() => onOpenChange(false)}>Close</button></header>
        {HELP_GUIDES.map(guide => <details key={guide.id}><summary>{guide.title}</summary><ol>{guide.steps.map(step => <li key={step}>{step}</li>)}</ol></details>)}
        <button type="button" className={styles.restart} data-testid="help-restart-tour" onClick={onRestart}>Restart the tour</button>
      </div>
    </div>}
  </>;
}
