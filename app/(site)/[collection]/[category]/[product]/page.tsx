import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { fetchProductByPrefix } from '@/lib/catalogPages';
import { COLLECTIONS, breadcrumbJsonLd, categoryPath, isCollection, productJsonLd, productMeta, productPath } from '@/lib/seo';
import { ProductView } from '@/components/catalog/CollectionViews';

export const revalidate = 3600;

// Product pages are rendered on first visit, then cached and refreshed hourly (or when the admin saves).
export function generateStaticParams() {
  return [];
}

type Params = Promise<{ collection: string; category: string; product: string }>;

// Only interiors and furniture have detail pages; the 8 hex characters at the end of the URL identify the product.
const idPrefix = (segment: string) => segment.match(/(?:^|-)([0-9a-f]{8})$/)?.[1] ?? null;

async function load({ collection, product: segment }: Awaited<Params>) {
  const prefix = idPrefix(segment);
  if (!isCollection(collection) || collection === 'gallery' || !prefix) return null;
  const found = await fetchProductByPrefix(prefix);
  if (!found || (found.category.collection !== 'interiors' && found.category.collection !== 'furniture')) return null;
  return found;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await load(await params);
  return found ? productMeta(found.category.collection as 'interiors' | 'furniture', found.category, found.product) : {};
}

export default async function ProductPage({ params }: { params: Params }) {
  const resolved = await params;
  const found = await load(resolved);
  if (!found) notFound();
  const collection = found.category.collection as 'interiors' | 'furniture';
  const canonical = productPath(collection, found.category.slug, found.product);
  // Renamed or moved items keep working: old links redirect permanently to the current address.
  if (`/${resolved.collection}/${resolved.category}/${resolved.product}` !== canonical) permanentRedirect(canonical);

  const trail = [
    { name: 'Home', path: '/' },
    { name: COLLECTIONS[collection].label, path: COLLECTIONS[collection].path },
    { name: found.category.name, path: categoryPath(collection, found.category.slug) },
    { name: found.product.name, path: canonical },
  ];
  const product = productJsonLd(collection, found.category, found.product);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(trail)) }} />
      {product && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />}
      <ProductView collection={collection} category={found.category} product={found.product} />
    </>
  );
}
