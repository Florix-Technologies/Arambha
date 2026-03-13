"use client";
import { useEffect, useState } from 'react';
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

export default function InteriorsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<{
    categoryId: string;
    productId: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories for interiors collection
        const { data: cats, error: catsError } = await supabase
          .from('categories')
          .select('*')
          .eq('collection', 'interiors');

        if (catsError) throw catsError;
        if (!cats) return;

        // Fetch products for each category
        const prods: Record<string, Product[]> = {};
        for (const cat of cats) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('id, name, description, image_url, price, category_id, images')
            .eq('category_id', cat.id);

          if (prodError) throw prodError;
          prods[cat.id] = prodData || [];
        }

        // Remove only the empty "Aluminion interior" and "Wooden Interior" categories
        const excludeNames = ['aluminion interior', 'wooden interior'];
        const filteredCats = cats.filter(cat => {
          const isEmpty = !prods[cat.id]?.length;
          const isExcluded = excludeNames.includes(cat.name.toLowerCase());
          return !(isEmpty && isExcluded);
        });

        setCategories(filteredCats);
        setProductsByCat(prods);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Interior Solutions</h1>
        <p className={styles.subtitle}>Bespoke craft for modern living spaces.</p>
      </header>

      {categories.map(cat => (
        <section className={styles.section} key={cat.id}>
          <h2 className={styles.sectionTitle}>{cat.name}</h2>

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

                    <a
                      href={`https://api.whatsapp.com/send?phone=9187628243&text=${encodeURIComponent(
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
