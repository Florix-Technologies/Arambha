import { CategoryScreen } from '@/components/admin/screens/CategoryScreen';
import { products, subcategories } from '@/lib/admin/mockData';
export default function Page() {
    return <CategoryScreen category="gallery" products={products.filter(p => p.category === 'gallery')} subcategories={subcategories.filter(s => s.category === 'gallery')} />;
}
