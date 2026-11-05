import { fetchCatalog } from '@/lib/catalog';
import GalleryClient from './GalleryClient';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const catalog = await fetchCatalog('gallery').catch(error => {
    console.error('Error fetching gallery:', error);
    return [];
  });
  return <GalleryClient catalog={catalog} />;
}
