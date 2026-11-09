import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { fetchSitemapCatalog } from '@/lib/catalogPages';
import { buildSitemap } from '@/lib/sitemap';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Without the catalogue (e.g. the database is unreachable) the sitemap still lists the fixed pages.
  const categories = await fetchSitemapCatalog().catch(() => []);
  return buildSitemap(categories, SITE_URL);
}
