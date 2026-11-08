'use client';

import { useEffect, useState } from 'react';
import { DashboardScreen } from '@/components/admin/screens/DashboardScreen';
import { listCategories, listProducts } from '@/lib/admin/data';
import { CATEGORY_KEYS } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';

export default function Page() {
    const [state, setState] = useState<{
        products: AdminProduct[]; subcategories: AdminSubcategory[]; loading: boolean; error?: string;
    }>({ products: [], subcategories: [], loading: true });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let disposed = false;
        async function load() {
            try {
                const collections = await Promise.all(CATEGORY_KEYS.map(async category => {
                    const subcategories = await listCategories(category);
                    const products = subcategories.error === null ? await listProducts(category, undefined, subcategories.data) : { data: null, error: subcategories.error };
                    if (subcategories.error !== null || products.error !== null) throw new Error('Dashboard request failed');
                    return { subcategories: subcategories.data, products: products.data };
                }));
                if (!disposed) setState({
                    products: collections.flatMap(collection => collection.products).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
                    subcategories: collections.flatMap(collection => collection.subcategories),
                    loading: false,
                });
            } catch {
                if (!disposed) setState({ products: [], subcategories: [], loading: false, error: 'Could not load the dashboard. Please try again.' });
            }
        }
        void load();
        return () => { disposed = true; };
    }, [attempt]);

    return <DashboardScreen {...state} recent={state.products.slice(0, 6)} basePath="/admin-v2" onRetry={() => {
        setState({ products: [], subcategories: [], loading: true });
        setAttempt(value => value + 1);
    }} />;
}
