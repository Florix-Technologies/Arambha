import { supabase } from '../supabase';
import { CATEGORY_KEYS } from './taxonomy';
import { mapProduct, mapSubcategory, type CategoryRow, type DataResult, type ProductRow } from './data';
import type { AdminProduct, AdminSubcategory } from './types';

// The whole catalog in two queries (all subcategories, then all products, newest first) and only the columns the
// admin shows. Replaces one products query per subcategory.
export async function loadCatalog(): Promise<DataResult<{ subcategories: AdminSubcategory[]; products: AdminProduct[] }>> {
    try {
        const { data: rows, error } = await supabase.from('categories').select('id, name, slug, collection').in('collection', [...CATEGORY_KEYS]);
        if (error) throw error;
        const subcategories = (rows as CategoryRow[] ?? []).map(mapSubcategory).sort((a, b) => a.name.localeCompare(b.name));
        const byId = new Map(subcategories.map(sub => [sub.id, sub]));
        const products: AdminProduct[] = [];
        // Supabase caps a response at 1000 rows, so read every page in a stable newest-first order.
        for (let from = 0; ; from += 1000) {
            const { data, error: failed } = await supabase.from('products').select('id, category_id, name, description, image_url, images, price, created_at')
                .order('created_at', { ascending: false }).order('id', { ascending: false }).range(from, from + 999);
            if (failed) throw failed;
            for (const row of data as ProductRow[] ?? []) { const sub = byId.get(row.category_id); if (sub) products.push(mapProduct(row, sub)); }
            if ((data?.length ?? 0) < 1000) break;
        }
        products.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
        return { data: { subcategories, products }, error: null };
    } catch {
        return { data: null, error: 'Could not load the catalog. Check your connection and try again.' };
    }
}
