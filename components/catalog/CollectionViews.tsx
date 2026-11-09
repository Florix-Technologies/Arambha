import Link from 'next/link';
import type { Catalog, CatalogCategory, Collection, Product } from '@/lib/catalog';
import CatalogMedia from '@/components/ui/CatalogMedia';
import ContactActions from '@/components/ui/ContactActions';
import GalleryGrid from '@/components/catalog/GalleryGrid';
import { productInquiryMessage } from '@/lib/whatsapp';
import { BRAND, COLLECTIONS, categoryPath, mediaAlt, productImage, productMedia, productPath } from '@/lib/seo';
const formatPrice = (price: number) => `₹ ${Number(price).toLocaleString('en-IN')}`;
import styles from '@/components/catalog/Catalog.module.css';
import galleryStyles from '@/app/(site)/gallery/page.module.css';

const HEADINGS: Record<Collection, { title: string; subtitle: string; noun: string }> = {
  interiors: { title: 'Interior Solutions', subtitle: 'Bespoke craft for modern living spaces.', noun: 'designs' },
  furniture: { title: 'Furniture Collection', subtitle: 'Handcrafted pieces that blend form, function, and timeless aesthetics.', noun: 'pieces' },
  gallery: { title: 'Our Work', subtitle: 'Carefully crafted interiors designed for comfort, elegance, and function.', noun: 'photos' },
};

function Breadcrumbs({ trail }: { trail: Array<{ name: string; path?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.crumbs}>
        {trail.map(item => <li key={item.name}>{item.path ? <Link href={item.path}>{item.name}</Link> : item.name}</li>)}
      </ol>
    </nav>
  );
}

function ConsultationBox({ collection, placement }: { collection: Collection; placement: string }) {
  const copy = collection === 'furniture'
    ? { title: 'Looking for something unique?', text: 'We specialize in bespoke custom furniture design tailored to your specific needs.' }
    : { title: 'Interested in our work?', text: 'We provide end-to-end design and execution. Call or message us to book a consultation.' };
  return (
    <div className={styles.inquiryBox}>
      <h2>{copy.title}</h2>
      <p>{copy.text}</p>
      <ContactActions placement={placement} />
    </div>
  );
}

/** First photo of a subcategory, for its card. */
const coverOf = (category: CatalogCategory) => category.products.map(productImage).find(Boolean) ?? null;

/** /interiors, /furniture, /gallery: every subcategory that has products. */
export function CollectionIndex({ collection, catalog }: { collection: Collection; catalog: Catalog }) {
  const { title, subtitle, noun } = HEADINGS[collection];
  const label = COLLECTIONS[collection].label;
  const empty = catalog.length === 0 && (
    <p className={styles.subtitle}>New pieces are on the way. Tell us what you are looking for and we will help.{' '}<Link href="/contact">Get in touch</Link></p>
  );

  if (collection === 'gallery') {
    return (
      <div className={galleryStyles.container}>
        <header className={galleryStyles.header}>
          <h1 className={galleryStyles.title}>{title}</h1>
          <p className={galleryStyles.subtitle}>{subtitle}</p>
          <nav className={galleryStyles.filterBar} aria-label="Gallery categories">
            <Link href="/gallery" className={`${galleryStyles.filterButton} ${galleryStyles.activeFilter}`}>All</Link>
            {catalog.map(cat => <Link key={cat.id} href={categoryPath(collection, cat.slug)} className={galleryStyles.filterButton}>{cat.name}</Link>)}
          </nav>
        </header>
        {empty}
        {catalog.map((cat, ci) => (
          <section key={cat.id} className={galleryStyles.section}>
            <h2 className={galleryStyles.sectionTitle}><Link href={categoryPath(collection, cat.slug)} style={{ color: 'inherit', textDecoration: 'none' }}>{cat.name}</Link></h2>
            <GalleryGrid priorityFirst={ci === 0} items={cat.products.map((p, i) => ({ src: p.image_url, alt: `${cat.name} – ${label} by ${BRAND}, Bangalore, photo ${i + 1}` }))} />
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      {empty}
      <div className={styles.grid}>
        {catalog.map((cat, i) => {
          const cover = coverOf(cat);
          return (
            <Link key={cat.id} href={categoryPath(collection, cat.slug)} className={styles.card}>
              <div className={styles.imageBox}>
                {cover ? <CatalogMedia src={cover} alt={`${cat.name} – ${label} by ${BRAND}, Bangalore`} priority={i === 0} width={800} height={800} /> : cat.name}
              </div>
              <div className={styles.cardContent}>
                <h2>{cat.name}</h2>
                <p>{cat.products.length} {cat.products.length === 1 ? noun.replace(/s$/, '') : noun}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <ConsultationBox collection={collection} placement={`${collection}-index`} />
    </div>
  );
}

/** /{collection}/{categorySlug}: all products of one subcategory. */
export function SubcategoryView({ collection, category, intro }: { collection: Collection; category: CatalogCategory; intro: string }) {
  const label = COLLECTIONS[collection].label;
  const isGallery = collection === 'gallery';
  return (
    <div className={isGallery ? galleryStyles.container : styles.container}>
      <header className={styles.header}>
        <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: label, path: COLLECTIONS[collection].path }, { name: category.name }]} />
        <h1 className={isGallery ? galleryStyles.title : styles.title}>{category.name}</h1>
        <p className={styles.subtitle}>{intro}</p>
      </header>

      {isGallery ? (
        <GalleryGrid priorityFirst items={category.products.map((p, i) => ({ src: p.image_url, alt: `${category.name} – ${label} by ${BRAND}, Bangalore, photo ${i + 1}` }))} />
      ) : (
        <div className={styles.grid}>
          {category.products.map((product, i) => {
            const cover = productImage(product);
            return (
              <Link key={product.id} href={productPath(collection, category.slug, product)} className={styles.card}>
                <div className={styles.imageBox}>
                  {cover ? <CatalogMedia src={cover} alt={mediaAlt(collection, category, product, 0)} priority={i === 0} width={800} height={800} /> : product.name}
                </div>
                <div className={styles.cardContent}>
                  <h2>{product.name}</h2>
                  {product.description && <p>{product.description.length > 140 ? `${product.description.slice(0, 137)}…` : product.description}</p>}
                  {product.price != null && Number(product.price) > 0 && <p className={styles.price}>{formatPrice(product.price)}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <p className={styles.back}>
        <Link href={COLLECTIONS[collection].path}>All {label.toLowerCase()}</Link>
      </p>
      <ConsultationBox collection={collection} placement={`${collection}-${category.slug}`} />
    </div>
  );
}

/** /{collection}/{categorySlug}/{name}-{id}: one product with all its media. */
export function ProductView({ collection, category, product }: { collection: Collection; category: { name: string; slug: string }; product: Product }) {
  const label = COLLECTIONS[collection].label;
  const media = productMedia(product);
  const message = productInquiryMessage(`Hello, I am interested in the following ${label.toLowerCase()} product:`, { ...product, image_url: null });
  return (
    <div className={`${styles.container} ${styles.productPage}`}>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: label, path: COLLECTIONS[collection].path }, { name: category.name, path: categoryPath(collection, category.slug) }, { name: product.name }]} />
      <div className={styles.product}>
        <div className={styles.media}>
          {media.map((src, i) => (
            <div key={`${src}-${i}`} className={styles.mediaItem}>
              <CatalogMedia src={src} alt={mediaAlt(collection, category, product, i)} controls priority={i === 0} width={800} height={600} />
            </div>
          ))}
        </div>
        <div className={styles.info}>
          <h1>{product.name}</h1>
          {product.price != null && Number(product.price) > 0 && <p className={styles.price}>{formatPrice(product.price)}</p>}
          {product.description && <p>{product.description}</p>}
          <ContactActions message={message} placement={`${collection}-product`} />
          <div className={styles.productLinks}>
            <Link href={categoryPath(collection, category.slug)}>More {category.name}</Link>
            <Link href={COLLECTIONS[collection].path}>All {label.toLowerCase()}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
