"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Category = { id: string; name: string; slug: string };

type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price?: number;
  images?: string[];
};

function InteriorsContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<{
    categoryId: string;
    productId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch categories for interiors collection
        let query = supabase
          .from('categories')
          .select('*')
          .eq('collection', 'interiors');

        if (filter) {
          query = query.eq('slug', filter);
        }

        const { data: cats, error: catsError } = await query;

        if (catsError) throw catsError;
        if (!cats || cats.length === 0) {
          setCategories([]);
          setLoading(false);
          return;
        }

        setCategories(cats);

        // Fetch products for each category
        const prods: Record<string, Product[]> = {};
        for (const cat of cats) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', cat.id);

          if (prodError) throw prodError;
          prods[cat.id] = prodData || [];
        }
        setProductsByCat(prods);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filter]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-cormorant)' }}>
          Loading Interiors...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {filter && categories.length > 0 ? categories[0].name : "Interior Solutions"}
        </h1>
        <p className={styles.subtitle}>Bespoke craft for modern living spaces.</p>
      </header>

      {categories.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No categories found.</p>
          <a href="/interiors" className={styles.contactBtn} style={{ marginTop: '1rem', display: 'inline-block' }}>
            View All Interiors
          </a>
        </div>
      )}

      {categories.map(cat => (
        <section className={styles.section} key={cat.id} id={cat.slug}>
          {!filter && <h2 className={styles.sectionTitle}>{cat.name}</h2>}

          <div className={styles.categoryGrid}>
            {productsByCat[cat.id]?.map(prod => {

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
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      prod.name
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <h3>{prod.name}</h3>
                    <p>{prod.description}</p>

                    <a
                      href={`https://wa.me/919999999999?text=${encodeURIComponent(
                        `Hello, I am interested in buying the following product:%0A%0A` +
                        `Product: ${prod.name}%0A` +
                        `Description: ${prod.description}%0A` +
                        (prod.price ? `Price: ${prod.price}%0A` : "")
                      )}`}
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
                      Place Order
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
              {productsByCat[cat.id]
                ?.find(p => p.id === selectedProduct.productId)
                ?.images?.length ? (
                <div className={styles.expandedImagesGrid}>
                  {productsByCat[cat.id]
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InteriorsContent />
    </Suspense>
  );
}
