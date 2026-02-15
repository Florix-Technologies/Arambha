"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

type MediaItem = {
  type: "image" | "video";
  src: string;
};

function MediaGrid({ items }: { items: MediaItem[] }) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"image" | "video" | null>(null);

  const openLightbox = (src: string, type: "image" | "video") => {
    setSelectedMedia(src);
    setSelectedType(type);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    setSelectedType(null);
  };

  // Close modal on Escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
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

  return (
    <>
      <div className={styles.gridContainer}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            className={styles.gridCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onClick={() => openLightbox(item.src, item.type)}
          >
            <div className={styles.mediaBox}>
              {item.type === "image" ? (
                <img src={item.src} alt={`Service ${i + 1}`} />
              ) : (
                <video src={item.src} muted loop playsInline />
              )}
              <div className={styles.overlay}>
                <span className={styles.viewIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
              {selectedType === "image" ? (
                <img
                  src={selectedMedia}
                  alt="Enlarged view"
                  className={styles.lightboxMedia}
                />
              ) : (
                <video
                  src={selectedMedia}
                  autoPlay
                  loop
                  controls
                  className={styles.lightboxMedia}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { Suspense } from "react";

function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get("filter") || "all";
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sections = [
    {
      id: "modular-house",
      category: "Complete Interior Solutions",
      title: "Modular House Interiors",
      items: [
        { type: "image", src: "/images/modular1.jpg" },
        { type: "image", src: "/images/modular2.jpg" },
        { type: "video", src: "/videos/modular.mp4" },
        { type: "video", src: "/videos/modular.mp4" },
      ] as MediaItem[]
    },
    {
      id: "hybrid-manual",
      category: "Complete Interior Solutions",
      title: "Hybrid Manual Interiors",
      items: [
        { type: "image", src: "/images/hybrid1.jpg" },
        { type: "image", src: "/images/hybrid2.jpg" },
        { type: "video", src: "/videos/hybrid.mp4" },
      ] as MediaItem[]
    },
    {
      id: "kitchen",
      category: "Modular Solutions",
      title: "Kitchen",
      items: [
        { type: "image", src: "/images/kitchen1.jpg" },
        { type: "image", src: "/images/kitchen2.jpg" },
      ] as MediaItem[]
    },
    {
      id: "wardrobe",
      category: "Modular Solutions",
      title: "Wardrobe",
      items: [
        { type: "image", src: "/images/wardrobe1.jpg" },
        { type: "image", src: "/images/wardrobe2.jpg" },
      ] as MediaItem[]
    },
    { id: "civil-works", category: "Interior Finishing", title: "Civil Works", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "lighting", category: "Interior Finishing", title: "Lighting", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "flooring", category: "Interior Finishing", title: "Flooring", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "false-ceiling", category: "Interior Finishing", title: "False Ceiling", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "wall-design", category: "Interior Finishing", title: "Wall Design", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "painting", category: "Interior Finishing", title: "Painting", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "furniture", category: "Furniture & Partition System", title: "Furniture", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "office-furniture", category: "Furniture & Partition System", title: "Office & Commercial Furniture", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
    { id: "aluminum-interiors", category: "Furniture & Partition System", title: "Aluminum Interiors & Partitions", items: [{ type: "image", src: "/images/sample1.jpg" }, { type: "image", src: "/images/sample2.jpg" }] as MediaItem[] },
  ];

  // Get unique categories for filtering
  const allCategories = Array.from(new Set(sections.map(s => s.category)));

  const filteredSections = filter && filter !== "all"
    ? sections.filter(s => s.id === filter || s.category === filter)
    : sections;

  // Group by category for display
  const displayCategories = Array.from(new Set(filteredSections.map(s => s.category)));

  const activeCategory = filter;

  return (
    <div className={styles.container}>
      <h1>{filter && filter !== "all" ? (sections.find(s => s.id === filter)?.title || filter) : "Our Services"}</h1>
      <p>
        {"Explore our wide range of interior and furniture solutions tailored for your needs."}
      </p>

      {/* Premium Grouped Dropdown Filter */}
      <div className={styles.filterWrapper}>
        <div className={styles.dropdownContainer}>
          <button
            className={`${styles.dropdownTrigger} ${isFilterOpen ? styles.active : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <span>
              {filter === 'all'
                ? 'All Services'
                : (sections.find(s => s.id === filter)?.title || filter)}
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
                    router.push('/services');
                    setIsFilterOpen(false);
                  }}
                >
                  All Services
                  {filter === 'all' && <span className={styles.dot}></span>}
                </div>

                {allCategories.map((cat) => (
                  <div key={cat} className={styles.dropdownGroup}>
                    <div className={styles.groupLabel}>{cat}</div>
                    <div
                      className={`${styles.dropdownItem} ${filter === cat ? styles.selected : ''}`}
                      onClick={() => {
                        router.push(`/services?filter=${encodeURIComponent(cat)}`);
                        setIsFilterOpen(false);
                      }}
                    >
                      All {cat}
                      {filter === cat && <span className={styles.dot}></span>}
                    </div>
                    {sections
                      .filter(s => s.category === cat)
                      .map(service => (
                        <div
                          key={service.id}
                          className={`${styles.dropdownItem} ${filter === service.id ? styles.selected : ''}`}
                          onClick={() => {
                            router.push(`/services?filter=${service.id}`);
                            setIsFilterOpen(false);
                          }}
                        >
                          {service.title}
                          {filter === service.id && <span className={styles.dot}></span>}
                        </div>
                      ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {displayCategories.map((catName) => (
        <section key={catName} className={styles.section}>
          {(filter === 'all' || allCategories.includes(filter)) && <h2>{catName}</h2>}
          {filteredSections
            .filter(s => s.category === catName)
            .map((subSection) => (
              <div key={subSection.id} className={styles.subSection}>
                {(filter === 'all' || filter === catName || filter === subSection.id) && <h3>{subSection.title}</h3>}
                <MediaGrid items={subSection.items} />
              </div>
            ))}
        </section>
      ))}

      {filteredSections.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p>No services found matching the criteria.</p>
          <a href="/services" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>View all services</a>
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-cormorant)' }}>
          Loading Services...
        </p>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}