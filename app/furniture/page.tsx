"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Category = { id: string; name: string; slug: string };
type Product = { id: string; name: string; description: string; image_url: string; price?: number };

export default function FurniturePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

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
            .select('id, name, description, image_url, price, category_id, images')
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
                <div 
                  key={prod.id} 
                  className={styles.card}
                  onClick={() => setSelectedProduct(prod)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.imagePlaceholder}>
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : prod.name}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.productName}>{prod.name}</h3>
                    <p className={styles.productDesc}>{prod.description}</p>
                    {prod.price && (
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-accent)', marginTop: '0.5rem' }}>
                        ₹ {prod.price.toLocaleString('en-IN')}
                      </p>
                    )}
                    <a
                      href={`https://api.whatsapp.com/send?phone=9187628243&text=${encodeURIComponent(
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              display: 'flex',
              maxWidth: '900px',
              width: '100%',
              height: '500px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Left Side - Image */}
            <div 
              style={{
                flex: 1,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                borderRadius: '8px 0 0 8px',
                cursor: 'pointer',
              }}
              onClick={() => setFullscreenImage(selectedProduct.image_url)}
            >
              {selectedProduct.image_url ? (
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <span style={{ color: '#999', fontSize: '1rem' }}>No image available</span>
              )}
            </div>

            {/* Right Side - Content */}
            <div 
              style={{
                flex: 1,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflowY: 'auto',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', color: 'var(--color-text)' }}>
                    {selectedProduct.name}
                  </h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#999',
                      padding: '0',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {selectedProduct.description}
                </p>

                {selectedProduct.price && (
                  <p style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    marginBottom: '1.5rem',
                  }}>
                    ₹ {selectedProduct.price.toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              {/* WhatsApp Button */}
              <a
                href={`https://api.whatsapp.com/send?phone=9187628243&text=${encodeURIComponent(
                  `Hello, I am interested in buying the following product from your Furniture collection:%0A%0A` +
                  `Product: ${selectedProduct.name}%0ADescription: ${selectedProduct.description}%0A` +
                  (selectedProduct.price ? `Price: ${selectedProduct.price}%0A` : '') +
                  `Image: ${selectedProduct.image_url}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--color-text-secondary)',
                  color: '#fff',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '1rem',
                  textAlign: 'center',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#555')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-text-secondary)')}
              >
                Place Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen view"
            style={{
              width: '90vw',
              height: '90vh',
              objectFit: 'contain',
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setFullscreenImage(null)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
