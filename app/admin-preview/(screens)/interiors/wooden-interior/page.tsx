import { SubcategoryScreen } from '@/components/admin/screens/SubcategoryScreen';
import { SAMPLE } from '@/lib/admin/mockData';
export default function Page() {
    return <SubcategoryScreen category="interiors" name={SAMPLE.wooden} products={[]} />;
}
