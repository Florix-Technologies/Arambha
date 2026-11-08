"use client";
import { useEffect, useMemo, useState } from 'react';
import { listCategories, listProducts } from '@/lib/admin/data';
import { CATEGORY_KEYS } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { isImgbbPlaceholder, isVideoUrl } from '@/lib/imageUtils';

export type Catalog = { products: AdminProduct[]; subcategories: AdminSubcategory[]; loading: boolean; error?: string; retry: () => void };

// Every main category with its subcategories and products, newest product first.
export function useCatalog(): Catalog {
    const [state, setState] = useState<Omit<Catalog, 'retry'>>({ products: [], subcategories: [], loading: true });
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let disposed = false;
        async function load() {
            try {
                const collections = await Promise.all(CATEGORY_KEYS.map(async category => {
                    const subcategories = await listCategories(category);
                    const products = subcategories.error === null ? await listProducts(category, undefined, subcategories.data) : { data: null, error: subcategories.error };
                    if (subcategories.error !== null || products.error !== null) throw new Error('Catalog request failed');
                    return { subcategories: subcategories.data, products: products.data };
                }));
                if (!disposed) setState({
                    products: collections.flatMap(c => c.products).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
                    subcategories: collections.flatMap(c => c.subcategories).sort((a, b) => a.name.localeCompare(b.name)),
                    loading: false,
                });
            } catch {
                if (!disposed) setState({ products: [], subcategories: [], loading: false, error: 'Could not load the catalog. Check your connection and try again.' });
            }
        }
        void load();
        return () => { disposed = true; };
    }, [attempt]);
    return { ...state, retry: () => { setState({ products: [], subcategories: [], loading: true }); setAttempt(n => n + 1); } };
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
