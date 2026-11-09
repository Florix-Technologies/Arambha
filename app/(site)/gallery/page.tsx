import { fetchCatalog } from '@/lib/catalog';
import { CollectionIndex } from '@/components/catalog/CollectionViews';

export const revalidate = 3600;

export default async function GalleryPage() {
  return <CollectionIndex collection="gallery" catalog={await fetchCatalog('gallery')} />;
}
