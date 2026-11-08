"use client";
import { useState } from 'react';
import { IndexTable, Thumbnail, Badge, Button } from '../ui';
import { TERMS, CATEGORIES } from '@/lib/admin/taxonomy';
import type { AdminProduct } from '@/lib/admin/types';
export function ProductTable({ products, basePath, onDelete }: {
    products: AdminProduct[];
    basePath?: string;
    onDelete?: (product: AdminProduct) => void;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    return <IndexTable caption={TERMS.products} rows={products} rowKey={p => p.id} selectable={!basePath} selectedKeys={selected} onSelectionChange={setSelected} bulkActions={<>
        <Button variant="secondary">
            {TERMS.moveTo}
        </Button>
        <Button variant="destructive">
            {TERMS.delete}
        </Button>
    </>} columns={[
        {
            key: 'image', label: TERMS.thumbnail, render: p =>
                <Thumbnail src={p.image} alt={p.name} />
        },
        { key: 'name', label: TERMS.productName, render: p => p.name }, { key: 'subcategory', label: TERMS.subcategory, render: p => p.subcategory },
        { key: 'price', label: TERMS.price, render: p => CATEGORIES[p.category].hasPrice && p.price != null ? `${TERMS.currency} ${p.price.toLocaleString('en-IN')}` : TERMS.unavailable },
        {
            key: 'status', label: TERMS.status, render: p =>
                <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                    {TERMS[p.status]}
                </Badge>
        },
        {
            key: 'actions', label: TERMS.actions, render: p => <>
                {basePath ? <Button variant="plain" href={`${basePath}/products/${encodeURIComponent(p.id)}`}>{TERMS.edit}</Button> : <Button variant="plain">{TERMS.edit}</Button>}
                {onDelete && <Button variant="plain" onClick={() => onDelete(p)} aria-label={`${TERMS.delete} ${p.name}`}>{TERMS.delete}</Button>}
            </>
        }
    ]} />;
}
