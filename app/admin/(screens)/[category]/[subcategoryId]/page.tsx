import { notFound } from 'next/navigation';
import { LiveCatalogScreen } from '@/components/admin/screens/LiveCatalogScreen';
import { categoryFromParam } from '@/lib/admin/taxonomy';

export default async function Page({ params }: { params: Promise<{ category: string; subcategoryId: string }> }) {
    const { category: param, subcategoryId } = await params;
    const category = categoryFromParam(param);
    if (!category) notFound();
    return <LiveCatalogScreen key={`${category.key}/${subcategoryId}`} category={category.key} subcategoryId={subcategoryId} />;
}
