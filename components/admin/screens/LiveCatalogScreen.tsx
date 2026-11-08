"use client";
import { useEffect, useState } from 'react';
import { listCategories, listProducts } from '@/lib/admin/data';
import { CATEGORIES, type CategoryKey } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { Button, Card, Skeleton } from '../ui';
import { CategoryScreen } from './CategoryScreen';
import { SubcategoryScreen } from './SubcategoryScreen';

// Loads one main category (its subcategories and their products) and shows either the category or one subcategory.
export function LiveCatalogScreen({ category, subcategoryId }: { category: CategoryKey; subcategoryId?: string }) {
    const [data, setData] = useState<{ products: AdminProduct[]; subcategories: AdminSubcategory[] } | null>(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let cancelled = false;
        async function load() {
            const categories = await listCategories(category);
            const products = categories.error === null ? await listProducts(category, undefined, categories.data) : { data: null, error: categories.error };
            if (cancelled) return;
            if (categories.error !== null || products.error !== null) { setError(categories.error ?? products.error ?? 'Could not load the catalog.'); return; }
            setError('');
            setData({ subcategories: [...categories.data].sort((a, b) => a.name.localeCompare(b.name)), products: products.data });
        }
        void load();
        return () => { cancelled = true; };
    }, [category, attempt]);
    const reload = () => setAttempt(n => n + 1);
    if (error) return <Card><p role="alert">{error}</p><Button onClick={() => { setError(''); reload(); }}>Try again</Button></Card>;
    if (!data) return <Card><Skeleton lines={5} /></Card>;
    if (subcategoryId) {
        const subcategory = data.subcategories.find(sub => sub.id === subcategoryId);
        if (!subcategory) return <Card><p role="alert">This subcategory no longer exists in {CATEGORIES[category].label}.</p><Button href={`/admin/${category}`}>Back to {CATEGORIES[category].label}</Button></Card>;
        return <SubcategoryScreen subcategory={subcategory} subcategories={data.subcategories} products={data.products.filter(p => p.subcategoryId === subcategoryId)} onChanged={reload} />;
    }
    return <CategoryScreen category={category} subcategories={data.subcategories} products={data.products} onChanged={reload} />;
}
