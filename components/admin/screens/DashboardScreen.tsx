import { AlertTriangle } from 'lucide-react';
import { PageHeader, Card, Button, Thumbnail } from '../ui';
import { CATEGORIES, CATEGORY_KEYS, TERMS, MESSAGES } from '@/lib/admin/taxonomy';
import type { AdminProduct, AdminSubcategory } from '@/lib/admin/types';
import s from './DashboardScreen.module.css';
export function DashboardScreen({ products, subcategories, recent, basePath = '/admin-preview' }: {
    products: AdminProduct[];
    subcategories: AdminSubcategory[];
    recent: AdminProduct[];
    basePath?: string;
}) {
    return <div className={s.page}>
        <PageHeader title={TERMS.dashboard} subtitle={MESSAGES.dashboardSubtitle} />
        <div role="alert" className={s.warning}>
            <AlertTriangle size={20} />
            {MESSAGES.emptyAlert(3)}
        </div>
        <div className={s.grid}>
            {CATEGORY_KEYS.map(key =>
                <Card key={key} title={CATEGORIES[key].label}>
                    <p>
                        {MESSAGES.subcategoryCount(subcategories.filter(x => x.category === key).length)}
                    </p>
                    <p>
                        {MESSAGES.productCount(products.filter(x => x.category === key).length)}
                    </p>
                    <Button variant="secondary" href={`${basePath}/${key}`}>
                        {TERMS.open}
                    </Button>
                </Card>
            )}
        </div>
        <Card title={TERMS.quickActions}>
            <div className={s.actions}>
                <Button href={`${basePath}/products/new`}>
                    {TERMS.addProduct}
                </Button>
                <Button variant="secondary" href={`${basePath}/gallery/kitchen`}>
                    {TERMS.uploadMedia}
                </Button>
            </div>
        </Card>
        <Card title={TERMS.recentlyAdded}>
            <div>
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
                        <time>
                            {p.date}
                        </time>
                    </div>
                )}
            </div>
        </Card>
    </div>;
}
