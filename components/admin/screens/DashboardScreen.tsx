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
    return <div className={s.page}>
        <PageHeader title={TERMS.dashboard} subtitle={MESSAGES.dashboardSubtitle} />
        {loading ? <><Card><Skeleton lines={3} /></Card><Card><Skeleton lines={6} /></Card></> : error ?
            <Card><p role="alert">{error}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</Card> : <>
        <Card title="Catalog totals">
            <p>{TERMS.categories}: {subcategories.length}</p>
            <p>{TERMS.products}: {products.length}</p>
        </Card>
        <div className={s.grid}>
            {CATEGORY_KEYS.map(key =>
                <Card key={key} title={CATEGORIES[key].label}>
                    <p>
                        {MESSAGES.subcategoryCount(subcategories.filter(x => x.category === key).length)}
                    </p>
                    <p>
                        {MESSAGES.productCount(products.filter(x => x.category === key).length)}
                    </p>
                    <Button variant="secondary" href={managementHref ?? `${basePath}/${key}`}>
                        {TERMS.open}
                    </Button>
                </Card>
            )}
        </div>
        <Card title={TERMS.quickActions}>
            <div className={s.actions}>
                <Button href={managementHref ?? `${basePath}/products/new`}>
                    {TERMS.addProduct}
                </Button>
            </div>
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
