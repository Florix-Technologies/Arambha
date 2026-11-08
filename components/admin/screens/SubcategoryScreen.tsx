"use client";
import { useState, type ReactNode } from 'react';
import { Package } from 'lucide-react';
import { PageHeader, Button, Card, Thumbnail, Badge, ViewToggle, EmptyState } from '../ui';
import { CATEGORIES, TERMS, MESSAGES, type CategoryKey } from '@/lib/admin/taxonomy';
import { ProductTable } from './ProductTable';
import { LiveProducts } from './LiveProducts';
import type { AdminProduct } from '@/lib/admin/types';
import s from './SubcategoryScreen.module.css';
export function SubcategoryScreen({ category, name, products, dialog, subcategoryId, basePath = '/admin-preview', onDeleted }: {
    category: CategoryKey;
    name: string; subcategoryId?: string;
    products: AdminProduct[];
    dialog?: ReactNode;
    basePath?: string;
    onDeleted?: (id: string) => void;
}) {
    const [view, setView] = useState<'table' | 'grid'>('table');
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: CATEGORIES[category].label, href: `${basePath}/${category}` }, { label: name }]} title={name} primaryAction={
            <Button href={`${basePath}/products/new?category=${category}${subcategoryId ? `&subcategory=${encodeURIComponent(subcategoryId)}` : ''}`}>
                {TERMS.addProduct}
            </Button>
        } menu={onDeleted ? undefined : [{ label: TERMS.rename }, { label: TERMS.delete, href: '?modal=delete', destructive: true }]} />
        {onDeleted ? <Card title={TERMS.products}><LiveProducts products={products} onDeleted={onDeleted} /></Card> : products.length ?
            <ViewToggle value={view} onValueChange={setView} table={
                <ProductTable products={products} />
            } grid={
                <div className={s.grid}>
                    {products.map(p =>
                        <Card key={p.id}>
                            <div className={s.product}>
                                <Thumbnail src={p.image} alt={p.name} />
                                <h2>
                                    {p.name}
                                </h2>
                                {CATEGORIES[category].hasPrice && p.price != null &&
                                    <p>
                                        {TERMS.currency} {p.price.toLocaleString('en-IN')}
                                    </p>
                                }
                                <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                                    {TERMS[p.status]}
                                </Badge>
                            </div>
                        </Card>
                    )}
                </div>
            } />
            :
            <Card>
                <EmptyState icon={
                    <Package />
                } title={MESSAGES.noProductsIn(name)} text={MESSAGES.noProducts} action={
                    <Button>
                        {TERMS.addProduct}
                    </Button>
                } />
            </Card>
        }{dialog}
    </div>;
}
