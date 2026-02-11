"use client";

import { useState } from "react";
import styles from "./page.module.css";

type MediaItem = {
  type: "image" | "video";
  src: string;
};

function Carousel({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className={styles.carouselWrapper}>
      <button className={styles.arrowLeft} onClick={prev}>
        &#10094;
      </button>

      <div className={styles.carouselContainer}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.mediaBox}>
                {item.type === "image" ? (
                  <img src={item.src} alt="" />
                ) : (
                  <video src={item.src} controls />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          {items.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === index ? styles.activeDot : ""
                }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <button className={styles.arrowRight} onClick={next}>
        &#10095;
      </button>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className={styles.container}>
      {/* KEEPING YOUR ORIGINAL HEADER */}
      <h1>Our Services</h1>
      <p>This is a skeleton page for Our Services. Add your content here.</p>

      {/* ================= SECTION 1 ================= */}
      <section className={styles.section}>
        <h2>Complete Interior Solutions</h2>

        <div className={styles.subSection}>
          <h3>Modular House Interiors</h3>
          <Carousel
            items={[
              { type: "image", src: "/images/modular1.jpg" },
              { type: "image", src: "/images/modular2.jpg" },
              { type: "video", src: "/videos/modular.mp4" },
            ]}
          />
        </div>

        <div className={styles.subSection}>
          <h3>Hybrid Manual Interiors</h3>
          <Carousel
            items={[
              { type: "image", src: "/images/hybrid1.jpg" },
              { type: "image", src: "/images/hybrid2.jpg" },
              { type: "video", src: "/videos/hybrid.mp4" },
            ]}
          />
        </div>
      </section>

      {/* ================= SECTION 2 ================= */}
      <section className={styles.section}>
        <h2>Modular Solutions</h2>

        <div className={styles.subSection}>
          <h3>Kitchen</h3>
          <Carousel
            items={[
              { type: "image", src: "/images/kitchen1.jpg" },
              { type: "image", src: "/images/kitchen2.jpg" },
            ]}
          />
        </div>

        <div className={styles.subSection}>
          <h3>Wardrobe</h3>
          <Carousel
            items={[
              { type: "image", src: "/images/wardrobe1.jpg" },
              { type: "image", src: "/images/wardrobe2.jpg" },
            ]}
          />
        </div>
      </section>

      {/* ================= SECTION 3 ================= */}
      <section className={styles.section}>
        <h2>Interior Finishing</h2>

        {[
          "Civil Works",
          "Lighting",
          "Flooring",
          "False Ceiling",
          "Wall Design",
          "Painting",
        ].map((title) => (
          <div key={title} className={styles.subSection}>
            <h3>{title}</h3>
            <Carousel
              items={[
                { type: "image", src: "/images/sample1.jpg" },
                { type: "image", src: "/images/sample2.jpg" },
              ]}
            />
          </div>
        ))}
      </section>

      {/* ================= SECTION 4 ================= */}
      <section className={styles.section}>
        <h2>Furniture & Partition System</h2>

        {[
          "Furniture",
          "Office & Commercial Furniture",
          "Aluminum Interiors & Partitions",
        ].map((title) => (
          <div key={title} className={styles.subSection}>
            <h3>{title}</h3>
            <Carousel
              items={[
                { type: "image", src: "/images/sample1.jpg" },
                { type: "image", src: "/images/sample2.jpg" },
              ]}
            />
          </div>
        ))}
      </section>
    </div>
  );
}