import { supabase } from '@/lib/supabase';

export type Collection = 'interiors' | 'furniture' | 'gallery';
export type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  price: number | null;
  created_at: string;
};
export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  collection: string;
  created_at: string;
  products: Product[];
};
export type Catalog = CatalogCategory[];
export type NavCategory = Pick<CatalogCategory, 'name' | 'slug'>;
export type NavCategories = Record<string, NavCategory[]>;

export async function fetchCatalog(collection: Collection): Promise<Catalog> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, collection, created_at, products(id, name, description, image_url, images, price, created_at)')
    .eq('collection', collection)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const merged = new Map<string, CatalogCategory>();
  for (const category of (data ?? []) as Catalog) {
    const existing = merged.get(category.slug);
    if (existing) existing.products.push(...(category.products ?? []));
    else merged.set(category.slug, { ...category, products: [...(category.products ?? [])] });
  }
  return [...merged.values()].filter(category => category.products.length > 0).map(category => ({
    ...category,
    products: category.products.sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));
}

export function filterCatalog(catalog: Catalog, slug?: string | null): Catalog {
  return !slug || slug === 'all' ? catalog : catalog.filter(category => category.slug === slug);
}

export async function fetchNavCategories(): Promise<NavCategories> {
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug, collection, created_at, products(count)')
    .order('created_at', { ascending: true });
  if (error) throw error;

  const collections = new Map<string, Map<string, NavCategory & { count: number }>>();
  for (const category of data ?? []) {
    let categories = collections.get(category.collection);
    if (!categories) {
      categories = new Map();
      collections.set(category.collection, categories);
    }
    const count = category.products.reduce((sum, product) => sum + product.count, 0);
    const existing = categories.get(category.slug);
    if (existing) existing.count += count;
    else categories.set(category.slug, { name: category.name, slug: category.slug, count });
  }
  return Object.fromEntries([...collections].map(([collection, categories]) => [
    collection,
    [...categories.values()].filter(category => category.count > 0).map(({ name, slug }) => ({ name, slug })),
  ]));
}
