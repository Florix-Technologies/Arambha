"use client";
import Link from 'next/link';
import { IndexTable, Thumbnail, Button } from '../ui';
import { TERMS, CATEGORIES } from '@/lib/admin/taxonomy';
import type { AdminProduct } from '@/lib/admin/types';

const date = (value: string) => Number.isNaN(Date.parse(value)) ? TERMS.unavailable : new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
export function ProductTable({ products, onMove, onDelete }: {
    products: AdminProduct[];
    onMove?: (product: AdminProduct) => void;
    onDelete: (product: AdminProduct) => void;
}) {
    const hasPrice = products.some(p => CATEGORIES[p.category].hasPrice);
    return <IndexTable caption={TERMS.products} rows={products} rowKey={p => p.id} columns={[
        { key: 'image', label: TERMS.thumbnail, render: p => <Thumbnail src={p.image} alt={p.name} /> },
        { key: 'name', label: TERMS.productName, render: p => <Link href={`/admin/products/${encodeURIComponent(p.id)}`}><strong>{p.name}</strong></Link> },
        ...(hasPrice ? [{ key: 'price', label: TERMS.price, render: (p: AdminProduct) => p.price != null ? `${TERMS.currency} ${p.price.toLocaleString('en-IN')}` : 'Not shown' }] : []),
        { key: 'date', label: 'Added', render: p => date(p.date) },
        {
            key: 'actions', label: TERMS.actions, render: p => <>
                <Button variant="plain" href={`/admin/products/${encodeURIComponent(p.id)}`} aria-label={`${TERMS.edit} ${p.name}`}>{TERMS.edit}</Button>
                {onMove && <Button variant="plain" onClick={() => onMove(p)} aria-label={`${TERMS.move} ${p.name}`}>{TERMS.move}</Button>}
                <Button variant="plain" onClick={() => onDelete(p)} aria-label={`${TERMS.delete} ${p.name}`}>{TERMS.delete}</Button>
            </>
        },
    ]} />;
}
