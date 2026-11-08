"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { PageHeader, Button, Card, EmptyState } from '../ui';
import { CATEGORIES, TERMS, MESSAGES } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { ProductList } from './ProductList';
import { GalleryUploader } from './GalleryUploader';
import { DeleteSubcategoryDialog, SubcategoryNameDialog } from './SubcategoryDialogs';
import s from './SubcategoryScreen.module.css';

// One subcategory (e.g. Interiors › Kitchen): only its own products, and actions that already know where new products go.
export function SubcategoryScreen({ subcategory, subcategories, products, onChanged }: {
    subcategory: AdminSubcategory; subcategories: AdminSubcategory[]; products: AdminProduct[]; onChanged: () => void;
}) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const c = CATEGORIES[subcategory.category];
    const parent = `/admin/${subcategory.category}`;
    const addHref = `/admin/products/new?category=${subcategory.category}&subcategory=${encodeURIComponent(subcategory.id)}`;
    const gallery = subcategory.category === 'gallery';
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: TERMS.dashboard, href: '/admin' }, { label: c.label, href: parent }, { label: subcategory.name }]}
            title={subcategory.name}
            subtitle={products.length ? `${MESSAGES.productCount(products.length)} · shown on the website under ${c.menuTitle}` : 'Empty, so it is hidden from the website menu until you add something.'}
            secondaryActions={<Button variant="secondary" onClick={() => setEditing(true)}>{TERMS.edit}</Button>}
            primaryAction={<Button href={addHref}>{gallery ? 'Add item' : TERMS.addProduct}</Button>}
            menu={[{ label: TERMS.deleteSubcategory, destructive: true, onSelect: () => setDeleting(true) }]} />
        {gallery && <Card title={TERMS.uploadMedia}><GalleryUploader subcategoryId={subcategory.id} onUploaded={onChanged} /></Card>}
        <Card title={TERMS.products}>
            {products.length ? <ProductList products={products} subcategory={subcategory} subcategories={subcategories} onChanged={onChanged} />
                : <EmptyState icon={<Package size={24} />} title={MESSAGES.noProductsIn(subcategory.name)} text={gallery ? MESSAGES.noMedia : MESSAGES.noProducts}
                    action={gallery ? undefined : <Button href={addHref}>{TERMS.addProduct}</Button>} />}
        </Card>
        <SubcategoryNameDialog open={editing} onOpenChange={setEditing} category={subcategory.category} subcategory={subcategory} onSaved={onChanged} />
        <DeleteSubcategoryDialog open={deleting} onOpenChange={setDeleting} subcategory={subcategory} subcategories={subcategories} products={products}
            onDeleted={() => router.push(parent)} />
    </div>;
}
