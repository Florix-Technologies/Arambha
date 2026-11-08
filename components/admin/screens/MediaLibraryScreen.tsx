"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Images } from 'lucide-react';
import { Badge, Button, Card, EmptyState, PageHeader, SelectField, Skeleton, Thumbnail } from '../ui';
import { CATEGORIES, CATEGORY_KEYS, TERMS } from '@/lib/admin/taxonomy';
import { productMedia, useCatalog, useMediaCheck } from '../useCatalog';
import s from './MediaLibraryScreen.module.css';

// Every photo and video used by the catalog, with the ones that fail to load flagged. Each file opens its product.
export function MediaLibraryScreen() {
    const { products, loading, error, retry } = useCatalog();
    const [category, setCategory] = useState('');
    const [show, setShow] = useState('all');
    const files = products.filter(p => !category || p.category === category)
        .flatMap(p => productMedia(p).map((url, index) => ({ url, index, product: p })));
    const status = useMediaCheck(files.map(f => f.url));
    const broken = files.filter(f => status.get(f.url) === 'broken');
    const shown = show === 'problems' ? broken : files;
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: TERMS.dashboard, href: '/admin' }, { label: TERMS.mediaLibrary }]} title={TERMS.mediaLibrary}
            subtitle="Every photo and video on your website. To add new ones, open a product or a Gallery subcategory." />
        {loading ? <Card><Skeleton lines={6} /></Card> : error ? <Card><p role="alert">{error}</p><Button variant="secondary" onClick={retry}>Try again</Button></Card> : <Card>
            <div className={s.toolbar}>
                <SelectField label="Main category" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">All main categories</option>
                    {CATEGORY_KEYS.map(key => <option key={key} value={key}>{CATEGORIES[key].label}</option>)}
                </SelectField>
                <SelectField label="Show" value={show} onChange={e => setShow(e.target.value)}>
                    <option value="all">All files ({files.length})</option>
                    <option value="problems">Broken files ({broken.length})</option>
                </SelectField>
            </div>
            {shown.length === 0 ? <EmptyState icon={<Images size={24} />} title={show === 'problems' ? 'No broken files' : 'No photos or videos yet'}
                text={show === 'problems' ? 'Every file loads. Nice.' : 'Add products with photos and they appear here.'} /> :
                <ul className={s.grid}>
                    {shown.map(f => <li key={`${f.product.id}-${f.index}`}>
                        <Link href={`/admin/products/${encodeURIComponent(f.product.id)}`} className={s.tile}>
                            <Thumbnail src={f.url} alt={`${f.product.name}${f.index ? ` photo ${f.index + 1}` : ''}`} size="lg" />
                            <strong>{f.product.name}</strong>
                            <small>{CATEGORIES[f.product.category].label} › {f.product.subcategory}</small>
                            <span className={s.badges}>{f.index === 0 && productMedia(f.product).length > 1 && <Badge>{TERMS.cover}</Badge>}{status.get(f.url) === 'broken' && <Badge tone="danger">Broken</Badge>}</span>
                        </Link>
                    </li>)}
                </ul>}
        </Card>}
    </div>;
}
