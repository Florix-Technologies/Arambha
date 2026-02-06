"use client";

import { motion } from "framer-motion";
import styles from "./page.module.css";

const gallerySections = [
  {
    title: "Kitchen",
    items: [
      "/i1.jpeg",
      "/i2.jpeg",
      "/v1.mp4",
      "/i7.jpeg",
      "/v2.mp4"
      
    ],
  },
  {
    title: "Living Room",
    items: [
      "/v2.mp4",
      "/i4.jpeg",
      "/i5.jpeg",
      "/i6.jpeg",
      "/v7.mp4"
      
    ],
  },
  {
    title: "Bedroom",
    items: [
      "/i7.jpeg",
      "/v3.mp4",
      "/i8.jpeg",
      "/i3.jpeg",
      "/v4.mp4",
      
    ],
  },
];

export default function GalleryPage() {
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
              >
                {src.endsWith(".mp4") ? (
                  <video
                    src={src}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className={styles.media}
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
    </div>
  );
}
