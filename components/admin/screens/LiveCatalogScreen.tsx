"use client";
import { useEffect, useState } from 'react';
import { listCategories, listProducts } from '@/lib/admin/data';
import { TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { Button, Card } from '../ui';
import { CategoryScreen } from './CategoryScreen';
import { SubcategoryScreen } from './SubcategoryScreen';

export function LiveCatalogScreen({ category, subcategoryId }: { category: CategoryKey; subcategoryId?: string }) {
    const [data, setData] = useState<{ products: AdminProduct[]; subcategories: AdminSubcategory[] } | null>(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let cancelled = false;
        async function load() {
            const categories = await listCategories(category);
            const products = categories.error === null ? await listProducts(category, subcategoryId, categories.data) : { data: null, error: categories.error };
            if (cancelled) return;
            if (categories.error !== null || products.error !== null) { setError(categories.error ?? products.error ?? 'Could not load catalog'); return; }
            setData({ subcategories: categories.data, products: products.data });
        }
        void load();
        return () => { cancelled = true; };
    }, [category, subcategoryId, attempt]);
    if (error) return <Card><p role="alert">{error}</p><Button onClick={() => { setError(''); setAttempt(n => n + 1); }}>Retry</Button></Card>;
    if (!data) return <p role="status">{TERMS.loading}…</p>;
    const onDeleted = (id: string) => setData(previous => previous && ({ ...previous, products: previous.products.filter(p => p.id !== id) }));
    if (subcategoryId) {
        const subcategory = data.subcategories.find(sub => sub.id === subcategoryId);
        if (!subcategory) return <Card><p role="alert">Subcategory not found in this category.</p><Button href={`/admin-v2/${category}`}>Back to category</Button></Card>;
        return <SubcategoryScreen subcategoryId={subcategoryId} category={category} name={subcategory.name} products={data.products} basePath="/admin-v2" onDeleted={onDeleted} />;
    }
    return <CategoryScreen category={category} subcategories={data.subcategories} products={data.products} basePath="/admin-v2" onDeleted={onDeleted} />;
}
