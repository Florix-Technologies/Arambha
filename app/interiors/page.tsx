"use client";
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchCatalog, filterCatalog, type Catalog } from '@/lib/catalog';
import { productInquiryMessage, whatsappUrl } from '@/lib/whatsapp';
import styles from './page.module.css';

function InteriorsContent() {
  const filter = useSearchParams().get('filter');
  const [catalog, setCatalog] = useState<Catalog>([]);
  const [loading, setLoading] = useState(true);
  const categories = filterCatalog(catalog, filter);
  const [selectedProduct, setSelectedProduct] = useState<{
    categoryId: string;
    productId: string;
  } | null>(null);

  useEffect(() => {
    fetchCatalog('interiors')
      .then(setCatalog)
      .catch(error => console.error('Error fetching interiors:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Interior Solutions</h1>
        <p className={styles.subtitle}>Bespoke craft for modern living spaces.</p>
      </header>
      {!loading && categories.length === 0 && (
        <p className={styles.subtitle}>
          No interiors available.{' '}
          {filter && filter !== 'all' && <Link href="/interiors">View all interiors</Link>}
        </p>
      )}

      {categories.map(cat => (
        <section className={styles.section} key={cat.id}>
          <h2 className={styles.sectionTitle}>{cat.name}</h2>

          <div className={styles.categoryGrid}>
            {cat.products?.map(prod => {

              const isSelected =
                selectedProduct?.categoryId === cat.id &&
                selectedProduct?.productId === prod.id;

              return (
                <div
                  className={styles.card}
                  key={prod.id}
                  onClick={() =>
                    setSelectedProduct({
                      categoryId: cat.id,
                      productId: prod.id,
                    })
                  }
                  style={{
                    cursor: "pointer",
                    border: isSelected
                      ? "2px solid var(--color-accent)"
                      : undefined,
                  }}
                >
                  <div className={styles.imagePlaceholder}>
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      prod.name
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <h3>{prod.name}</h3>
                    <p>{prod.description}</p>
                    {prod.price != null && (
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-accent)', marginTop: '0.5rem' }}>
                        ₹ {prod.price.toLocaleString('en-IN')}
                      </p>
                    )}

                    <a
                      href={whatsappUrl(productInquiryMessage('Hello, I am interested in buying the following product:', {
                        name: prod.name,
                        description: prod.description,
                        price: prod.price,
                      }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "0.75rem",
                        padding: "0.5rem 1.2rem",
                        background: "var(--color-text-secondary)",
                        color: "#fff",
                        borderRadius: "0.5rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        fontSize: "1rem",
                      }}
                    >
                      Place Order on WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
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
                        <img
                          src={img}
                          alt="Product"
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

export default function InteriorsPage() {
  return <Suspense fallback={null}><InteriorsContent /></Suspense>;
}
