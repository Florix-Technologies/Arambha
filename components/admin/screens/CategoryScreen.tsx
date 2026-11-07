"use client";
import { useState } from 'react';
import { PageHeader, Card, Button, Thumbnail, Badge, Menu, TextField, SelectField } from '../ui';
import { CATEGORIES, TERMS, MESSAGES, type CategoryKey } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { ProductTable } from './ProductTable';
import s from './CategoryScreen.module.css';
export function CategoryScreen({ category, subcategories, products, basePath = '/admin-preview' }: {
    category: CategoryKey;
    subcategories: AdminSubcategory[];
    products: AdminProduct[];
    basePath?: string;
}) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const c = CATEGORIES[category];
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: TERMS.dashboard, href: basePath }, { label: c.label }]} title={c.label} subtitle={MESSAGES.shownInMenu(c.menuTitle)} secondaryActions={
            <Button variant="secondary">
                {TERMS.addSubcategory}
            </Button>
        } primaryAction={
            <Button href={category === 'gallery' ? `${basePath}/gallery/kitchen` : `${basePath}/products/new`}>
                {c.actionPrimary}
            </Button>
        } />
        <Card title={TERMS.subcategories}>
            <div className={s.grid}>
                {subcategories.map(sub => {
                    const items = products.filter(p => p.subcategory === sub.name); return <div className={s.sub} key={sub.id}>
                        <Thumbnail src={items[0]?.image} alt={sub.name} />
                        <div>
                            <Button variant="plain" href={`${basePath}/${category}/${sub.id}`}>
                                {sub.name}
                            </Button>
                            <p>
                                {MESSAGES.productCount(items.length)}
                            </p>
                            {!items.length &&
                                <Badge tone="warning">
                                    {TERMS.hiddenEmpty}
                                </Badge>
                            }
                        </div>
                        <Menu ariaLabel={`${TERMS.more}: ${sub.name}`} items={[{ label: TERMS.rename }, { label: TERMS.delete, destructive: true }]} />
                    </div>;
                })}
            </div>
        </Card>
        <Card title={TERMS.products}>
            <div className={s.filters}>
                <TextField type="search" label={TERMS.search} value={search} onChange={e => setSearch(e.target.value)} />
                <SelectField label={TERMS.subcategory} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">
                        {TERMS.allSubcategories}
                    </option>
                    {subcategories.map(sub =>
                        <option key={sub.id}>
                            {sub.name}
                        </option>
                    )}
                </SelectField>
            </div>
            <ProductTable products={products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && (!filter || p.subcategory === filter))} />
        </Card>
    </div>;
}
