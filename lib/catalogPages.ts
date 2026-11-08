import { cache } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchCatalog, type CatalogCategory, type Collection, type Product } from '@/lib/catalog';

export type SubcategoryPage = { category: CatalogCategory; seo: { seo_title?: string | null; seo_description?: string | null } };
export type ProductPage = { product: Product & { seo_title?: string | null; seo_description?: string | null }; category: { name: string; slug: string; collection: string } };

/** One subcategory with its products; null when it does not exist or is empty. Optional seo_* columns are read with select('*'). */
export const fetchSubcategory = cache(async (collection: Collection, slug: string): Promise<SubcategoryPage | null> => {
  const category = (await fetchCatalog(collection)).find(c => c.slug === slug);
  if (!category) return null;
  const { data } = await supabase.from('categories').select('*').eq('collection', collection).eq('slug', slug).limit(1);
  return { category, seo: { seo_title: data?.[0]?.seo_title, seo_description: data?.[0]?.seo_description } };
});

/** Finds a product by the first 8 hex characters of its id (the tail of its public URL) with a uuid range filter. */
export const fetchProductByPrefix = cache(async (prefix: string): Promise<ProductPage | null> => {
  if (!/^[0-9a-f]{8}$/.test(prefix)) return null;
  const { data, error } = await supabase.from('products').select('*')
    .gte('id', `${prefix}-0000-0000-0000-000000000000`).lte('id', `${prefix}-ffff-ffff-ffff-ffffffffffff`).limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  const { data: category, error: categoryError } = await supabase.from('categories').select('name, slug, collection').eq('id', row.category_id).maybeSingle();
  if (categoryError) throw categoryError;
  return category ? { product: row as ProductPage['product'], category } : null;
});

/** Everything the sitemap needs, with explicit columns only. */
export async function fetchSitemapCatalog(): Promise<Array<CatalogCategory>> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, collection, created_at, products(id, name, description, image_url, images, price, created_at)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CatalogCategory[];
}
