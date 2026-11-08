import { LiveMediaGridScreen } from '@/components/admin/screens/LiveMediaGridScreen';
export default async function Page({ params }: { params: Promise<{ subcategoryId: string }> }) { const { subcategoryId } = await params; return <LiveMediaGridScreen key={subcategoryId} subcategoryId={subcategoryId} />; }
