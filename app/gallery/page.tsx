"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from '@/lib/supabase';
import styles from "./page.module.css";

type Category = { id: string; name: string; slug: string };
type Product = { id: string; name: string; description: string; image_url: string };

import { Suspense } from "react";

function GalleryContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [gallerySections, setGallerySections] = useState<Array<{ id: string; title: string; items: string[] }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch gallery data from Supabase
  useEffect(() => {
    async function fetchGalleryData() {
      try {
        setLoading(true);

        // Fetch categories for gallery collection
        let query = supabase
          .from('categories')
          .select('*')
          .eq('collection', 'gallery')
          .order('created_at', { ascending: true });

        // If a filter is present, try to match it against slug or name
        if (filter) {
          // Note: In Supabase, you might want to use .or() or just .eq('slug', filter)
          // For now, let's assume 'slug' exists or matching by name as a fallback
          query = query.eq('slug', filter);
        }

        const { data: cats, error: catsError } = await query;

        if (catsError) throw catsError;

        // If filtering returned nothing, try matching loosely or just show everything if no filter
        let finalCats = cats || [];
        if (filter && finalCats.length === 0) {
          // Fallback: search by name loosely if slug filter failed
          const { data: fallbackCats } = await supabase
            .from('categories')
            .select('*')
            .eq('collection', 'gallery')
            .ilike('name', `%${filter.replace('-', ' ')}%`);
          if (fallbackCats) finalCats = fallbackCats;
        }

        if (finalCats.length === 0 && !filter) return;

        // Fetch products for each category
        const sections = [];
        for (const cat of finalCats) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', cat.id)
            .order('created_at', { ascending: true });

          if (prodError) throw prodError;

          const items = (prodData || []).map((prod: Product) => prod.image_url);
          sections.push({
            id: cat.id,
            title: cat.name,
            items
          });
        }

        setGallerySections(sections);
      } catch (error) {
        console.error('Error fetching gallery data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryData();
  }, [filter]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMedia(null);
      }
    };

    if (selectedMedia) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [selectedMedia]);

  // Helper to handle video play/pause on hover
  const handleVideoMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.play();
  };
  const handleVideoMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    e.currentTarget.currentTime = 0;
  };

  const openLightbox = (src: string) => {
    setSelectedMedia(src);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Our Work</h1>
        <p className={styles.subtitle}>
          Carefully crafted interiors designed for comfort, elegance, and function.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>Loading gallery...</p>
        </div>
      ) : (
        gallerySections.map((section) => (
          <section key={section.id} className={styles.section}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={styles.sectionTitle}
            >
              {section.title}
            </motion.h2>

            <motion.div
              className={styles.grid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
            >
              {section.items.map((src, i) => (
                <motion.div
                  key={i}
                  className={styles.card}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  transition={{ duration: 0.4 }}
                  onClick={() => openLightbox(src)}
                  style={{ cursor: "pointer" }}
                >
                  {src.endsWith(".mp4") ? (
                    <video
                      src={src}
                      muted
                      loop
                      playsInline
                      className={styles.media}
                      onMouseEnter={handleVideoMouseEnter}
                      onMouseLeave={handleVideoMouseLeave}
                    />
                  ) : (
                    <img
                      src={src}
                      alt={`${section.title} ${i + 1}`}
                      className={styles.media}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </section>
        ))
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              aria-label="Close lightbox"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.endsWith(".mp4") ? (
                <video
                  src={selectedMedia}
                  autoPlay
                  loop
                  controls
                  className={styles.lightboxMedia}
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Enlarged view"
                  className={styles.lightboxMedia}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-cormorant)' }}>
          Loading Gallery...
        </p>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}