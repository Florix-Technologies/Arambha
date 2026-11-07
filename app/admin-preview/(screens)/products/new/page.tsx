import { ProductScreen } from '@/components/admin/screens/ProductScreen';
import { products, subcategories } from '@/lib/admin/mockData';
import { SAMPLE } from '@/lib/admin/mockData';
export default function Page() {
    return <ProductScreen mode="subcategory" category="interiors" subcategory={SAMPLE.aluminium} subcategories={subcategories} product={products[0]} images={['/al1.jpeg', '/al2.jpeg', '/i1.jpeg']} dirty />;
}
