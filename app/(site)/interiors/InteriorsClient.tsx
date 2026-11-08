"use client";
import { useState } from 'react';
import Link from 'next/link';
import { filterCatalog, type Catalog } from '@/lib/catalog';
import { InteriorsItemCard } from '@/components/catalog/ItemCard';
import CatalogMedia from '@/components/ui/CatalogMedia';
import styles from './page.module.css';

export default function InteriorsClient({ catalog, filter }: { catalog: Catalog; filter?: string }) {
  const categories = filterCatalog(catalog, filter);
  const [selectedProduct, setSelectedProduct] = useState<{
    categoryId: string;
    productId: string;
  } | null>(null);


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Interior Solutions</h1>
        <p className={styles.subtitle}>Bespoke craft for modern living spaces.</p>
      </header>
      {categories.length === 0 && (
        <p className={styles.subtitle}>
          New pieces are on the way. Tell us what you are looking for and we will help.{' '}<Link href="/contact">Get in touch</Link>{' '}
          {filter && filter !== 'all' && <Link href="/interiors">View all interiors</Link>}
        </p>
      )}

      {categories.map(cat => (
        <section className={styles.section} key={cat.id}>
          <h2 className={styles.sectionTitle}>{cat.name}</h2>

          <div className={styles.categoryGrid}>
            {cat.products?.map(prod => (
              <InteriorsItemCard
                key={prod.id}
                item={prod}
                selected={selectedProduct?.categoryId === cat.id && selectedProduct?.productId === prod.id}
                onOpen={() => setSelectedProduct({ categoryId: cat.id, productId: prod.id })}
              />
            ))}
          </div>

          {/* ✅ IMAGE EXPANSION BELOW CATEGORY */}
          {selectedProduct?.categoryId === cat.id && (
            <div className={styles.expandedImagesSection}>
              <h4>Product Gallery</h4>
              {cat.products
                ?.find(p => p.id === selectedProduct.productId)
                ?.images?.length ? (
                <div className={styles.expandedImagesGrid}>
                  {cat.products
                    ?.find(p => p.id === selectedProduct.productId)
                    ?.images?.map((img, i) => (
                      <div key={i} className={styles.expandedImageItem}>
                        <CatalogMedia
                          src={img}
                          alt="Product"
                          controls
                        />
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          )}
        </section>
      ))}

      <div className={styles.inquiryBox}>
        <h3>Interested in our Interior solutions?</h3>
        <p>We provide end-to-end design and execution.</p>
        <a href="/contact" className={styles.contactBtn}>
          Get in Touch
        </a>
      </div>
    </div>
  );
}
