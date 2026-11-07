import { MediaGridScreen } from '@/components/admin/screens/MediaGridScreen';
import { media, uploads, subcategories } from '@/lib/admin/mockData';
import { SAMPLE } from '@/lib/admin/mockData';
export default async function Page({ searchParams }: {
    searchParams: Promise<{
        drawer?: string;
    }>;
}) {
    const query = await searchParams; return <MediaGridScreen key={query.drawer} name={SAMPLE.kitchen} media={media} uploads={uploads} subcategories={subcategories.filter(s => s.category === 'gallery')} drawerOpen={query.drawer === '1'} />;
}
