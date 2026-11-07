import { CategoryScreen } from '@/components/admin/screens/CategoryScreen';
import { products, subcategories } from '@/lib/admin/mockData';
export default function Page() {
    return <CategoryScreen category="furniture" products={products.filter(p => p.category === 'furniture')} subcategories={subcategories.filter(s => s.category === 'furniture')} />;
}
