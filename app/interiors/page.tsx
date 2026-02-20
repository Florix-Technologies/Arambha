"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
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
  const router = useRouter();
  const filter = searchParams.get('filter') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<{
    categoryId: string;
    productId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch categories for interiors collection
        const { data: fullCatsList, error: listError } = await supabase
          .from('categories')
          .select('*')
          .eq('collection', 'interiors')
          .order('name', { ascending: true });

        if (listError) throw listError;

        // Group all categories by name for the filter dropdown
        const fullCategoryMap: Record<string, { name: string; slug: string; ids: string[] }> = {};
        fullCatsList?.forEach((cat: Category) => {
          const key = cat.name.toLowerCase().trim();
          if (!fullCategoryMap[key]) {
            fullCategoryMap[key] = { name: cat.name, slug: cat.slug, ids: [] };
          }
          fullCategoryMap[key].ids.push(cat.id);
        });
        setAllCategories(Object.values(fullCategoryMap) as any);

        let query = supabase
          .from('categories')
          .select('*')
          .eq('collection', 'interiors');

        if (filter !== 'all') {
          query = query.eq('slug', filter);
        }

        const { data: allCats, error: catsError } = await query;
        if (catsError) throw catsError;

        if (!allCats || allCats.length === 0) {
          setCategories([]);
          setProductsByCat({});
          setLoading(false);
          return;
        }

        // Group categories by name
        const categoryMap: Record<string, { name: string; slug: string; ids: string[] }> = {};
        allCats.forEach((cat: Category) => {
          const key = cat.name.toLowerCase().trim();
          if (!categoryMap[key]) {
            categoryMap[key] = { name: cat.name, slug: cat.slug, ids: [] };
          }
          categoryMap[key].ids.push(cat.id);
        });

        const uniqueCats = Object.values(categoryMap);
        setCategories(uniqueCats as any);

        // Fetch products for each unique category group
        const prods: Record<string, Product[]> = {};
        for (const catGroup of uniqueCats) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .in('category_id', catGroup.ids);

          if (prodError) throw prodError;
          prods[catGroup.slug] = prodData || [];
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

  // Handle body scroll locking
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingPulse}></div>
        <p>Refining Your View...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {filter !== 'all' && categories.length > 0 ? categories[0].name : "Interior Solutions"}
        </h1>
        <p className={styles.subtitle}>Bespoke craft for modern living spaces.</p>
      </header>

      {/* Premium Dropdown Filter */}
      <div className={styles.filterWrapper}>
        <div className={styles.dropdownContainer}>
          <button
            className={`${styles.dropdownTrigger} ${isFilterOpen ? styles.active : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <span>
              {filter === 'all'
                ? 'All Collections'
                : (allCategories.find(c => c.slug === filter)?.name || filter)}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isFilterOpen ? styles.rotate : ''}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                className={styles.dropdownMenu}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div
                  className={`${styles.dropdownItem} ${filter === 'all' ? styles.selected : ''}`}
                  onClick={() => {
                    router.push('/interiors');
                    setIsFilterOpen(false);
                  }}
                >
                  All Collections
                  {filter === 'all' && <span className={styles.dot}></span>}
                </div>

                {allCategories.map((cat) => (
                  <div
                    key={cat.slug}
                    className={`${styles.dropdownItem} ${filter === cat.slug ? styles.selected : ''}`}
                    onClick={() => {
                      router.push(`/interiors?filter=${cat.slug}`);
                      setIsFilterOpen(false);
                    }}
                  >
                    {cat.name}
                    {filter === cat.slug && <span className={styles.dot}></span>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {categories.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No categories found.</p>
          <a href="/interiors" className={styles.contactBtn} style={{ marginTop: '1rem', display: 'inline-block' }}>
            View All Interiors
          </a>
        </div>
      )}

      {categories.map(cat => (
        <section className={styles.section} key={cat.slug} id={cat.slug}>
          {filter === 'all' && <h2 className={styles.sectionTitle}>{cat.name}</h2>}

          {/* Check if category has products */}
          {productsByCat[cat.slug]?.length === 0 || !productsByCat[cat.slug] ? (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.emptyStateBlur}></div>
              <div className={styles.emptyStateContent}>
                <div className={styles.emptyStateIconContainer}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <div className={styles.iconPulse}></div>
                </div>
                <h3>Coming Soon to {cat.name}</h3>
                <p>We are currently curating a boutique selection of {cat.name.toLowerCase()} projects. Our craft takes time to perfect.</p>
                <div className={styles.emptyActions}>
                  <button onClick={() => router.push('/interiors')} className={styles.secondaryBtn}>
                    Explore All Collections
                  </button>
                  <a href="/contact" className={styles.primaryBtn}>
                    Request Custom Quote
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={styles.categoryGrid}>
              {productsByCat[cat.slug]?.map(prod => {

                const isSelected =
                  selectedProduct?.categoryId === cat.slug &&
                  selectedProduct?.productId === prod.id;

                return (
                  <motion.div
                    className={styles.card}
                    key={prod.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    onClick={() =>
                      setSelectedProduct({
                        categoryId: cat.slug,
                        productId: prod.id,
                      })
                    }
                    style={{
                      border: isSelected
                        ? "2px solid var(--color-accent)"
                        : undefined,
                    }}
                  >
                    <div
                      className={styles.imagePlaceholder}
                      onClick={() => setSelectedImage(prod.image_url)}
                    >
                      {prod.image_url ? (
                        <motion.img
                          layoutId={`img-int-${prod.id}`}
                          src={prod.image_url}
                          alt={prod.name}
                        />
                      ) : (
                        <div className={styles.noImage}>{prod.name}</div>
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
                        className={styles.orderButton}
                      >
                        Place Order
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ✅ IMAGE EXPANSION BELOW CATEGORY */}
          {selectedProduct?.categoryId === cat.slug && (
            <div className={styles.expandedImagesSection}>
              <h4>Product Gallery</h4>
              {productsByCat[cat.slug]
                ?.find(p => p.id === selectedProduct.productId)
                ?.images?.length ? (
                <div className={styles.expandedImagesGrid}>
                  {productsByCat[cat.slug]
                    ?.find(p => p.id === selectedProduct.productId)
                    ?.images?.map((img, i) => (
                      <div key={i} className={styles.expandedImageItem}>
                        <img
                          src={img}
                          alt="Product"
                          onClick={() => setSelectedImage(img)}
                          style={{ cursor: 'zoom-in' }}
                        />
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          )}
        </section>
      ))}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.lightbox}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{
                scale: 0.8,
                opacity: 0,
                rotateX: 10,
                rotateY: -15,
                perspective: 1200
              }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateX: 0,
                rotateY: 0,
                perspective: 1200
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                rotateX: -10,
                rotateY: 15
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 24
              }}
            >
              <img
                src={selectedImage}
                alt="Fullscreen View"
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 60px 120px rgba(0,0,0,0.5)'
                }}
              />
              <button className={styles.closeLightbox}>&times;</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
