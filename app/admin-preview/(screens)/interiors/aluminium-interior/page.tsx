import { SubcategoryScreen } from '@/components/admin/screens/SubcategoryScreen';
import { DeleteSubcategoryDialog } from '@/components/admin/screens/DeleteSubcategoryDialog';
import { products, subcategories } from '@/lib/admin/mockData';
import { SAMPLE } from '@/lib/admin/mockData';
export default async function Page({ searchParams }: {
    searchParams: Promise<{
        modal?: string;
    }>;
}) {
    const query = await searchParams; const items = products.filter(p => p.subcategory === SAMPLE.aluminium); return <SubcategoryScreen category="interiors" name={SAMPLE.aluminium} products={items} dialog={
        <DeleteSubcategoryDialog key={query.modal} open={query.modal === 'delete'} name={SAMPLE.aluminium} count={items.length} subcategories={subcategories.filter(s => s.category === 'interiors')} />
    } />;
}
