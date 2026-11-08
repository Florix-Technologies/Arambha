import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCatalog } from '@/lib/catalog';
import { fetchSubcategory } from '@/lib/catalogPages';
import { BRAND, COLLECTIONS, breadcrumbJsonLd, categoryPath, isCollection, subcategoryMeta, serializeJsonLd } from '@/lib/seo';
import { SubcategoryView } from '@/components/catalog/CollectionViews';

export const revalidate = 3600;

// Subcategories that exist now are built ahead; anything added later is rendered on first visit and then cached.
export async function generateStaticParams() {
  const collections = ['interiors', 'furniture', 'gallery'] as const;
  const catalogs = await Promise.all(collections.map(c => fetchCatalog(c).catch(() => [])));
  return collections.flatMap((collection, i) => catalogs[i].map(category => ({ collection, category: category.slug })));
}

type Params = Promise<{ collection: string; category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { collection, category } = await params;
  if (!isCollection(collection)) return {};
  const page = await fetchSubcategory(collection, category);
  return page ? subcategoryMeta(collection, { ...page.category, ...page.seo }, page.category.products) : {};
}

export default async function SubcategoryPage({ params }: { params: Params }) {
  const { collection, category: slug } = await params;
  if (!isCollection(collection)) notFound();
  const page = await fetchSubcategory(collection, slug);
  if (!page) notFound();
  const { category } = page;
  const meta = subcategoryMeta(collection, { ...category, ...page.seo }, category.products);
  const trail = [{ name: 'Home', path: '/' }, { name: COLLECTIONS[collection].label, path: COLLECTIONS[collection].path }, { name: category.name, path: categoryPath(collection, category.slug) }];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd(trail)) }} />
      <SubcategoryView collection={collection} category={category} intro={String(meta.description ?? BRAND)} />
    </>
  );
}
