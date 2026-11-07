import { CategoryScreen } from '@/components/admin/screens/CategoryScreen';
import { products, subcategories } from '@/lib/admin/mockData';
export default function Page() {
    return <CategoryScreen category="interiors" products={products.filter(p => p.category === 'interiors')} subcategories={subcategories.filter(s => s.category === 'interiors')} />;
}
