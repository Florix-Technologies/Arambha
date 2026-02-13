"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

const gallerySections = [
  {
    title: "Complete House Interior",
    items: [
      "/i4.jpeg",
      "/i2.jpeg",
      "/v1.mp4",
      "/v7.mp4",
      "/v11.mp4"

    ],
  },
  {
    title: "Kitchen",
    items: [
      "/i4.jpeg",
      "/i2.jpeg",
      "/v1.mp4",
      "/v7.mp4",
      "/v11.mp4"

    ],
  },
  {
    title: "Living Room",
    items: [
      "/i7.jpeg",
      "/i1.jpeg",
      "/v3.mp4",
      "/i8.jpeg",
      "/v4.mp4"

    ],
  },
  {
    title: "Bedroom",
    items: [
      "/i6.jpeg",
      "/i5.jpeg",
      "/v10.mp4",
      "/v2.mp4",
      "/v12.mp4",

    ],
  },
  {
    title: "Wardrobes",
    items: [
      "/i6.jpeg",
      "/i5.jpeg",
      "/v10.mp4",
      "/v2.mp4",
      "/v12.mp4",

    ],
  },
];

export default function GalleryPage() {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

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

      {gallerySections.map((section, index) => (
        <section key={index} className={styles.section}>
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
      ))}

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