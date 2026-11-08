import { notFound } from 'next/navigation';
import { LiveCatalogScreen } from '@/components/admin/screens/LiveCatalogScreen';
import { categoryFromParam } from '@/lib/admin/taxonomy';

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
    const category = categoryFromParam((await params).category);
    if (!category) notFound();
    return <LiveCatalogScreen key={category.key} category={category.key} />;
}
