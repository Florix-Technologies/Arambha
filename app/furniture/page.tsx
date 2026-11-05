import { fetchCatalog } from '@/lib/catalog';
import FurnitureClient from './FurnitureClient';

export const dynamic = 'force-dynamic';

export default async function FurniturePage() {
  const catalog = await fetchCatalog('furniture').catch(error => {
    console.error('Error fetching furniture:', error);
    return [];
  });
  return <FurnitureClient catalog={catalog} />;
}
