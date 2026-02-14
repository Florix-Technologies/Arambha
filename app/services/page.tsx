"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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

import { Suspense } from "react";

function ServicesContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

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

  const filteredSections = filter
    ? sections.filter(s => s.id === filter)
    : sections;

  // Group by category for display
  const categories = Array.from(new Set(filteredSections.map(s => s.category)));

  return (
    <div className={styles.container}>
      <h1>{filter ? filteredSections[0]?.title : "Our Services"}</h1>
      <p>
        {filter
          ? `Showing ${filteredSections[0]?.title} solutions from our ${filteredSections[0]?.category} collection.`
          : "Explore our wide range of interior and furniture solutions tailored for your needs."}
      </p>

      {categories.map((catName) => (
        <section key={catName} className={styles.section}>
          {!filter && <h2>{catName}</h2>}
          {filteredSections
            .filter(s => s.category === catName)
            .map((subSection) => (
              <div key={subSection.id} className={styles.subSection}>
                {!filter && <h3>{subSection.title}</h3>}
                <Carousel items={subSection.items} />
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