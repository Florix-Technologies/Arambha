"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus, ChevronRight } from 'lucide-react';
import { PageHeader, Card, Button, Thumbnail, Badge, EmptyState } from '../ui';
import { CATEGORIES, TERMS, MESSAGES, type CategoryKey } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { DeleteSubcategoryDialog, SubcategoryNameDialog } from './SubcategoryDialogs';
import s from './CategoryScreen.module.css';

// Main category page: its subcategories, with add, edit and delete. Products live one level down, in each subcategory.
export function CategoryScreen({ category, subcategories, products, onChanged }: {
    category: CategoryKey;
    subcategories: AdminSubcategory[];
    products: AdminProduct[];
    onChanged: () => void | Promise<void>;
}) {
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<AdminSubcategory | null>(null);
    const [deleting, setDeleting] = useState<AdminSubcategory | null>(null);
    const c = CATEGORIES[category];
    const base = `/admin/${category}`;
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: TERMS.dashboard, href: '/admin' }, { label: c.label }]} title={c.label}
            subtitle={`${MESSAGES.shownInMenu(c.menuTitle)} · ${MESSAGES.subcategoryCount(subcategories.length)} · ${MESSAGES.productCount(products.length)}`}
            secondaryActions={subcategories.length ? <Button variant="secondary" href={`/admin/products/new?category=${category}`}>{c.actionPrimary}</Button> : undefined}
            primaryAction={<Button data-tour="add-subcategory" onClick={() => setAdding(true)}>{TERMS.addSubcategory}</Button>} />
        <Card title={TERMS.subcategories}>
            {subcategories.length === 0 ? <EmptyState icon={<FolderPlus size={24} />} title={`No subcategories in ${c.label} yet`} text={MESSAGES.noSubcategories}
                action={<Button onClick={() => setAdding(true)}>{TERMS.addSubcategory}</Button>} /> :
                <ul className={s.list}>
                    {subcategories.map((sub, index) => {
                        const items = products.filter(p => p.subcategoryId === sub.id);
                        return <li className={s.row} key={sub.id}>
                            <Thumbnail src={items[0]?.image} alt={sub.name} />
                            <Link className={s.name} href={`${base}/${sub.id}`} data-tour={index === 0 ? 'subcategory-row' : undefined}>
                                <strong>{sub.name}</strong>
                                <span>{MESSAGES.productCount(items.length)}{!items.length && <Badge tone="warning">Hidden on website (empty)</Badge>}</span>
                                <ChevronRight className={s.chevron} size={20} aria-hidden="true" />
                            </Link>
                            <div className={s.actions}>
                                <Button variant="plain" onClick={() => setEditing(sub)} aria-label={`${TERMS.edit} ${sub.name}`}>{TERMS.edit}</Button>
                                <Button variant="plain" className={s.danger} data-tour={index === 0 ? 'subcategory-delete' : undefined} onClick={() => setDeleting(sub)} aria-label={`${TERMS.delete} ${sub.name}`}>{TERMS.delete}</Button>
                            </div>
                        </li>;
                    })}
                </ul>}
        </Card>
        <SubcategoryNameDialog open={adding} onOpenChange={setAdding} category={category} onSaved={async id => { await onChanged(); router.push(`${base}/${id}`); }} />
        <SubcategoryNameDialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }} category={category} subcategory={editing ?? undefined} onSaved={onChanged} />
        <DeleteSubcategoryDialog open={!!deleting} onOpenChange={open => { if (!open) setDeleting(null); }} subcategory={deleting} subcategories={subcategories} products={products} onDeleted={onChanged} />
    </div>;
}
