"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getProduct, updateProduct, validateMediaUrl, validateName, validatePrice, type ProductInput } from '@/lib/admin/data';
import { CATEGORIES, CATEGORY_KEYS, categoryFromParam, MESSAGES, TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import { normalizeCategoryName } from '@/lib/slug';
import { Button, Card, PageHeader, SaveBar, SelectField, Skeleton, TextArea, TextField, useToast } from '../ui';
import { useActiveCategory } from '../AdminGate';
import { useCatalog } from '../useCatalog';
import { MediaField } from './MediaField';
import s from './ProductScreen.module.css';

type Fields = { name: string; description: string; category_id: string; price: string | number; media: string[] };
type FieldKey = keyof Fields;
const empty: Fields = { name: '', description: '', category_id: '', price: '', media: [] };

export function ProductForm({ productId, initialCategory, initialSubcategory }: { productId?: string; initialCategory?: string; initialSubcategory?: string }) {
    const router = useRouter();
    const toast = useToast();
    const [fields, setFields] = useState<Fields>(empty);
    const [saved, setSaved] = useState<Fields>(empty);
    // Subcategories come from the shared catalog (already loaded on most routes); only the product itself is fetched here.
    const catalog = useCatalog();
    const categories = catalog.subcategories;
    const catalogReady = !catalog.loading && !catalog.error;
    const subcategoriesRef = useRef(categories);
    subcategoriesRef.current = categories;
    const [category, setCategory] = useState<CategoryKey>(categoryFromParam(initialCategory)?.key ?? 'furniture');
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const pending = useRef(false);
    const form = useRef<HTMLFormElement>(null);
    const dirty = JSON.stringify(fields) !== JSON.stringify(saved);
    const dirtyRef = useRef(false);
    useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
    useActiveCategory(ready ? category : null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!catalogReady) return;
            try {
                const all = subcategoriesRef.current;
                const preset = all.find(row => row.id === initialSubcategory);
                let selected = preset?.category ?? categoryFromParam(initialCategory)?.key ?? 'furniture';
                let next: Fields = { ...empty, category_id: preset?.id ?? '' };
                if (productId) {
                    const result = await getProduct(productId);
                    if (result.error !== null) throw new Error(result.error);
                    const product = result.data;
                    const parent = all.find(row => row.id === product.category_id);
                    if (!parent) throw new Error('This product\'s subcategory no longer exists.');
                    selected = parent.category;
                    next = { name: product.name, description: product.description ?? '', category_id: product.category_id, price: product.price ?? '',
                        media: [product.image_url ?? '', ...(product.images ?? [])].filter(Boolean) };
                } else if (!next.category_id) {
                    // Only one subcategory: nothing to choose.
                    const only = all.filter(row => row.category === selected);
                    if (only.length === 1) next.category_id = only[0].id;
                }
                if (cancelled) return;
                setCategory(selected); setFields(next); setSaved(next); setReady(true);
            } catch (cause) {
                if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load product');
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [productId, initialCategory, initialSubcategory, attempt, catalogReady]);

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

    function change<K extends FieldKey>(key: K, value: Fields[K]) {
        setFields(previous => ({ ...previous, [key]: value }));
        setErrors(previous => ({ ...previous, [key]: undefined }));
    }
    const subcategoryName = (id: string) => categories.find(row => row.id === id)?.name ?? '';
    async function save() {
        if (pending.current) return;
        if (uploading) { setError('Wait for the uploads to finish, then save.'); return; }
        const invalid: Partial<Record<FieldKey, string>> = {};
        const nameError = validateName(fields.name);
        const priceError = CATEGORIES[category].hasPrice ? validatePrice(fields.price) : null;
        if (nameError) invalid.name = nameError;
        if (priceError) invalid.price = priceError;
        if (!fields.media.length) invalid.media = 'Add at least one photo or video. The first one is the cover.';
        else if (fields.media.some(url => validateMediaUrl(url))) invalid.media = 'One of the links is not valid. Remove it and add it again.';
        if (!categories.some(row => row.id === fields.category_id && row.category === category)) invalid.category_id = TERMS.chooseSubcategory;
        setErrors(invalid);
        if (Object.keys(invalid).length) {
            setError('Fix the highlighted fields, then save.');
            requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid] input')?.focus());
            return;
        }
        pending.current = true; setBusy(true); setError('');
        try {
            const input: ProductInput = { category_id: fields.category_id, name: normalizeCategoryName(fields.name), description: fields.description,
                price: CATEGORIES[category].hasPrice ? fields.price : '', image_url: fields.media[0], images: fields.media.slice(1) };
            const result = productId ? await updateProduct(productId, input) : await createProduct(input);
            if (result.error !== null) { setError(result.error); return; }
            setSaved(fields); dirtyRef.current = false;
            toast({ title: productId ? MESSAGES.changesSaved : MESSAGES.productAdded, description: `${input.name} is in ${subcategoryName(fields.category_id)}.` });
            await catalog.reload();
            if (!productId) router.replace(`/admin/${category}/${encodeURIComponent(fields.category_id)}`);
        } catch {
            setError('Could not save product. Your changes are still here; please retry.');
        } finally { pending.current = false; setBusy(false); }
    }

    if (!ready) return <Card>{error || catalog.error ? <><p role="alert">{error || catalog.error}</p><Button onClick={() => { setError(''); if (catalog.error) catalog.retry(); setAttempt(value => value + 1); }}>Try again</Button></> : <Skeleton lines={6} />}</Card>;
    const c = CATEGORIES[category];
    const sub = categories.find(row => row.id === fields.category_id && row.category === category);
    const back = sub ? `/admin/${category}/${encodeURIComponent(sub.id)}` : `/admin/${category}`;
    const title = productId ? saved.name || TERMS.edit : category === 'gallery' ? 'Add to gallery' : TERMS.addProduct;
    return <form ref={form} className={s.page} noValidate onSubmit={event => { event.preventDefault(); void save(); }}>
        <PageHeader title={title} breadcrumbs={[{ label: TERMS.dashboard, href: '/admin' }, { label: c.label, href: `/admin/${category}` }, ...(sub ? [{ label: sub.name, href: back }] : []), { label: productId ? TERMS.edit : TERMS.addProduct }]}
            subtitle={sub ? `Saving to ${c.label} › ${sub.name}. It appears on the website as soon as you save.` : 'Choose where it goes, add photos, then save. It appears on the website as soon as you save.'}
            secondaryActions={<Button href={back} variant="secondary">{TERMS.cancel}</Button>} />
        {error && <p role="alert" className={s.error}>{error}</p>}
        <fieldset disabled={busy} className={s.fieldset}>
            <div className={s.columns}>
                <div className={s.main}>
                    <Card title="Photos and videos"><div data-invalid={errors.media ? true : undefined} data-tour="product-photos">
                        <MediaField value={fields.media} disabled={busy} error={errors.media} onBusyChange={setUploading}
                            onChange={update => { setFields(previous => ({ ...previous, media: update(previous.media) })); setErrors(previous => ({ ...previous, media: undefined })); }} />
                        {category === 'gallery' && <p className={s.hint}>The Our Work page shows the cover only.</p>}
                    </div></Card>
                    <Card title={TERMS.productDetails}><div className={s.fields}>
                        <TextField label={TERMS.productName} required value={fields.name} error={errors.name} onChange={event => change('name', event.target.value)} />
                        <TextArea label={TERMS.description} hint="Optional. Shown with the product on the website." rows={5} value={fields.description} onChange={event => change('description', event.target.value)} />
                        {c.hasPrice && <TextField label={TERMS.price} hint={TERMS.priceHint} type="number" inputMode="decimal" min="0" step="0.01" value={fields.price} error={errors.price} onChange={event => change('price', event.target.value)} />}
                    </div></Card>
                </div>
                <aside className={s.side}><Card title="Where it appears"><div className={s.fields}>
                    <SelectField label="Main category" value={category} onChange={event => { const selected = categoryFromParam(event.target.value); if (selected) { setCategory(selected.key); change('category_id', ''); } }}>
                        {CATEGORY_KEYS.map(key => <option key={key} value={key}>{CATEGORIES[key].label}</option>)}
                    </SelectField>
                    <SelectField label={TERMS.subcategory} required value={fields.category_id} error={errors.category_id} onChange={event => change('category_id', event.target.value)}>
                        <option value="">{TERMS.chooseSubcategory}</option>
                        {categories.filter(row => row.category === category).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
                    </SelectField>
                    {!categories.some(row => row.category === category) && <p className={s.hint}>{c.label} has no subcategories yet. <a href={`/admin/${category}`}>Add one first</a>.</p>}
                    {sub && <p className={s.destination}>{c.label} › {sub.name}</p>}
                </div></Card></aside>
            </div>
        </fieldset>
        {(dirty || !productId) && <SaveBar loading={busy} disabled={!dirty || uploading} onSave={() => void save()} onDiscard={() => {
            if (!dirty || window.confirm('Discard unsaved changes?')) { setFields(saved); setErrors({}); setError(''); const original = categories.find(row => row.id === saved.category_id); if (original) setCategory(original.category); }
        }} />}
    </form>;
}
