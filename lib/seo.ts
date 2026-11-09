import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { slugify } from '@/lib/slug';
import { isVideoUrl } from '@/lib/imageUtils';
import type { Collection } from '@/lib/catalog';

export const BRAND = 'Arambha Design & Interior Studio';
export const DEFAULT_OG_IMAGE = '/og-default.jpg';
export const BUSINESS = {
  phone: '+91-91876-28243',
  phoneDisplay: '+91 91876 28243',
  email: 'admin@arambhainteriorstudio.com',
  address: {
    streetAddress: 'No.11/68/1, 2nd Floor, 59th Cross, 4th Block, Rajajinagar, Opp. MEI Polytechnic College',
    addressLocality: 'Bangalore',
    addressRegion: 'Karnataka',
    postalCode: '560010',
    addressCountry: 'IN',
  },
} as const;

export const COLLECTIONS: Record<Collection, { label: string; path: string }> = {
  interiors: { label: 'Interiors', path: '/interiors' },
  furniture: { label: 'Furniture', path: '/furniture' },
  gallery: { label: 'Gallery', path: '/gallery' },
};
export const isCollection = (value: string): value is Collection => value in COLLECTIONS;

/** Seo fields the admin may add to a row later; templates are used when they are missing or blank. */
export type SeoOverrides = { seo_title?: string | null; seo_description?: string | null };
const override = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max / 2))}…`;
}

type MediaProduct = { image_url: string | null; images: string[] | null };
type SeoProduct = MediaProduct & { id: string; name: string; description: string | null; price: number | null };
type SeoCategory = { name: string; slug: string };

export function productMedia(product: MediaProduct): string[] {
  return [...new Set([product.image_url, ...(product.images ?? [])].filter((url): url is string => !!url))];
}
/** First real photo (videos make poor preview images). */
export function productImage(product: MediaProduct): string | null {
  return productMedia(product).find(url => !isVideoUrl(url)) ?? null;
}
/** Stock-photo libraries: such a photo shows someone else's work, so it never counts as the product's own photo. */
const STOCK_HOSTS = /(^|\.)(unsplash\.com|pexels\.com|pixabay\.com|shutterstock\.com|istockphoto\.com|freepik\.com)$/i;
export function isStockPhoto(url: string): boolean {
  try { return STOCK_HOSTS.test(new URL(url, 'https://placeholder.invalid').hostname); } catch { return false; }
}
/** The product's own photos: the only ones offered to search engines (indexing, sitemap, social preview, JSON-LD). */
export const ownPhotos = (product: MediaProduct) => productMedia(product).filter(url => !isVideoUrl(url) && !isStockPhoto(url));

export const categoryPath = (collection: Collection, slug: string) => `${COLLECTIONS[collection].path}/${slug}`;
export const productSlug = (product: { id: string; name: string }) => `${slugify(product.name) || 'item'}-${product.id.slice(0, 8)}`;
export const productPath = (collection: Collection, categorySlug: string, product: { id: string; name: string }) =>
  `${categoryPath(collection, categorySlug)}/${productSlug(product)}`;

/** Thin pages stay out of search results: a product needs its own photo (not a stock one) and a real description. */
export function isIndexableProduct(product: SeoProduct): boolean {
  return ownPhotos(product).length > 0 && (product.description ?? '').trim().length >= 60;
}

export function pageMeta(opts: { title: string; description: string; path: string; image?: string | null; absoluteTitle?: boolean; noindex?: boolean }): Metadata {
  const url = `${SITE_URL}${opts.path === '/' ? '' : opts.path}`;
  const fullTitle = opts.absoluteTitle ? opts.title : `${opts.title} | ${BRAND}`;
  const images = [{ url: opts.image ?? DEFAULT_OG_IMAGE, alt: opts.image ? opts.title : BRAND }];
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_IN', siteName: BRAND, url, title: fullTitle, description: opts.description, images },
    twitter: { card: 'summary_large_image', title: fullTitle, description: opts.description, images: images.map(i => i.url) },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function subcategoryMeta(
  collection: Collection,
  category: SeoCategory & SeoOverrides,
  products: Array<MediaProduct & { name: string }>,
): Metadata {
  const { name } = category;
  const count = products.length;
  const title = override(category.seo_title) ?? {
    interiors: `${/design/i.test(name) ? name : `${name} Designs`} – Interiors in Bangalore`,
    furniture: `${name} – Furniture in Bangalore`,
    gallery: `${/interior/i.test(name) ? name : `${name} Interior`} Photos – Bangalore Projects`,
  }[collection];
  const noun = { interiors: count === 1 ? 'design' : 'designs', furniture: count === 1 ? 'piece' : 'pieces', gallery: count === 1 ? 'project photo' : 'project photos' }[collection];
  const lead = collection === 'gallery' ? `${count} ${noun} of ${name} work` : `Explore ${count} ${name} ${noun}`;
  // List real product names while the sentence still fits in a search snippet.
  const describe = (names: string[]) => `${lead} by ${BRAND}, Bangalore${names.length ? `, including ${names.join(', ')}` : ''}. Request a consultation.`;
  const names = collection === 'gallery' ? [] : products.slice(0, 3).map(p => p.name);
  let description = override(category.seo_description);
  for (let n = names.length; !description; n--) if (n === 0 || describe(names.slice(0, n)).length <= 160) description = describe(names.slice(0, n));
  return pageMeta({ title, description, path: categoryPath(collection, category.slug), image: products.map(p => ownPhotos(p)[0]).find(Boolean) });
}

export function productMeta(collection: Collection, category: SeoCategory, product: SeoProduct & SeoOverrides): Metadata {
  const title = override(product.seo_title) ?? `${product.name} – ${category.name}`;
  const description = override(product.seo_description)
    ?? (product.description?.trim() ? truncate(product.description, 158) : truncate(`${product.name}: ${category.name} ${COLLECTIONS[collection].label.toLowerCase()} by ${BRAND}, Bangalore. Enquire for details and a design consultation.`, 160));
  return pageMeta({ title, description, path: productPath(collection, category.slug, product), image: ownPhotos(product)[0], noindex: !isIndexableProduct(product) });
}

export function mediaAlt(collection: Collection, category: SeoCategory, product: { name: string }, index: number): string {
  return `${product.name} – ${category.name}, ${COLLECTIONS[collection].label} by ${BRAND}, Bangalore, photo ${index + 1}`;
}

export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

/** Only for products with a real price; availability, ratings and reviews are never made up. */
export function productJsonLd(collection: Collection, category: SeoCategory, product: SeoProduct & SeoOverrides) {
  if (!(Number(product.price) > 0)) return null;
  const url = `${SITE_URL}${productPath(collection, category.slug, product)}`;
  const photos = ownPhotos(product);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description?.trim() ? { description: product.description.trim() } : {}),
    ...(photos.length ? { image: photos } : {}),
    category: category.name,
    url,
    offers: { '@type': 'Offer', url, price: Number(product.price), priceCurrency: 'INR' },
  };
}

/** JSON-LD for a <script> tag: escapes '<' so saved text such as </script> cannot end the tag and run code. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
