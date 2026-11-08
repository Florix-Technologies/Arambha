import { ProductForm } from '@/components/admin/screens/ProductForm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProductForm key={id} productId={id} />;
}
