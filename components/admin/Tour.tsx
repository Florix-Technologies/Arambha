"use client";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { CategoryKey } from '@/lib/admin/taxonomy';
import { TOUR_STEPS } from '@/lib/helpContent';
import { Button } from './ui';
import { useCatalog } from './useCatalog';
import s from './Tour.module.css';

// The guided tour: highlights real elements (data-tour="...") while it walks through the real pages. It starts only
// when asked (Help button, Help page, or the offer on Overview). The step survives page changes in sessionStorage,
// and "done / skipped" is remembered in localStorage so the offer is not repeated.
const STEP_KEY = 'arambha-admin-tour-step';
const DONE_KEY = 'arambha-admin-tour';
type Kind = 'local' | 'session';
function read(kind: Kind, key: string) { try { return (kind === 'local' ? localStorage : sessionStorage).getItem(key); } catch { return null; } }
function write(kind: Kind, key: string, value: string | null) {
    try { const area = kind === 'local' ? localStorage : sessionStorage; if (value === null) area.removeItem(key); else area.setItem(key, value); } catch { /* storage blocked: the tour still works, it is just not remembered */ }
}

type TourApi = { active: boolean; start: () => void; offered: boolean; dismissOffer: () => void };
const TourContext = createContext<TourApi>({ active: false, start: () => {}, offered: false, dismissOffer: () => {} });
export const useTour = () => useContext(TourContext);

export function TourProvider({ children }: { children: ReactNode }) {
    // Only rendered after login in the browser (never in server HTML), so storage can be read straight away.
    const [step, setStep] = useState<number | null>(() => {
        const saved = read('session', STEP_KEY);
        const n = Number(saved);
        return saved !== null && Number.isInteger(n) && n >= 0 && n < TOUR_STEPS.length ? n : null;
    });
    const [seen, setSeen] = useState(() => read('local', DONE_KEY) !== null);
    const go = useCallback((n: number | null) => { setStep(n); write('session', STEP_KEY, n === null ? null : String(n)); }, []);
    const end = useCallback((how: 'done' | 'skipped') => { write('local', DONE_KEY, how); setSeen(true); go(null); }, [go]);
    const api = useMemo<TourApi>(() => ({ active: step !== null, start: () => go(0), offered: !seen && step === null, dismissOffer: () => end('skipped') }), [step, seen, go, end]);
    return <TourContext.Provider value={api}>{children}{step !== null && <TourPopover step={step} onStep={go} onEnd={end} />}</TourContext.Provider>;
}

type Spot = { top: number; left: number; width: number; height: number };
const PAD = 6;
const sameSpot = (a: Spot | null, b: Spot | null) => a === b || (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height);
const dialogOpen = () => !!document.querySelector('[role="dialog"][data-state="open"]');

function TourPopover({ step, onStep, onEnd }: { step: number; onStep: (n: number) => void; onEnd: (how: 'done' | 'skipped') => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const { products, subcategories, loading } = useCatalog();
    const def = TOUR_STEPS[step];
    const last = step === TOUR_STEPS.length - 1;
    const ref = useRef<HTMLDivElement>(null);
    const scrolled = useRef<Element | null>(null);
    const [spot, setSpot] = useState<Spot | null>(null);
    const [settledFor, setSettledFor] = useState('');
    const [paused, setPaused] = useState(false);
    const [view, setView] = useState({ w: 1280, h: 800 });
    const [height, setHeight] = useState(220);

    // The main category the tour walks through, and a subcategory in it (one with products when there is one).
    const category: CategoryKey = (['interiors', 'furniture'] as const).find(key => subcategories.some(sub => sub.category === key)) ?? 'interiors';
    const sub = subcategories.find(x => x.category === category && products.some(p => p.subcategoryId === x.id)) ?? subcategories.find(x => x.category === category);
    const pathFor = (page: typeof def.page) => page === 'any' ? null : page === 'category' || (page === 'subcategory' && !sub) ? `/admin/${category}`
        : page === 'subcategory' ? `/admin/${category}/${encodeURIComponent(sub!.id)}`
            : `/admin/products/new?category=${category}${sub ? `&subcategory=${encodeURIComponent(sub.id)}` : ''}`;
    const go = (n: number) => {
        const path = pathFor(TOUR_STEPS[n].page);
        if (path && path.split('?')[0] !== pathname) {
            // A form with unsaved changes (ProductForm) may cancel the move; the tour then stays on this step.
            if (!window.dispatchEvent(new Event('admin:leave', { cancelable: true }))) return;
            router.push(path);
        }
        onStep(n);
    };

    useEffect(() => {
        const key = `${step}|${pathname}`;
        const names = def.target.map(name => name === 'nav-category' ? `nav-${category}` : name);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const find = () => {
            for (const name of names) for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)) {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) return el;
            }
            return null;
        };
        const measure = () => {
            setView(previous => previous.w === innerWidth && previous.h === innerHeight ? previous : { w: innerWidth, h: innerHeight });
            setPaused(dialogOpen());
            const el = find();
            if (el && scrolled.current !== el) { scrolled.current = el; el.scrollIntoView({ block: innerWidth < 768 ? 'start' : 'center', behavior: reduce ? 'auto' : 'smooth' }); }
            if (!el) scrolled.current = null;
            const r = el?.getBoundingClientRect();
            const next = r ? { top: r.top - PAD, left: r.left - PAD, width: r.width + 2 * PAD, height: r.height + 2 * PAD } : null;
            setSpot(previous => sameSpot(previous, next) ? previous : next);
            if (el) setSettledFor(key);
        };
        // The page may still be loading after a step change: only then fall back to showing the step centered.
        const wait = setTimeout(() => setSettledFor(key), 900);
        const first = setTimeout(measure, 0);
        const poll = setInterval(measure, 150);
        addEventListener('resize', measure);
        addEventListener('scroll', measure, true);
        return () => { clearTimeout(wait); clearTimeout(first); clearInterval(poll); removeEventListener('resize', measure); removeEventListener('scroll', measure, true); scrolled.current = null; };
    }, [def, step, category, pathname, loading]);

    useEffect(() => {
        const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented && !dialogOpen()) onEnd('skipped'); };
        document.addEventListener('keydown', key);
        return () => document.removeEventListener('keydown', key);
    }, [onEnd]);

    const shown = settledFor === `${step}|${pathname}` && !paused;
    useLayoutEffect(() => { if (ref.current) setHeight(ref.current.offsetHeight); }, [step, shown]);
    useEffect(() => { if (shown) ref.current?.focus({ preventScroll: true }); }, [step, shown]);
    if (!shown) return null;

    // Phones: docked to the bottom, or the top when the highlighted element is in the lower half, so it is never covered.
    const phone = view.w < 768;
    const width = Math.min(380, view.w - 32);
    let style: CSSProperties = {};
    let dock: 'top' | 'bottom' | undefined;
    if (phone && spot) dock = spot.top + spot.height / 2 > view.h / 2 ? 'top' : 'bottom';
    else if (!spot) style = { top: Math.max(16, (view.h - height) / 2), left: phone ? undefined : (view.w - width) / 2 };
    else {
        const below = spot.top + spot.height + 8;
        const above = spot.top - 8 - height;
        style = { top: below + height <= view.h - 16 ? below : above >= 16 ? above : Math.max(16, view.h - height - 16), left: Math.min(Math.max(16, spot.left), view.w - width - 16) };
    }
    return <>
        {spot ? <div className={s.spot} style={spot} aria-hidden="true" /> : <div className={s.dim} aria-hidden="true" />}
        <div ref={ref} className={s.tour} style={style} data-dock={dock} role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-body" tabIndex={-1}>
            <p className={s.count}>Step {step + 1} of {TOUR_STEPS.length}</p>
            <h2 className={s.title} id="tour-title">{def.title}</h2>
            <p className={s.body} id="tour-body">{def.body}</p>
            <div className={s.actions}>
                <Button variant="secondary" onClick={() => go(step - 1)} disabled={step === 0}>Back</Button>
                {last ? <Button onClick={() => onEnd('done')}>Finish</Button> : <Button onClick={() => go(step + 1)}>Next</Button>}
                <span className={s.spacer} />
                {!last && <Button variant="plain" onClick={() => onEnd('skipped')}>Skip</Button>}
            </div>
        </div>
    </>;
}

// A small, dismissible offer shown on Overview until the tour has been taken or skipped.
export function TourOffer() {
    const { offered, start, dismissOffer } = useTour();
    if (!offered) return null;
    return <section className={s.offer} aria-label="Guided tour">
        <p><strong>New here? Take a short tour.</strong>See how to add a subcategory and a product, step by step, on the real pages.</p>
        <Button onClick={start}>Take a tour</Button>
        <Button variant="plain" onClick={dismissOffer}>No thanks</Button>
    </section>;
}
