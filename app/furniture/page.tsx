"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

type Category = { id: string; name: string; slug: string };
type Product = { id: string; name: string; description: string; image_url: string; price?: number };

function FurnitureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get('filter') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch categories for furniture collection
        const { data: fullCatsList, error: listError } = await supabase
          .from('categories')
          .select('*')
          .eq('collection', 'furniture')
          .order('name', { ascending: true });

        if (listError) throw listError;

        // Group all categories for the dropdown
        const fullCategoryMap: Record<string, { name: string; slug: string; ids: string[] }> = {};
        fullCatsList?.forEach(cat => {
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
          .eq('collection', 'furniture');

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

        // Group categories by name to handle duplicates
        const categoryMap: Record<string, { name: string; slug: string; ids: string[] }> = {};
        allCats.forEach(cat => {
          const key = cat.name.toLowerCase().trim();
          if (!categoryMap[key]) {
            categoryMap[key] = { name: cat.name, slug: cat.slug, ids: [] };
          }
          categoryMap[key].ids.push(cat.id);
        });

        const uniqueCats = Object.values(categoryMap);
        setCategories(uniqueCats as any);

        // Fetch products for all IDs in each unique category group
        const prods: Record<string, Product[]> = {};
        for (const catGroup of uniqueCats) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .in('category_id', catGroup.ids);

          if (prodError) throw prodError;
          // Use the first ID (or the slug) as the key for compatibility with existing render logic
          // But here we use catGroup.slug to be more consistent
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
        <p>Curating Elegance...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {filter !== 'all' && categories.length > 0 ? categories[0].name : "Furniture Collection"}
        </h1>
        <p className={styles.subtitle}>Handcrafted pieces that blend form, function, and timeless aesthetics.</p>
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
                ? 'All Furniture'
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
                    router.push('/furniture');
                    setIsFilterOpen(false);
                  }}
                >
                  All Furniture
                  {filter === 'all' && <span className={styles.dot}></span>}
                </div>

                {allCategories.map((cat) => (
                  <div
                    key={cat.slug}
                    className={`${styles.dropdownItem} ${filter === cat.slug ? styles.selected : ''}`}
                    onClick={() => {
                      router.push(`/furniture?filter=${cat.slug}`);
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
      <div className={styles.categories}>
        {categories.length === 0 && !loading && (
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
                  <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
                  <path d="M2 7h20"></path>
                  <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path>
                </svg>
                <div className={styles.iconPulse}></div>
              </div>
              <h3>Furniture Collections Loading</h3>
              <p>We're currently refreshing our showroom with new handcrafted designs. Please check back shortly.</p>
              <div className={styles.emptyActions}>
                <a href="/furniture" className={styles.primaryBtn}>
                  Refresh Page
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {categories.map(cat => (
          <section key={cat.slug} className={styles.categorySection} id={cat.slug}>
            {filter === 'all' && <h2 className={styles.categoryTitle}>{cat.name}</h2>}

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
                  <h3>Updates in Progress</h3>
                  <p>Our {cat.name.toLowerCase()} gallery is currently being curated with new high-resolution images. Stay tuned for the reveal.</p>
                  <div className={styles.emptyActions}>
                    <button onClick={() => router.push('/furniture')} className={styles.secondaryBtn}>
                      Browse Other Designs
                    </button>
                    <a href="/contact" className={styles.primaryBtn}>
                      Custom Requirements
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className={styles.grid}>
                {productsByCat[cat.slug]?.map(prod => (
                  <motion.div
                    key={prod.id}
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <div
                      className={styles.imagePlaceholder}
                      onClick={() => setSelectedImage(prod.image_url)}
                    >
                      {prod.image_url ? (
                        <motion.img
                          layoutId={`img-${prod.id}`}
                          src={prod.image_url}
                          alt={prod.name}
                        />
                      ) : (
                        <div className={styles.noImage}>{prod.name}</div>
                      )}
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
                        className={styles.orderButton}
                      >
                        Place Order
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

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
                rotateX: 15,
                rotateY: -10,
                perspective: 1000
              }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateX: 0,
                rotateY: 0,
                perspective: 1000
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                rotateX: -15,
                rotateY: 10
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25
              }}
            >
              <motion.img
                layoutId={`img-${Object.values(productsByCat).flat().find(p => p.image_url === selectedImage)?.id}`}
                src={selectedImage}
                alt="Fullscreen View"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
                }}
              />
              <button className={styles.closeLightbox}>&times;</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.customSection}>
        <h2>Looking for something unique?</h2>
        <p>We specialize in bespoke custom furniture design tailored to your specific needs.</p>
        <a href="/contact" className={styles.inquireLink}>Request Custom Design</a>
      </div>
    </div>
  );
}

export default function FurniturePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FurnitureContent />
    </Suspense>
  );
}
