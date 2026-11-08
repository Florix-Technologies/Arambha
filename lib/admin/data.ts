import { supabase } from '../supabase';
import { requestRevalidate } from '../revalidate';
import type { Product } from '../catalog';
import { findCategoryConflict, normalizeCategoryName, slugify } from '../slug';
import { CATEGORIES, categoryFromParam, TERMS, type CategoryKey } from './taxonomy';
import type { AdminProduct, AdminSubcategory } from './types';

export type DataResult<T> = { data: T; error: null } | { data: null; error: string };
export type CategoryRow = { id: string; name: string; slug: string; collection: CategoryKey };
export type ProductRow = Product & { category_id: string };
export type ProductInput = {
    category_id: string; name: string; description: string; image_url: string;
    images: string[]; price: string | number;
};
const NOT_ALLOWED = 'This account is not allowed to make changes. Log in with the admin account.';

export function validateName(value: unknown, label: string = TERMS.productName): string | null {
    return typeof value === 'string' && value.trim() ? null : `${label} is required`;
}
export function validatePrice(value: unknown): string | null {
    return (typeof value === 'string' && value.trim() === '') ||
        ((typeof value === 'string' || typeof value === 'number') && Number.isFinite(Number(value)) && Number(value) >= 0)
        ? null : 'Price must be a number greater than or equal to 0, or empty';
}
export function validateMediaUrl(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim() || /[\s\\]/.test(value)) return 'Enter an HTTP(S) URL or a local path';
    if (value.startsWith('/') && !value.startsWith('//')) return null;
    try { if (['http:', 'https:'].includes(new URL(value).protocol)) return null; } catch { /* Invalid URL. */ }
    return 'Enter an HTTP(S) URL or a local path';
}
export function getProduct(id: string): Promise<DataResult<ProductRow>> {
    return result(async () => {
        requireId(id);
        const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Product not found');
        return data as ProductRow;
    });
}
async function requireSession() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error(NOT_ALLOWED);
    // Database RLS must enforce admin authorization for every write.
}
function message(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        if ('code' in error && error.code === '42501') return NOT_ALLOWED;
        if ('code' in error && error.code === '23503') return 'This subcategory still has products. Move them first.';
        if ('message' in error && typeof error.message === 'string') {
            return 'code' in error ? `${error.message} (Code: ${error.code})` : error.message;
        }
    }
    return 'Could not complete the request. Please try again.';
}
async function result<T>(work: () => Promise<T>): Promise<DataResult<T>> {
    try { return { data: await work(), error: null }; }
    catch (error) { return { data: null, error: message(error) }; }
}
function requireId(id: string) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('An ID is required');
}
function requireCategory(category: CategoryKey) {
    if (!categoryFromParam(category)) throw new Error('Choose a valid category');
}
export function mapSubcategory(row: CategoryRow): AdminSubcategory {
    requireCategory(row.collection);
    return { id: row.id, name: row.name, category: row.collection };
}
export function mapProduct(row: ProductRow, subcategory: AdminSubcategory): AdminProduct {
    return {
        id: row.id, name: row.name, category: subcategory.category, subcategory: subcategory.name, subcategoryId: subcategory.id, images: row.images ?? [],
        image: row.image_url ?? '', price: row.price ?? undefined,
        // All saved products are public; the schema has no draft status.
        status: 'active', date: row.created_at, description: row.description ?? undefined,
    };
}
export function listCategories(category: CategoryKey): Promise<DataResult<AdminSubcategory[]>> {
    return result(async () => {
        requireCategory(category);
        const { data, error } = await supabase.from('categories').select('*').eq('collection', category);
        if (error) throw error;
        return (data as CategoryRow[] ?? []).map(mapSubcategory);
    });
}
// Omitting subcategoryId lists the collection using the same per-category query as the legacy admin.
export function listProducts(category: CategoryKey, subcategoryId?: string, knownCategories?: AdminSubcategory[]): Promise<DataResult<AdminProduct[]>> {
    return result(async () => {
        if (subcategoryId !== undefined) requireId(subcategoryId);
        requireCategory(category);
        const categories = knownCategories === undefined ? await listCategories(category) : { data: knownCategories.filter(row => row.category === category), error: null };
        if (categories.error !== null) throw new Error(categories.error);
        const selected = categories.data.filter(row => subcategoryId === undefined || row.id === subcategoryId);
        if (subcategoryId && !selected.length) throw new Error('Subcategory not found in this category');
        const products = await Promise.all(selected.map(async subcategory => {
            // Supabase caps a response at 1000 rows, so read every page in a stable newest-first order (from task #52).
            const rows: ProductRow[] = [];
            while (true) {
                const { data, error } = await supabase.from('products').select('*').eq('category_id', subcategory.id)
                    .order('created_at', { ascending: false }).order('id', { ascending: false })
                    .range(rows.length, rows.length + 999);
                if (error) throw error;
                if (!data?.length) break;
                rows.push(...data as ProductRow[]);
                if (data.length < 1000) break;
            }
            return rows.map(row => mapProduct(row, subcategory));
        }));
        return products.flat();
    });
}
function productValues(input: ProductInput) {
    const error = validateName(input.name) || validatePrice(input.price) || validateMediaUrl(input.image_url);
    if (error) throw new Error(error);
    requireId(input.category_id);
    if (typeof input.description !== 'string' || typeof input.image_url !== 'string' || !input.image_url.trim() ||
        !Array.isArray(input.images) || input.images.some(url => validateMediaUrl(url) !== null)) {
        throw new Error('Provide valid product details and a featured image');
    }
    return { category_id: input.category_id, image_url: input.image_url, images: input.images, name: input.name.trim(), description: input.description.trim(),
        price: typeof input.price === 'string' && !input.price.trim() ? null : Number(input.price) };
}
// After a saved change, refresh the cached public pages and sitemap now instead of within the hour. Best-effort.
function refreshSite() {
    Promise.resolve().then(() => supabase.auth.getSession())
        .then(({ data }) => data.session && requestRevalidate(['/', '/interiors', '/furniture', '/gallery'], data.session.access_token))
        .catch(() => undefined);
}
async function changed(query: PromiseLike<{ data: { id: string }[] | null; error: unknown }>): Promise<string> {
    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) throw new Error(NOT_ALLOWED);
    refreshSite();
    return data[0].id;
}
export function createProduct(input: ProductInput): Promise<DataResult<string>> {
    return result(async () => { await requireSession(); return changed(supabase.from('products').insert([productValues(input)]).select('id')); });
}
export function updateProduct(id: string, input: ProductInput): Promise<DataResult<string>> {
    return result(async () => {
        requireId(id);
        await requireSession();
        return changed(supabase.from('products').update(productValues(input)).eq('id', id).select('id'));
    });
}
export function deleteProduct(id: string): Promise<DataResult<string>> {
    return result(async () => {
        requireId(id);
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) throw new Error(NOT_ALLOWED);
        // Database RLS must restrict writes to the admin account; this check also rejects expired sessions.
        return changed(supabase.from('products').delete().eq('id', id).select('id'));
    });
}
// Shared by add and rename: normalised name, slug and a duplicate check within the main category.
async function checkedName(category: CategoryKey, value: string, exceptId?: string) {
    requireCategory(category);
    const invalid = validateName(value, TERMS.subcategory);
    if (invalid) throw new Error(invalid);
    const name = normalizeCategoryName(value), slug = slugify(name);
    if (!slug) throw new Error('Use at least one letter or number in the name.');
    const { data, error } = await supabase.from('categories').select('id, name, slug').eq('collection', category);
    if (error) throw error;
    const conflict = findCategoryConflict((data ?? []) as Pick<CategoryRow, 'id' | 'name' | 'slug'>[], name, slug, exceptId);
    if (conflict) throw new Error(`A subcategory called "${conflict.name}" already exists in ${CATEGORIES[category].label}.`);
    return { name, slug };
}
export function createCategory(category: CategoryKey, value: string): Promise<DataResult<string>> {
    return result(async () => {
        await requireSession();
        const values = await checkedName(category, value);
        return changed(supabase.from('categories').insert([{ ...values, collection: category }]).select('id'));
    });
}
export function renameCategory(category: AdminSubcategory, value: string): Promise<DataResult<string>> {
    return result(async () => {
        requireId(category.id);
        await requireSession();
        const { name } = await checkedName(category.category, value, category.id);
        // The slug (web address) stays the same, so links to the subcategory and its products keep working.
        return changed(supabase.from('categories').update({ name }).eq('id', category.id).select('id'));
    });
}
// Moves products to another subcategory; fails if any product was not moved.
export function moveProducts(ids: string[], categoryId: string): Promise<DataResult<number>> {
    return result(async () => {
        requireId(categoryId);
        if (!ids.length) return 0;
        ids.forEach(requireId);
        await requireSession();
        const { data, error } = await supabase.from('products').update({ category_id: categoryId }).in('id', ids).select('id');
        if (error) throw error;
        if ((data?.length ?? 0) !== ids.length) throw new Error(data?.length ? 'Some products could not be moved. Reload and try again.' : NOT_ALLOWED);
        refreshSite();
        return ids.length;
    });
}
export function countCategoryProducts(id: string): Promise<DataResult<number>> {
    return result(async () => {
        requireId(id);
        const { count, error } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
        if (error) throw error;
        return count ?? 0;
    });
}
// Products are never deleted with a subcategory: `moveTo` first moves everything still in it (including products added
// after the list was loaded), then an empty check, then the delete. docs/admin-v2-restrict-category-delete.sql makes the
// database itself refuse a delete that would remove products (error 23503), which closes the check-then-delete race.
export function deleteCategory(id: string, moveTo?: string): Promise<DataResult<string>> {
    return result(async () => {
        requireId(id);
        if (moveTo !== undefined) requireId(moveTo);
        if (moveTo === id) throw new Error('Choose a different subcategory to move the products to.');
        await requireSession();
        if (moveTo) {
            const { error } = await supabase.from('products').update({ category_id: moveTo }).eq('category_id', id);
            if (error) throw error;
        }
        const count = await countCategoryProducts(id);
        if (count.error !== null) throw new Error(count.error);
        if (count.data > 0) throw new Error(`This subcategory still has ${count.data === 1 ? '1 product' : `${count.data} products`}. Move them first.`);
        return changed(supabase.from('categories').delete().eq('id', id).select('id'));
    });
}
