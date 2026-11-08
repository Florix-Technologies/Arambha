"use client";
import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Button, ConfirmDialog, EmptyState, Modal, SelectField, TextField, useToast } from '../ui';
import { deleteProduct, moveProducts } from '@/lib/admin/data';
import { MESSAGES, TERMS } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { ProductTable } from './ProductTable';
import s from './SubcategoryScreen.module.css';

// Products of one subcategory: search, sort, edit, move to another subcategory of the same main category, delete.
export function ProductList({ products, subcategory, subcategories, onChanged }: {
    products: AdminProduct[]; subcategory: AdminSubcategory; subcategories: AdminSubcategory[]; onChanged: () => void;
}) {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [deleting, setDeleting] = useState<AdminProduct | null>(null);
    const [moving, setMoving] = useState<AdminProduct | null>(null);
    const [target, setTarget] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const pending = useRef(false);
    const toast = useToast();
    const targets = subcategories.filter(x => x.id !== subcategory.id && x.category === subcategory.category);
    const query = search.trim().toLowerCase();
    const items = products.filter(p => p.name.toLowerCase().includes(query) || (p.description ?? '').toLowerCase().includes(query))
        .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'oldest' ? Date.parse(a.date) - Date.parse(b.date) : Date.parse(b.date) - Date.parse(a.date));
    async function run(work: () => Promise<{ error: string | null }>, done: string) {
        if (pending.current) return;
        pending.current = true; setBusy(true); setError('');
        try {
            const result = await work();
            if (result.error !== null) { setError(result.error); return; }
            setDeleting(null); setMoving(null);
            toast({ title: done });
            onChanged();
        } finally { pending.current = false; setBusy(false); }
    }
    const close = () => { if (!busy) { setDeleting(null); setMoving(null); setError(''); } };
    if (!products.length) return null;
    return <>
        <div className={s.toolbar} data-tour="product-search">
            <TextField type="search" label={TERMS.search} placeholder="Search by name or description" value={search} onChange={e => setSearch(e.target.value)} />
            <SelectField label="Sort" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option>
            </SelectField>
        </div>
        <p role="status" className={s.count}>{query ? `${items.length} of ${MESSAGES.productCount(products.length)}` : MESSAGES.productCount(products.length)}</p>
        {items.length ? <ProductTable products={items} onMove={targets.length ? p => { setError(''); setTarget(''); setMoving(p); } : undefined} onDelete={p => { setError(''); setDeleting(p); }} />
            : <EmptyState icon={<Search size={24} />} title="No matching products" text="Try a different word." action={<Button variant="secondary" onClick={() => setSearch('')}>Clear search</Button>} />}
        <ConfirmDialog open={!!deleting} onOpenChange={open => { if (!open) close(); }} title={TERMS.delete} body={deleting ? `${MESSAGES.deleteConfirm(deleting.name)}${error ? ` ${error}` : ''}` : ''}
            confirmLabel={TERMS.delete} destructive loading={busy} onConfirm={() => deleting && void run(() => deleteProduct(deleting.id), 'Product deleted')} />
        <Modal open={!!moving} onOpenChange={open => { if (!open) close(); }} title={moving ? `Move ${moving.name}` : TERMS.move}>
            <form className={s.dialog} onSubmit={e => { e.preventDefault(); if (moving && target) void run(() => moveProducts([moving.id], target), `Moved to ${targets.find(x => x.id === target)?.name}`); }}>
                <SelectField label="Move to subcategory" required value={target} onChange={e => setTarget(e.target.value)} disabled={busy}>
                    <option value="">{TERMS.chooseSubcategory}</option>
                    {targets.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </SelectField>
                {error && <p role="alert" className={s.error}>{error}</p>}
                <div className={s.dialogActions}><Button variant="secondary" onClick={close} disabled={busy}>{TERMS.cancel}</Button><Button type="submit" loading={busy} disabled={!target}>{TERMS.move}</Button></div>
            </form>
        </Modal>
    </>;
}
