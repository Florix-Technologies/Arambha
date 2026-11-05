import { fetchCatalog } from '@/lib/catalog';
import InteriorsClient from './InteriorsClient';

export const dynamic = 'force-dynamic';

export default async function InteriorsPage() {
  const catalog = await fetchCatalog('interiors').catch(error => {
    console.error('Error fetching interiors:', error);
    return [];
  });
  return <InteriorsClient catalog={catalog} />;
}
