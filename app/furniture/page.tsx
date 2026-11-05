import { fetchCatalog } from '@/lib/catalog';
import FurnitureClient from './FurnitureClient';

export const dynamic = 'force-dynamic';

export default async function FurniturePage({ searchParams }: { searchParams: Promise<{ filter?: string | string[] }> }) {
  const { filter: rawFilter } = await searchParams;
  const filter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter;
  const catalog = await fetchCatalog('furniture').catch(error => {
    console.error('Error fetching furniture:', error);
    return [];
  });
  return <FurnitureClient catalog={catalog} filter={filter} />;
}
