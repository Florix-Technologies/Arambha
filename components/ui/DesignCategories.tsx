"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DesignCategories.module.css';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    title: string;
    images: string[];
}

interface DesignCategoriesProps {
    categories: Category[];
}

const CategoryCard = ({
    category,
    isHovered,
    onMouseEnter,
    onMouseLeave
}: {
    category: Category;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Clean title
    const cleanTitle = category.title.replace(/^\d+\.\s*/, '');

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % category.images.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + category.images.length) % category.images.length);
    };

    return (
        <div
            className={`${styles.categoryCard} ${isHovered ? styles.cardHovered : ''}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={styles.imageContainer}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={category.images[currentIndex]}
                        alt={`${cleanTitle} ${currentIndex + 1}`}
                        className={styles.categoryImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                </AnimatePresence>

                {/* Title Overlay moves on hover */}
                <div className={`${styles.titleOverlay} ${isHovered ? styles.titleLeftBottom : styles.titleCenter}`}>
                    <h3 className={styles.overlayTitle}>{cleanTitle}</h3>
                </div>

                <div className={styles.navControls}>
                    <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevSlide} aria-label="Previous image">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextSlide} aria-label="Next image">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                <div className={styles.pagination}>
                    {category.images.map((_, idx) => (
                        <span
                            key={idx}
                            className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function DesignCategories({ categories }: DesignCategoriesProps) {
    const router = useRouter();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handleGetQuote = () => {
        router.push('/contact');
    };

    // Get dynamic grid class based on which card is hovered
    const getGridClass = () => {
        if (hoveredIndex === null) return '';
        return styles[`hoverGrid${hoveredIndex}`];
    };

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <motion.span
                            className={styles.subtitle}
                            initial={{ opacity: 0, letterSpacing: "20px" }}
                            whileInView={{ opacity: 1, letterSpacing: "4px" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                        >
                            The Categories
                        </motion.span>
                        <motion.h2
                            className={styles.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            Explore our wide Range of Design Categories
                        </motion.h2>
                    </div>
                    <div className={styles.headerAction}>
                        <Button variant="primary" className={styles.quoteBtn} onClick={handleGetQuote}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={styles.phoneIcon}>
                                <path d="M6.62 10.79c1.44 2.82 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                            Get A Quote
                        </Button>
                    </div>
                </div>

                <div className={`${styles.squareGrid} ${getGridClass()}`}>
                    {categories.slice(0, 4).map((category, idx) => (
                        <CategoryCard
                            key={idx}
                            category={category}
                            isHovered={hoveredIndex === idx}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
