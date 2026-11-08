import Link from 'next/link';
import { Package } from 'lucide-react';
import { PageHeader, Card, Button, Thumbnail, Skeleton, EmptyState } from '../ui';
import { CATEGORIES, CATEGORY_KEYS, TERMS, MESSAGES } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import s from './DashboardScreen.module.css';
export function DashboardScreen({ products, subcategories, recent, basePath = '/admin-preview', managementHref, loading = false, error, onRetry }: {
    products: AdminProduct[];
    subcategories: AdminSubcategory[];
    recent: AdminProduct[];
    basePath?: string;
    managementHref?: string;
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
}) {
    const ready = !loading && !error;
    return <div className={s.page}>
        <PageHeader title={TERMS.dashboard} subtitle={MESSAGES.dashboardSubtitle}
            primaryAction={ready ? <Button href={managementHref ?? `${basePath}/products/new`}>{TERMS.addProduct}</Button> : undefined} />
        {loading ? <><Card><Skeleton lines={3} /></Card><Card><Skeleton lines={6} /></Card></> : error ?
            <Card><p role="alert">{error}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</Card> : <>
        <Card title={TERMS.catalog}>
            <table className={s.summary}>
                <caption className={s.srOnly}>{TERMS.catalog}</caption>
                <thead><tr><th scope="col">{TERMS.collection}</th><th scope="col">{TERMS.subcategories}</th><th scope="col">{TERMS.products}</th></tr></thead>
                <tbody>
                    {CATEGORY_KEYS.map(key => {
                        const label = CATEGORIES[key].label;
                        return <tr key={key}>
                            <th scope="row"><Link className={s.collection} href={managementHref ?? `${basePath}/${key}`}>{label}</Link></th>
                            <td>{subcategories.filter(x => x.category === key).length}</td>
                            <td>{products.filter(x => x.category === key).length}</td>
                        </tr>;
                    })}
                </tbody>
                <tfoot><tr><th scope="row">{TERMS.total}</th><td>{subcategories.length}</td><td>{products.length}</td></tr></tfoot>
            </table>
        </Card>
        <Card title={TERMS.recentlyAdded}>
            {recent.length === 0 ? <EmptyState icon={<Package size={24} />} title={`No ${TERMS.products.toLowerCase()} yet`} text={MESSAGES.noProducts} action={<Button href={managementHref ?? `${basePath}/products/new`}>{TERMS.addProduct}</Button>} /> : <div>
                {recent.slice(0, 6).map(p =>
                    <div className={s.row} key={p.id}>
                        <Thumbnail src={p.image} alt={p.name} />
                        <div>
                            <strong>
                                {p.name}
                            </strong>
                            <p>
                                {CATEGORIES[p.category].label} {TERMS.separator} {p.subcategory}
                            </p>
                        </div>
                        <time dateTime={p.date}>
                            {Number.isNaN(Date.parse(p.date)) ? TERMS.unavailable : new Date(p.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </time>
                    </div>
                )}
            </div>}
        </Card>
        </>}
    </div>;
}
