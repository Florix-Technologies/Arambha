import type { MetadataRoute } from 'next';
import type { CatalogCategory } from '@/lib/catalog';
import { categoryPath, isCollection, isIndexableProduct, ownPhotos, productPath } from '@/lib/seo';

/** Escapes text for XML. Next.js writes sitemap values into the XML verbatim, so a raw '&' (e.g. `?w=500&h=500`) breaks the file. */
export const xmlEscape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** A URL as it must appear in a sitemap: percent-encoded (spaces etc.) and XML-escaped. Invalid URLs are dropped. */
export function sitemapUrl(url: string, base: string): string | null {
  try {
    return xmlEscape(new URL(url, base).href);
  } catch {
    return null;
  }
}

const newest = (dates: string[]) => dates.length ? new Date(dates.reduce((a, b) => (a > b ? a : b))) : undefined;
const urls = (list: Array<string | null>, base: string, max: number) =>
  list.map(u => (u ? sitemapUrl(u, base) : null)).filter((u): u is string => !!u).slice(0, max);

/** Every public, indexable page with its photos. Admin and API routes are never listed. */
export function buildSitemap(categories: CatalogCategory[], site: string): MetadataRoute.Sitemap {
  const page = (path: string) => xmlEscape(`${site}${path}`);
  const staticPages: MetadataRoute.Sitemap = [
    { url: page(''), changeFrequency: 'weekly', priority: 1.0 },
    { url: page('/services'), changeFrequency: 'monthly', priority: 0.9 },
    { url: page('/contact'), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const entries: MetadataRoute.Sitemap = [];
  const collectionDates: Record<string, string[]> = { interiors: [], furniture: [], gallery: [] };
  const seen = new Set<string>();

  for (const category of categories) {
    if (!isCollection(category.collection) || !category.products?.length) continue;
    const collection = category.collection;
    const dates = category.products.map(p => p.created_at);
    collectionDates[collection].push(...dates);
    const url = page(categoryPath(collection, category.slug));
    if (!seen.has(url)) {
      seen.add(url);
      const images = urls(category.products.map(p => ownPhotos(p)[0] ?? null), site, 20);
      entries.push({ url, lastModified: newest(dates), changeFrequency: 'weekly', priority: 0.7, ...(images.length ? { images } : {}) });
    }
    if (collection === 'gallery') continue;
    for (const product of category.products) {
      if (!isIndexableProduct(product)) continue;
      const photos = urls(ownPhotos(product), site, 10);
      entries.push({
        url: page(productPath(collection, category.slug, product)),
        lastModified: new Date(product.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
        ...(photos.length ? { images: photos } : {}),
      });
    }
  }

  // Empty collections are noindex (their pages' generateMetadata), so they are not listed either.
  const collectionPages: MetadataRoute.Sitemap = (['gallery', 'interiors', 'furniture'] as const).filter(c => collectionDates[c].length).map(collection => ({
    url: page(`/${collection}`),
    lastModified: newest(collectionDates[collection]),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...collectionPages, ...entries];
}
