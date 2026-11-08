"use client";
import Link from 'next/link';
import { useState } from 'react';
import { CircleCheck, ImageOff, FolderOpen, Package, ChevronRight } from 'lucide-react';
import { PageHeader, Card, Button, Thumbnail, Skeleton, EmptyState } from '../ui';
import { CATEGORIES, CATEGORY_KEYS, TERMS, MESSAGES } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import { productMedia, useMediaCheck } from '../useCatalog';
import { TourOffer } from '../Tour';
import s from './DashboardScreen.module.css';

const where = (p: AdminProduct) => `${CATEGORIES[p.category].label} › ${p.subcategory}`;
const date = (value: string) => Number.isNaN(Date.parse(value)) ? TERMS.unavailable : new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

export function DashboardScreen({ products, subcategories, loading = false, error, onRetry }: {
    products: AdminProduct[];
    subcategories: AdminSubcategory[];
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
}) {
    const ready = !loading && !error;
    return <div className={s.page}>
        <PageHeader title={TERMS.dashboard} subtitle={MESSAGES.dashboardSubtitle}
            primaryAction={ready ? <Button href="/admin/products/new">{TERMS.addProduct}</Button> : undefined} />
        <TourOffer />
        {loading ? <div className={s.columns}><Card><Skeleton lines={6} /></Card><Card><Skeleton lines={4} /></Card></div> : error ?
            <Card><p role="alert">{error}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</Card> :
            <div className={s.columns}>
                <div className={s.stack}>
                    <Card title={TERMS.catalog}>
                        <table className={s.summary}>
                            <caption className={s.srOnly}>{TERMS.catalog}</caption>
                            <thead><tr><th scope="col">Main category</th><th scope="col">{TERMS.subcategories}</th><th scope="col">{TERMS.products}</th><th scope="col"><span className={s.srOnly}>{TERMS.open}</span></th></tr></thead>
                            <tbody>
                                {CATEGORY_KEYS.map(key => <tr key={key}>
                                    <th scope="row"><Link className={s.collection} href={`/admin/${key}`}>{CATEGORIES[key].label}</Link><span className={s.menu}>{CATEGORIES[key].menuTitle}</span></th>
                                    <td>{subcategories.filter(x => x.category === key).length}</td>
                                    <td>{products.filter(x => x.category === key).length}</td>
                                    <td><ChevronRight size={18} aria-hidden="true" /></td>
                                </tr>)}
                            </tbody>
                            <tfoot><tr><th scope="row">{TERMS.total}</th><td>{subcategories.length}</td><td>{products.length}</td><td /></tr></tfoot>
                        </table>
                    </Card>
                    <Card title={TERMS.recentlyAdded}>
                        {products.length === 0 ? <EmptyState icon={<Package size={24} />} title={`No ${TERMS.products.toLowerCase()} yet`} text={MESSAGES.noProducts} action={<Button href="/admin/products/new">{TERMS.addProduct}</Button>} /> :
                            <ul className={s.recent}>
                                {products.slice(0, 6).map(p => <li key={p.id}>
                                    <Link className={s.row} href={`/admin/products/${encodeURIComponent(p.id)}`}>
                                        <Thumbnail src={p.image} alt={p.name} />
                                        <span><strong>{p.name}</strong><small>{where(p)}</small></span>
                                        <time dateTime={p.date}>{date(p.date)}</time>
                                    </Link>
                                </li>)}
                            </ul>}
                    </Card>
                </div>
                <Attention products={products} subcategories={subcategories} />
            </div>}
    </div>;
}

function Attention({ products, subcategories }: { products: AdminProduct[]; subcategories: AdminSubcategory[] }) {
    // Files are only downloaded to be checked when asked; a missing cover is flagged straight away.
    const [checkFiles, setCheckFiles] = useState(false);
    const status = useMediaCheck(checkFiles ? products.flatMap(productMedia) : []);
    const checking = Array.from(status.values()).filter(v => v === 'checking').length;
    const media = products.filter(p => !p.image || productMedia(p).some(url => status.get(url) === 'broken'));
    const empty = subcategories.filter(sub => !products.some(p => p.subcategoryId === sub.id));
    return <Card title={TERMS.needsAttention}>
        <div className={s.attention}>
            {checking > 0 && <p role="status" className={s.checking}>Checking {checking} {checking === 1 ? 'file' : 'files'}…</p>}
            {!checkFiles && <p className={s.checking}>Photos and videos are not checked automatically. <Button variant="secondary" onClick={() => setCheckFiles(true)}>Check all photos and videos</Button></p>}
            {media.length + empty.length === 0 && checking === 0 && <p className={s.ok}><CircleCheck size={20} aria-hidden="true" />{checkFiles ? `All ${status.size} photos and videos load, and every` : 'Every product has a cover photo, and every'} subcategory has products.</p>}
            {media.length > 0 && <section>
                <h3><ImageOff size={18} aria-hidden="true" />{MESSAGES.productCount(media.length)} with a missing or broken photo</h3>
                <ul>{media.map(p => <li key={p.id}>
                    <Link href={`/admin/products/${encodeURIComponent(p.id)}`}><Thumbnail src={p.image} alt={p.name} /><span><strong>{p.name}</strong><small>{where(p)}</small></span><span className={s.fix}>Fix</span></Link>
                </li>)}</ul>
            </section>}
            {empty.length > 0 && <section>
                <h3><FolderOpen size={18} aria-hidden="true" />{MESSAGES.emptyAlert(empty.length)}</h3>
                <ul>{empty.map(sub => <li key={sub.id}>
                    <Link href={`/admin/${sub.category}/${encodeURIComponent(sub.id)}`}><span><strong>{sub.name}</strong><small>{CATEGORIES[sub.category].label}</small></span><span className={s.fix}>{TERMS.addProduct}</span></Link>
                </li>)}</ul>
            </section>}
        </div>
    </Card>;
}
