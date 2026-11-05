"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchCatalog, filterCatalog, type Catalog } from '@/lib/catalog';
import styles from "./page.module.css";

import { Suspense } from "react";

function GalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get("filter") || "all";
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Catalog>([]);
  const [loading, setLoading] = useState(true);
  const allCategories = catalog;
  const gallerySections = filterCatalog(catalog, filter).map(category => ({
    id: category.id,
    title: category.name,
    items: category.products.map(product => product.image_url),
  }));

  useEffect(() => {
    fetchCatalog('gallery')
      .then(setCatalog)
      .catch(error => console.error('Error fetching gallery data:', error))
      .finally(() => setLoading(false));
  }, []);

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

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
            onClick={() => router.push('/gallery')}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterButton} ${filter === cat.slug ? styles.activeFilter : ''}`}
              onClick={() => router.push(`/gallery?filter=${cat.slug}`)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingPulse}></div>
          <p>Capturing Perfection...</p>
        </div>
      ) : gallerySections.length === 0 ? (
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
            <h3>Gallery Under Curation</h3>
            <p>We&apos;re currently selecting our finest captures to showcase here. Every project tells a story of elegance and precision.</p>
            <div className={styles.emptyActions}>
              <button onClick={() => router.push('/gallery')} className={styles.secondaryBtn}>
                Reset Filter
              </button>
              <a href="/contact" className={styles.primaryBtn}>
                Start Your Project
              </a>
            </div>
          </div>
        </motion.div>
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
                  onClick={() => src && openLightbox(src)}
                  style={{ cursor: src ? "pointer" : "default" }}
                >
                  {src && src.endsWith(".mp4") ? (
                    <video
                      src={src}
                      muted
                      loop
                      playsInline
                      className={styles.media}
                      onMouseEnter={handleVideoMouseEnter}
                      onMouseLeave={handleVideoMouseLeave}
                    />
                  ) : src ? (
                    <img
                      src={src}
                      alt={`${section.title} ${i + 1}`}
                      className={styles.media}
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <span>{section.title} {i + 1}</span>
                    </div>
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