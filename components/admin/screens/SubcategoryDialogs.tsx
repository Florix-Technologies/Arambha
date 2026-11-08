"use client";
import { useState } from 'react';
import { createCategory, deleteCategory, DELETE_OFF, moveProducts, renameCategory, SUBCATEGORY_DELETE_ENABLED } from '@/lib/admin/data';
import { CATEGORIES, MESSAGES, TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { Button, Modal, SelectField, TextField, useToast } from '../ui';
import s from './SubcategoryDialogs.module.css';

// Add (no `subcategory`) or rename (with `subcategory`) a subcategory inside one main category.
export function SubcategoryNameDialog({ open, onOpenChange, category, subcategory, onSaved }: {
    open: boolean; onOpenChange: (open: boolean) => void; category: CategoryKey; subcategory?: AdminSubcategory; onSaved: (id: string) => void;
}) {
    return <Modal open={open} onOpenChange={onOpenChange} title={subcategory ? TERMS.editSubcategory : `${TERMS.addSubcategory} to ${CATEGORIES[category].label}`}>
        {open && <NameForm category={category} subcategory={subcategory} onCancel={() => onOpenChange(false)} onSaved={id => { onOpenChange(false); onSaved(id); }} />}
    </Modal>;
}
function NameForm({ category, subcategory, onCancel, onSaved }: { category: CategoryKey; subcategory?: AdminSubcategory; onCancel: () => void; onSaved: (id: string) => void }) {
    const [name, setName] = useState(subcategory?.name ?? '');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const toast = useToast();
    async function save() {
        if (busy) return;
        if (subcategory && name.trim() === subcategory.name) { onCancel(); return; }
        setBusy(true); setError('');
        const result = subcategory ? await renameCategory(subcategory, name) : await createCategory(category, name);
        setBusy(false);
        if (result.error !== null) { setError(result.error); return; }
        toast({ title: subcategory ? 'Subcategory renamed' : MESSAGES.subcategoryAdded });
        onSaved(result.data);
    }
    return <form className={s.form} noValidate onSubmit={e => { e.preventDefault(); void save(); }}>
        <TextField label="Subcategory name" hint={`For example "Kitchen". ${MESSAGES.subcategoryHint}`} required autoFocus value={name} error={error || undefined} disabled={busy} onChange={e => { setName(e.target.value); setError(''); }} />
        <div className={s.actions}>
            <Button variant="secondary" onClick={onCancel} disabled={busy}>{TERMS.cancel}</Button>
            <Button type="submit" loading={busy}>{subcategory ? TERMS.save : TERMS.addSubcategory}</Button>
        </div>
    </form>;
}

// Deleting a subcategory would delete its products in the database, so its products must be moved out first.
export function DeleteSubcategoryDialog({ open, onOpenChange, subcategory, subcategories, products, onDeleted }: {
    open: boolean; onOpenChange: (open: boolean) => void; subcategory: AdminSubcategory | null;
    subcategories: AdminSubcategory[]; products: AdminProduct[]; onDeleted: () => void;
}) {
    return <Modal open={open && !!subcategory} onOpenChange={onOpenChange} title={subcategory ? `Delete ${subcategory.name}?` : TERMS.deleteSubcategory}>
        {open && subcategory && <DeleteForm subcategory={subcategory} subcategories={subcategories} products={products.filter(p => p.subcategoryId === subcategory.id)} onCancel={() => onOpenChange(false)} onDeleted={() => { onOpenChange(false); onDeleted(); }} />}
    </Modal>;
}
function DeleteForm({ subcategory, subcategories, products, onCancel, onDeleted }: { subcategory: AdminSubcategory; subcategories: AdminSubcategory[]; products: AdminProduct[]; onCancel: () => void; onDeleted: () => void }) {
    const targets = subcategories.filter(x => x.id !== subcategory.id && x.category === subcategory.category);
    const [target, setTarget] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const toast = useToast();
    const count = products.length;
    if (!SUBCATEGORY_DELETE_ENABLED) return <div className={s.form}>
        <p>{DELETE_OFF}</p>
        <div className={s.actions}><Button variant="secondary" onClick={onCancel}>{TERMS.close}</Button></div>
    </div>;
    async function remove() {
        if (busy || (count > 0 && !target)) return;
        setBusy(true); setError('');
        if (count > 0) {
            const moved = await moveProducts(products.map(p => p.id), target);
            if (moved.error !== null) { setBusy(false); setError(moved.error); return; }
        }
        const deleted = await deleteCategory(subcategory.id);
        setBusy(false);
        if (deleted.error !== null) { setError(deleted.error); return; }
        toast({ title: MESSAGES.subcategoryDeleted, description: count ? `${MESSAGES.productCount(count)} moved to ${targets.find(x => x.id === target)?.name}.` : undefined });
        onDeleted();
    }
    return <form className={s.form} onSubmit={e => { e.preventDefault(); void remove(); }}>
        {count === 0 ? <p>It has no products. It will be removed from the website menu.</p> : <>
            <p>{subcategory.name} has {MESSAGES.productCount(count)}. Products are never deleted with a subcategory: choose where to move {count === 1 ? 'it' : 'them'} first.</p>
            {targets.length ? <SelectField label="Move products to" required value={target} onChange={e => setTarget(e.target.value)} disabled={busy}>
                <option value="">{TERMS.chooseSubcategory}</option>
                {targets.map(x => <option value={x.id} key={x.id}>{x.name}</option>)}
            </SelectField> : <p role="alert">There is no other subcategory to move them to. Add one first, or delete the products one by one.</p>}
        </>}
        {error && <p role="alert" className={s.error}>{error}</p>}
        <div className={s.actions}>
            <Button variant="secondary" onClick={onCancel} disabled={busy}>{TERMS.cancel}</Button>
            <Button type="submit" variant="destructive" loading={busy} disabled={count > 0 && !target}>{count ? `Move ${count} and delete` : TERMS.delete}</Button>
        </div>
    </form>;
}
