import { DashboardScreen } from '@/components/admin/screens/DashboardScreen';
import { subcategories, recentProducts } from '@/lib/admin/mockData';
export default function Page() {
    return <DashboardScreen products={recentProducts} subcategories={subcategories} recent={recentProducts} />;
}
