"use client";
import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadCatalog } from '@/lib/admin/catalogQuery';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { isImgbbPlaceholder, isVideoUrl } from '@/lib/imageUtils';

export type Catalog = { products: AdminProduct[]; subcategories: AdminSubcategory[]; loading: boolean; error?: string; retry: () => void; reload: () => Promise<void> };
type Data = { products: AdminProduct[]; subcategories: AdminSubcategory[]; error?: string; at: number };
const STALE_MS = 5 * 60 * 1000;
const CatalogContext = createContext<{ data: Data | null; ensure: () => void; reload: () => Promise<void>; retry: () => void } | null>(null);

function createStore(publish: (update: (previous: Data | null) => Data | null) => void) {
    let revision = 0, inFlight: Promise<void> | null = null, loadedAt = 0, alive = true;
    const store = {
        alive(value: boolean) { alive = value; },
        reload(): Promise<void> {
            const current = ++revision;
            const run: Promise<void> = loadCatalog().then(result => {
                if (!alive || current !== revision) return;
                if (result.error === null) { loadedAt = Date.now(); publish(() => ({ ...result.data, at: loadedAt })); }
                // A failed refresh keeps what is already shown; only a first load reports the error.
                else publish(previous => previous && !previous.error ? previous : { products: [], subcategories: [], error: result.error, at: 0 });
            }).finally(() => { if (inFlight === run) inFlight = null; });
            inFlight = run;
            return run;
        },
        ensure() { if (!inFlight && (!loadedAt || Date.now() - loadedAt > STALE_MS)) void store.reload(); },
        retry() { publish(() => null); loadedAt = 0; void store.reload(); },
    };
    return store;
}

// One catalog (every main category with its subcategories and products, newest product first) shared by all admin
// routes: loaded on first use, kept while the admin moves around, and reloaded only after a write (reload) or when old.
export function CatalogProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<Data | null>(null);
    const [store] = useState(() => createStore(setData));
    useEffect(() => { store.alive(true); return () => store.alive(false); }, [store]);
    const value = useMemo(() => ({ data, ensure: store.ensure, reload: store.reload, retry: store.retry }), [data, store]);
    return createElement(CatalogContext.Provider, { value }, children);
}

export function useCatalog(): Catalog {
    const context = useContext(CatalogContext);
    if (!context) throw new Error('useCatalog needs CatalogProvider');
    const { data, ensure, reload, retry } = context;
    useEffect(() => { ensure(); }, [ensure]);
    return { products: data?.products ?? [], subcategories: data?.subcategories ?? [], loading: data === null, error: data?.error, retry, reload };
}

export type MediaStatus = 'checking' | 'ok' | 'broken';
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;
// Loads each file once in the browser, the same way a visitor's browser would, and reports which ones fail.
export function useMediaCheck(urls: string[]): Map<string, MediaStatus> {
    const [results, setResults] = useState(() => new Map<string, MediaStatus>());
    const key = Array.from(new Set(urls)).sort().join('\n');
    useEffect(() => {
        const list = key ? key.split('\n') : [];
        let disposed = false;
        let next = 0;
        const active = new Set<() => void>();
        const report = (url: string, value: MediaStatus) => { if (!disposed) setResults(previous => new Map(previous).set(url, value)); };
        // At most CONCURRENCY files load at once; each element is released as soon as its check ends.
        const start = () => {
            if (disposed || next >= list.length) return;
            const url = list[next++];
            const media = isVideoUrl(url) ? document.createElement('video') : new Image();
            const release = () => {
                clearTimeout(timer);
                media.onload = media.onerror = null;
                if (media instanceof HTMLVideoElement) { media.onloadedmetadata = null; media.removeAttribute('src'); media.load(); } else media.src = '';
                active.delete(release);
            };
            const done = (value: MediaStatus) => { release(); report(url, value); start(); };
            // A slow file is not reported as broken.
            const timer = setTimeout(() => done('ok'), TIMEOUT_MS);
            active.add(release);
            media.onerror = () => done('broken');
            if (media instanceof HTMLVideoElement) {
                media.preload = 'metadata';
                media.onloadedmetadata = () => done('ok');
            } else media.onload = () => done(isImgbbPlaceholder(url, media.naturalWidth, media.naturalHeight) ? 'broken' : 'ok');
            media.src = url;
        };
        for (let i = 0; i < CONCURRENCY; i++) start();
        return () => { disposed = true; active.forEach(release => release()); };
    }, [key]);
    // A file without a result yet is still being checked.
    return useMemo(() => new Map((key ? key.split('\n') : []).map(url => [url, results.get(url) ?? 'checking'])), [key, results]);
}

export function productMedia(product: AdminProduct): string[] {
    return [product.image, ...(product.images ?? [])].filter(Boolean);
}
