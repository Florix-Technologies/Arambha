import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { fetchSitemapCatalog } from '@/lib/catalogPages';
import { isVideoUrl } from '@/lib/imageUtils';
import { categoryPath, isCollection, isIndexableProduct, productImage, productMedia, productPath } from '@/lib/seo';

export const revalidate = 3600;

const newest = (dates: string[]) => dates.length ? new Date(dates.reduce((a, b) => (a > b ? a : b))) : undefined;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${SITE_URL}/services`, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    ];

    // Without the catalogue (e.g. the database is unreachable) the sitemap still lists the fixed pages.
    const categories = await fetchSitemapCatalog().catch(() => []);
    const entries: MetadataRoute.Sitemap = [];
    const collectionDates: Record<string, string[]> = { interiors: [], furniture: [], gallery: [] };
    const seen = new Set<string>();

    for (const category of categories) {
        if (!isCollection(category.collection) || !category.products?.length) continue;
        const collection = category.collection;
        const dates = category.products.map(p => p.created_at);
        collectionDates[collection].push(...dates);
        const url = `${SITE_URL}${categoryPath(collection, category.slug)}`;
        if (!seen.has(url)) {
            seen.add(url);
            const images = category.products.map(productImage).filter((u): u is string => !!u).slice(0, 20);
            entries.push({ url, lastModified: newest(dates), changeFrequency: 'weekly', priority: 0.7, ...(images.length ? { images } : {}) });
        }
        if (collection === 'gallery') continue;
        for (const product of category.products) {
            if (!isIndexableProduct(product)) continue;
            const photos = productMedia(product).filter(u => !isVideoUrl(u)).slice(0, 10);
            entries.push({
                url: `${SITE_URL}${productPath(collection, category.slug, product)}`,
                lastModified: new Date(product.created_at),
                changeFrequency: 'monthly',
                priority: 0.6,
                ...(photos.length ? { images: photos } : {}),
            });
        }
    }

    const collectionPages: MetadataRoute.Sitemap = (['gallery', 'interiors', 'furniture'] as const).map(collection => ({
        url: `${SITE_URL}/${collection}`,
        lastModified: newest(collectionDates[collection]),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticPages, ...collectionPages, ...entries];
}
