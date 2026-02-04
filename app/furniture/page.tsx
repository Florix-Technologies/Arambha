"use client";
import { useEffect, useState } from 'react';
import styles from './page.module.css';

type Category = { category_id: string; name: string; description: string };
type Product = { product_id: string; name: string; description: string; imageUrl: string; price: number };

export default function FurniturePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({});

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  useEffect(() => {
    fetch(`${API_BASE}/furniture/categories`)
      .then(res => res.json())
      .then(async (cats: Category[]) => {
        setCategories(cats);
        // Fetch products for each category
        const prods: Record<string, Product[]> = {};
        for (const cat of cats) {
          const resp = await fetch(`${API_BASE}/furniture/categories/${cat.category_id}/products`);
          prods[cat.category_id] = await resp.json();
        }
        setProductsByCat(prods);
      });
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Furniture Collection</h1>
        <p className={styles.subtitle}>Handcrafted pieces that blend form, function, and timeless aesthetics.</p>
      </header>
      <div className={styles.categories}>
        {categories.map(cat => (
          <section key={cat.category_id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat.name}</h2>
            <div className={styles.grid}>
              {productsByCat[cat.category_id]?.map(prod => (
                <div key={prod.product_id} className={styles.card}>
                  <div className={styles.imagePlaceholder}>
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        `Image: ${prod.imageUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: '0.75rem',
                        padding: '0.5rem 1.2rem',
                        background: '#25D366',
                        color: '#fff',
                        borderRadius: '0.5rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                        fontSize: '1rem',
                      }}
                    >
                      Place Order on WhatsApp
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
