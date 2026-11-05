'use client';
import { useEffect, useRef, useState } from 'react';
import { TOUR_STEPS } from '@/lib/helpContent';
import styles from './AdminTour.module.css';

const KEY = 'admin-tour-done';
export default function AdminTour({ blocked, restart }: { blocked: boolean; restart: number }) {
  const [step, setStep] = useState<number | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const checked = useRef(false);
  const requested = useRef(restart);
  const bubble = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const finish = () => {
    try { localStorage.setItem(KEY, 'true'); } catch { /* The checked ref remembers this page view. */ }
    setStep(null);
    previous.current?.focus();
  };
  useEffect(() => {
    if (blocked) return;
    const frame = requestAnimationFrame(() => {
      let start = false;
      if (!checked.current) {
        checked.current = true;
        try { start = !localStorage.getItem(KEY); } catch { start = true; }
      }
      if (requested.current !== restart) { requested.current = restart; start = true; }
      if (start) { previous.current = document.activeElement as HTMLElement; setStep(0); }
    });
    return () => cancelAnimationFrame(frame);
  }, [blocked, restart]);
  useEffect(() => {
    if (step === null || blocked) return;
    next.current?.focus();
    const targetName = TOUR_STEPS[step].target;
    const target = targetName ? document.querySelector<HTMLElement>(`[data-tour="${targetName}"]`) : null;
    target?.classList.add(styles.highlight);
    target?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const place = () => {
      if (!target || !target.getClientRects().length) { setPosition(null); return; }
      const rect = target.getBoundingClientRect();
      const width = bubble.current?.offsetWidth ?? 340, height = bubble.current?.offsetHeight ?? 240;
      const left = rect.right + 16 + width <= window.innerWidth ? rect.right + 16 : rect.left - width - 16;
      setPosition({ left: Math.max(16, Math.min(left, window.innerWidth - width - 16)), top: Math.max(16, Math.min(rect.top, window.innerHeight - height - 16)) });
    };
    place();
    const observer = new ResizeObserver(place);
    if (target) observer.observe(target);
    if (bubble.current) observer.observe(bubble.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { target?.classList.remove(styles.highlight); observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [step, blocked]);
  useEffect(() => {
    if (step === null || blocked) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); finish(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });
  if (step === null || blocked) return null;
  return <div ref={bubble} className={`${styles.bubble} ${position ? '' : styles.centered}`} style={position ?? undefined} role="dialog" aria-label={TOUR_STEPS[step].title} data-testid="tour-bubble">
    <p>Step {step + 1} of {TOUR_STEPS.length}</p>
    <h2>{TOUR_STEPS[step].title}</h2><p>{TOUR_STEPS[step].text}</p>
    <div className={styles.actions}><button type="button" data-testid="tour-skip" onClick={finish}>Skip</button><button ref={next} type="button" data-testid="tour-next" onClick={() => step === TOUR_STEPS.length - 1 ? finish() : setStep(step + 1)}>{step === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</button></div>
  </div>;
}
