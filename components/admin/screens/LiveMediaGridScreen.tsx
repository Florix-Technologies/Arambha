"use client";
import { useEffect, useState } from 'react';
import { listCategories, listProducts } from '@/lib/admin/data';
import type { AdminMedia, AdminSubcategory } from '@/lib/admin/types';
import { TERMS } from '@/lib/admin/taxonomy';
import { Button, Card } from '../ui';
import { MediaGridScreen } from './MediaGridScreen';

export function LiveMediaGridScreen({ subcategoryId }: { subcategoryId: string }) {
    const [data, setData] = useState<{ name: string; media: AdminMedia[]; subcategories: AdminSubcategory[] } | null>(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const categories = await listCategories('gallery');
                const products = categories.error === null ? await listProducts('gallery', subcategoryId, categories.data) : { data: null, error: categories.error };
                if (cancelled) return;
                if (categories.error !== null || products.error !== null) throw new Error(categories.error ?? products.error ?? 'Could not load gallery.');
                const sub = categories.data.find(item => item.id === subcategoryId);
                if (!sub) throw new Error('Gallery subcategory not found.');
                setData({ name: sub.name, subcategories: categories.data, media: products.data.map(p => ({ id: p.id, file: p.image, caption: p.name, subcategory: sub.name })) });
            } catch (error) { if (!cancelled) setError(error instanceof Error ? error.message : 'Could not load gallery.'); }
        }
        void load();
        return () => { cancelled = true; };
    }, [subcategoryId, attempt]);
    if (error) return <Card><p role="alert">{error}</p><Button onClick={() => { setError(''); setAttempt(n => n + 1); }}>Retry</Button></Card>;
    if (!data) return <p role="status">{TERMS.loading}…</p>;
    return <MediaGridScreen {...data} uploads={[]} subcategoryId={subcategoryId} onUploaded={item => setData(previous => previous && ({ ...previous, media: [...previous.media, item] }))} />;
}
