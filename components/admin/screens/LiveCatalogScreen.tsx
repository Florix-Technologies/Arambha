"use client";
import { useMemo } from 'react';
import { CATEGORIES, type CategoryKey } from '@/lib/admin/taxonomy';
import { Button, Card, Skeleton } from '../ui';
import { useCatalog } from '../useCatalog';
import { CategoryScreen } from './CategoryScreen';
import { SubcategoryScreen } from './SubcategoryScreen';

// Shows one main category (its subcategories and their products) or one subcategory, from the shared catalog.
export function LiveCatalogScreen({ category, subcategoryId }: { category: CategoryKey; subcategoryId?: string }) {
    const { products: all, subcategories: allSubs, loading, error, retry, reload } = useCatalog();
    const subcategories = useMemo(() => allSubs.filter(sub => sub.category === category), [allSubs, category]);
    const products = useMemo(() => all.filter(p => p.category === category), [all, category]);
    if (error) return <Card><p role="alert">{error}</p><Button onClick={retry}>Try again</Button></Card>;
    if (loading) return <Card><Skeleton lines={5} /></Card>;
    if (subcategoryId) {
        const subcategory = subcategories.find(sub => sub.id === subcategoryId);
        if (!subcategory) return <Card><p role="alert">This subcategory no longer exists in {CATEGORIES[category].label}.</p><Button href={`/admin/${category}`}>Back to {CATEGORIES[category].label}</Button></Card>;
        return <SubcategoryScreen subcategory={subcategory} subcategories={subcategories} products={products.filter(p => p.subcategoryId === subcategoryId)} onChanged={() => void reload()} />;
    }
    return <CategoryScreen category={category} subcategories={subcategories} products={products} onChanged={() => void reload()} />;
}
