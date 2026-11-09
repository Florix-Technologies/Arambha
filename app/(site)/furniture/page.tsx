import type { Metadata } from 'next';
import { fetchCatalog } from '@/lib/catalog';
import { CollectionIndex } from '@/components/catalog/CollectionViews';

export const revalidate = 3600;

// An empty collection is a thin page: it stays out of search results until the admin adds products.
export async function generateMetadata(): Promise<Metadata> {
  return (await fetchCatalog('furniture')).length ? {} : { robots: { index: false, follow: true } };
}

export default async function FurniturePage() {
  return <CollectionIndex collection="furniture" catalog={await fetchCatalog('furniture')} />;
}
