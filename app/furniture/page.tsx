"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Category = { id: string; name: string; slug: string };
type Product = { id: string; name: string; description: string; image_url: string; price?: number };

export default function FurniturePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories for furniture collection
        const { data: cats, error: catsError } = await supabase
          .from('categories')
          .select('*')
          .eq('collection', 'furniture');

        if (catsError) throw catsError;
        if (!cats) return;

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
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Furniture Collection</h1>
        <p className={styles.subtitle}>Handcrafted pieces that blend form, function, and timeless aesthetics.</p>
      </header>
      <div className={styles.categories}>
        {categories.map(cat => (
          <section key={cat.id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat.name}</h2>
            <div className={styles.grid}>
              {productsByCat[cat.id]?.map(prod => (
                <div key={prod.id} className={styles.card}>
                  <div className={styles.imagePlaceholder}>
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : prod.name}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.productName}>{prod.name}</h3>
                    <p className={styles.productDesc}>{prod.description}</p>
                    <a
                      href={`https://wa.me/919999999999?text=${encodeURIComponent(
                        `Hello, I am interested in buying the following product from your Furniture collection:%0A%0A` +
                        `Product: ${prod.name}%0ADescription: ${prod.description}%0A` +
                        (prod.price ? `Price: ${prod.price}%0A` : '') +
                        `Image: ${prod.image_url}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: '0.75rem',
                        padding: '0.5rem 1.2rem',
                        background: 'var(--color-text-secondary)',
                        color: '#fff',
                        borderRadius: '0.5rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                        fontSize: '1rem',
                      }}
                    >
                      Place Order
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className={styles.customSection}>
        <h2>Looking for something unique?</h2>
        <p>We specialize in bespoke custom furniture design tailored to your specific needs.</p>
        <a href="/contact" className={styles.inquireLink}>Request Custom Design</a>
      </div>
    </div>
  );
}
