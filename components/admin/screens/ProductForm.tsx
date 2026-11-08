"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getProduct, listCategories, updateProduct, validateMediaUrl, validateName, validatePrice, type ProductInput } from '@/lib/admin/data';
import { CATEGORIES, CATEGORY_KEYS, categoryFromParam, MESSAGES, TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import type { AdminSubcategory } from '@/lib/admin/types';
import { normalizeCategoryName } from '@/lib/slug';
import { Button, Card, PageHeader, SaveBar, SelectField, TextArea, TextField, useToast } from '../ui';
import s from './ProductScreen.module.css';

type Fields = Omit<ProductInput, 'images'> & { images: string };
const empty: Fields = { name: '', description: '', category_id: '', image_url: '', images: '', price: '' };

export function ProductForm({ productId, initialCategory, initialSubcategory }: { productId?: string; initialCategory?: string; initialSubcategory?: string }) {
    const router = useRouter();
    const toast = useToast();
    const [fields, setFields] = useState<Fields>(empty);
    const [saved, setSaved] = useState<Fields>(empty);
    const [categories, setCategories] = useState<AdminSubcategory[]>([]);
    const [category, setCategory] = useState<CategoryKey>(categoryFromParam(initialCategory)?.key ?? 'furniture');
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
    const [busy, setBusy] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const pending = useRef(false);
    const form = useRef<HTMLFormElement>(null);
    const dirty = JSON.stringify(fields) !== JSON.stringify(saved);
    const dirtyRef = useRef(false);
    useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const results = await Promise.all(CATEGORY_KEYS.map(listCategories));
                const failed = results.find(result => result.error !== null);
                if (failed?.error) throw new Error(failed.error);
                const all = results.flatMap(result => result.data ?? []);
                let next = { ...empty, category_id: all.find(row => row.id === initialSubcategory)?.id ?? '' };
                let selected = categoryFromParam(initialCategory)?.key ?? 'furniture';
                if (productId) {
                    const result = await getProduct(productId);
                    if (result.error !== null) throw new Error(result.error);
                    const product = result.data;
                    const parent = all.find(row => row.id === product.category_id);
                    if (!parent) throw new Error('Product subcategory not found');
                    selected = parent.category;
                    next = { name: product.name, description: product.description ?? '', category_id: product.category_id, image_url: product.image_url ?? '', images: (product.images ?? []).join('\n'), price: product.price ?? '' };
                } else if (!all.some(row => row.id === next.category_id && row.category === selected)) next.category_id = '';
                if (cancelled) return;
                setCategories(all); setCategory(selected); setFields(next); setSaved(next); setReady(true);
            } catch (cause) {
                if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load product');
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [productId, initialCategory, initialSubcategory, attempt]);

    useEffect(() => {
        const confirmLeave = () => !dirtyRef.current || window.confirm('Discard unsaved changes?');
        const unload = (event: BeforeUnloadEvent) => {
            if (dirtyRef.current) { event.preventDefault(); event.returnValue = ''; }
        };
        const click = (event: MouseEvent) => {
            const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
            if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || link.hasAttribute('download') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || link.href === location.href) return;
            if (!confirmLeave()) { event.preventDefault(); event.stopPropagation(); }
        };
        // A sentinel history entry lets Back stay on the form when discard is cancelled.
        const original = location.href;
        if (history.state?.productFormGuard !== original) history.pushState({ ...history.state, productFormGuard: original }, '', original);
        let leaving = false;
        const pop = (event: PopStateEvent) => {
            event.stopImmediatePropagation();
            if (confirmLeave()) { dirtyRef.current = false; leaving = true; history.back(); }
            else history.pushState({ ...history.state, productFormGuard: original }, '', original);
        };
        // The second Back must reach Next's normal navigation handler.
        const guardedPop = (event: PopStateEvent) => {
            if (!leaving && location.href === original && history.state?.productFormGuard !== original) pop(event);
        };
        window.addEventListener('beforeunload', unload);
        document.addEventListener('click', click, true);
        window.addEventListener('popstate', guardedPop, true);
        return () => {
            window.removeEventListener('beforeunload', unload);
            document.removeEventListener('click', click, true);
            window.removeEventListener('popstate', guardedPop, true);
        };
    }, []);

    function change<K extends keyof Fields>(key: K, value: Fields[K]) {
        setFields(previous => ({ ...previous, [key]: value }));
        setErrors(previous => ({ ...previous, [key]: undefined }));
    }
    async function save() {
        if (pending.current) return;
        const images = fields.images.split('\n').map(url => url.trim()).filter(Boolean);
        const invalid: Partial<Record<keyof Fields, string>> = {};
        const nameError = validateName(fields.name);
        const priceError = validatePrice(fields.price);
        const mediaError = validateMediaUrl(fields.image_url.trim());
        if (nameError) invalid.name = nameError;
        if (priceError) invalid.price = priceError;
        if (mediaError) invalid.image_url = mediaError;
        if (images.some(url => validateMediaUrl(url))) invalid.images = 'Each line must contain an HTTP(S) URL or a local path';
        if (!categories.some(row => row.id === fields.category_id && row.category === category)) invalid.category_id = TERMS.chooseSubcategory;
        setErrors(invalid);
        if (Object.keys(invalid).length) {
            requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }
        pending.current = true; setBusy(true); setError('');
        try {
            const input: ProductInput = { ...fields, name: normalizeCategoryName(fields.name), image_url: fields.image_url.trim(), images };
            const result = productId ? await updateProduct(productId, input) : await createProduct(input);
            if (result.error !== null) { setError(result.error); return; }
            setSaved(fields); dirtyRef.current = false;
            toast({ title: productId ? MESSAGES.changesSaved : MESSAGES.productAdded });
            if (!productId) router.replace(`/admin-v2/products/${encodeURIComponent(result.data)}`);
        } catch {
            setError('Could not save product. Your changes are still here; please retry.');
        } finally { pending.current = false; setBusy(false); }
    }

    if (!ready) return <Card>{error ? <><p role="alert">{error}</p><Button onClick={() => { setError(''); setAttempt(value => value + 1); }}>Retry</Button></> : <p role="status">{TERMS.loading}...</p>}</Card>;
    const back = `/admin-v2/${category}`;
    return <form ref={form} className={s.page} noValidate onSubmit={event => { event.preventDefault(); void save(); }}>
        <PageHeader title={productId ? fields.name || TERMS.edit : TERMS.addProduct} breadcrumbs={[{ label: CATEGORIES[category].label, href: back }, { label: productId ? TERMS.edit : TERMS.addProduct }]} secondaryActions={<Button href={back} variant="secondary">Back to catalog</Button>} />
        <p>Saved products are Active and visible on your website.</p>
        {error && <p role="alert">{error}</p>}
        <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <div className={s.columns}>
                <div className={s.main}>
                    <Card title={TERMS.productDetails}><div className={s.fields}>
                        <TextField label={TERMS.productName} required value={fields.name} error={errors.name} onChange={event => change('name', event.target.value)} />
                        <TextArea label={TERMS.description} rows={5} value={fields.description} onChange={event => change('description', event.target.value)} />
                    </div></Card>
                    <Card title={TERMS.media}><div className={s.fields}>
                        <TextField label={TERMS.featuredImage} required hint="Use an HTTP(S) URL or a local path such as /chair.jpg." value={fields.image_url} error={errors.image_url} onChange={event => change('image_url', event.target.value)} />
                        <TextArea label="Additional media URLs" hint="One URL per line, in display order." rows={4} value={fields.images} error={errors.images} onChange={event => change('images', event.target.value)} />
                    </div></Card>
                    <Card title={TERMS.pricing}><TextField label={TERMS.price} hint={TERMS.priceHint} type="number" min="0" step="0.01" value={fields.price} error={errors.price} onChange={event => change('price', event.target.value)} /></Card>
                </div>
                <aside className={s.side}><Card title={TERMS.organization}><div className={s.fields}>
                    <SelectField label={TERMS.category} value={category} onChange={event => { const selected = categoryFromParam(event.target.value); if (selected) { setCategory(selected.key); change('category_id', ''); } }}>
                        {CATEGORY_KEYS.map(key => <option key={key} value={key}>{CATEGORIES[key].label}</option>)}
                    </SelectField>
                    <SelectField label={TERMS.subcategory} required value={fields.category_id} error={errors.category_id} onChange={event => change('category_id', event.target.value)}>
                        <option value="">{TERMS.chooseSubcategory}</option>
                        {categories.filter(row => row.category === category).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
                    </SelectField>
                    {!categories.some(row => row.category === category) && <p>Add a subcategory in the catalog before saving a product.</p>}

                </div></Card></aside>
            </div>
        </fieldset>
        {(dirty || !productId) && <SaveBar loading={busy} disabled={!dirty} onSave={() => void save()} onDiscard={() => {
            if (!dirty || window.confirm('Discard unsaved changes?')) { setFields(saved); setErrors({}); setError(''); const original = categories.find(row => row.id === saved.category_id); if (original) setCategory(original.category); }
        }} />}
    </form>;
}
