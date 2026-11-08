import { fetchCatalog } from '@/lib/catalog';
import { CollectionIndex } from '@/components/catalog/CollectionViews';

export const revalidate = 3600;

export default async function FurniturePage() {
  return <CollectionIndex collection="furniture" catalog={await fetchCatalog('furniture')} />;
}
