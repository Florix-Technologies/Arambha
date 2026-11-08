import { ProductForm } from '@/components/admin/screens/ProductForm';

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; subcategory?: string }> }) {
    const params = await searchParams;
    return <ProductForm initialCategory={params.category} initialSubcategory={params.subcategory} />;
}
