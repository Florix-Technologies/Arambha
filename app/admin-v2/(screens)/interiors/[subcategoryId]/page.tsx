import { LiveCatalogScreen } from '@/components/admin/screens/LiveCatalogScreen';
export default async function Page({ params }: { params: Promise<{ subcategoryId: string }> }) { const { subcategoryId } = await params; return <LiveCatalogScreen key={subcategoryId} category="interiors" subcategoryId={subcategoryId} />; }
