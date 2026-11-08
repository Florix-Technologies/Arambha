'use client';
import { DashboardScreen } from '@/components/admin/screens/DashboardScreen';
import { useCatalog } from '@/components/admin/useCatalog';

export default function Page() {
    const catalog = useCatalog();
    return <DashboardScreen {...catalog} onRetry={catalog.retry} />;
}
