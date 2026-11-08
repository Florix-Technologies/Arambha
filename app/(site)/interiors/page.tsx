import { fetchCatalog } from '@/lib/catalog';
import { CollectionIndex } from '@/components/catalog/CollectionViews';

export const revalidate = 3600;

export default async function InteriorsPage() {
  return <CollectionIndex collection="interiors" catalog={await fetchCatalog('interiors')} />;
}
