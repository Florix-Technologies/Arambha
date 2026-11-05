import { fetchCatalog } from '@/lib/catalog';
import InteriorsClient from './InteriorsClient';

export const dynamic = 'force-dynamic';

export default async function InteriorsPage({ searchParams }: { searchParams: Promise<{ filter?: string | string[] }> }) {
  const { filter: rawFilter } = await searchParams;
  const filter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter;
  const catalog = await fetchCatalog('interiors').catch(error => {
    console.error('Error fetching interiors:', error);
    return [];
  });
  return <InteriorsClient catalog={catalog} filter={filter} />;
}
