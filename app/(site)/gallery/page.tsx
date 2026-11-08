import { fetchCatalog } from '@/lib/catalog';
import GalleryClient from './GalleryClient';

export const dynamic = 'force-dynamic';

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ filter?: string | string[] }> }) {
  const { filter: rawFilter } = await searchParams;
  const filter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter;
  const catalog = await fetchCatalog('gallery').catch(error => {
    console.error('Error fetching gallery:', error);
    return [];
  });
  return <GalleryClient catalog={catalog} filter={filter} />;
}
