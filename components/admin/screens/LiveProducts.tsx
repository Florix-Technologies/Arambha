"use client";
import { useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { Badge, Button, Card, ConfirmDialog, EmptyState, SelectField, TextField, Thumbnail, ViewToggle, useToast } from '../ui';
import { deleteProduct } from '@/lib/admin/data';
import { CATEGORIES, MESSAGES, TERMS } from '@/lib/admin/taxonomy';
import type { AdminProduct } from '@/lib/admin/types';
import { ProductTable } from './ProductTable';
import s from './CategoryScreen.module.css';

export function LiveProducts({ products, onDeleted }: { products: AdminProduct[]; onDeleted: (id: string) => void }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [sort, setSort] = useState('newest');
    const [view, setView] = useState<'table' | 'grid'>('table');
    const [target, setTarget] = useState<AdminProduct | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const pending = useRef(false);
    const toast = useToast();
    const items = products.filter(p => `${p.name} ${p.subcategory}`.toLowerCase().includes(search.trim().toLowerCase()) && (!status || p.status === status) && (!subcategory || p.subcategory === subcategory)).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'oldest' ? Date.parse(a.date) - Date.parse(b.date) : Date.parse(b.date) - Date.parse(a.date));
    async function remove() {
        if (!target || pending.current) return;
        pending.current = true;
        setBusy(true);
        setError('');
        try {
            const result = await deleteProduct(target.id);
            if (result.error !== null) { setError(result.error); toast({ title: 'Could not delete product', description: result.error }); return; }
            onDeleted(target.id);
            setTarget(null);
            toast({ title: 'Product deleted' });
        } finally { pending.current = false; setBusy(false); }
    }
    const actions = (p: AdminProduct) => <><Button variant="plain" href={`/admin-v2/products/${encodeURIComponent(p.id)}`}>{TERMS.edit}</Button><Button variant="plain" onClick={() => { setError(''); setTarget(p); }} aria-label={`${TERMS.delete} ${p.name}`}>{TERMS.delete}</Button></>;
    return <>
        <div className={s.filters}>
            <TextField type="search" label={TERMS.search} value={search} onChange={e => setSearch(e.target.value)} />
            <SelectField label={TERMS.subcategory} value={subcategory} onChange={e => setSubcategory(e.target.value)}><option value="">{TERMS.allSubcategories}</option>{Array.from(new Set(products.map(p => p.subcategory))).sort().map(name => <option key={name} value={name}>{name}</option>)}</SelectField>
            <SelectField label={TERMS.status} value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option><option value="active">{TERMS.active}</option><option value="draft">{TERMS.draft}</option></SelectField>
            <SelectField label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></SelectField>
        </div>
        <p>Saved products are Active. Draft status is not supported by the catalog.</p>
        <p role="status">{MESSAGES.productCount(items.length)}</p>
        {items.length ? <ViewToggle value={view} onValueChange={setView} table={<ProductTable products={items} basePath="/admin-v2" onDelete={p => { setError(''); setTarget(p); }} />} grid={<div className={s.grid}>{items.map(p => <Card key={p.id}><Thumbnail src={p.image} alt={p.name} /><h2>{p.name}</h2><p>{p.subcategory}</p>{CATEGORIES[p.category].hasPrice && p.price != null && <p>{TERMS.currency} {p.price.toLocaleString('en-IN')}</p>}<Badge tone="success">{TERMS[p.status]}</Badge>{actions(p)}</Card>)}</div>} /> : <EmptyState icon={<Package />} title={products.length ? 'No matching products' : 'No products yet'} text={products.length ? 'Try another search or status filter.' : MESSAGES.noProducts} />}
        {error && <p role="alert">{error}</p>}
        <ConfirmDialog open={!!target} onOpenChange={open => { if (!busy && !open) setTarget(null); }} title={TERMS.delete} body={target ? MESSAGES.deleteConfirm(target.name) : ''} confirmLabel={TERMS.delete} destructive loading={busy} onConfirm={() => void remove()} />
    </>;
}
