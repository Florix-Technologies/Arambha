"use client";
import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import styles from './BudgetSlider.module.css';

// Reusable slider for both Budget and Style sections
interface GenericSliderProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
}

export default function InfiniteSlider({ items, renderItem }: GenericSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(items.length); // Start at the middle set
    const [itemsToShow, setItemsToShow] = useState(3);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const controls = useAnimation();

    const totalItems = items.length;
    // Create a tripled list for seamless looping: [Set1][Set2][Set3]
    const tripledItems = [...items, ...items, ...items];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsToShow(1);
            } else if (window.innerWidth < 1024) {
                setItemsToShow(2);
            } else {
                setItemsToShow(3);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getTranslation = (index: number) => {
        const gapInRem = 2; // matches gap: 2rem in CSS
        // Each item width = (100% - total_gap) / itemsToShow
        // Translation = index * (item_width + gap)
        return `calc(-${index} * ( (100% - ${(itemsToShow - 1) * gapInRem}rem) / ${itemsToShow} + ${gapInRem}rem ))`;
    };

    const slide = async (direction: 'next' | 'prev') => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        const step = itemsToShow;
        const newIndex = direction === 'next' ? currentIndex + step : currentIndex - step;

        // Animate to the new index
        await controls.start({
            x: getTranslation(newIndex),
            transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 }
        });

        // Seamless loop check:
        // If we've moved into the third set or first set, jump back to the middle set silently
        let resetIndex = newIndex;
        if (newIndex >= totalItems * 2) {
            resetIndex = newIndex - totalItems;
        } else if (newIndex < totalItems) {
            resetIndex = newIndex + totalItems;
        }

        if (resetIndex !== newIndex) {
            // Jump without animation
            await controls.set({ x: getTranslation(resetIndex) });
            setCurrentIndex(resetIndex);
        } else {
            setCurrentIndex(newIndex);
        }

        setIsTransitioning(false);
    };

    return (
        <div className={styles.sliderContainer}>
            <button className={styles.navButton} onClick={() => slide('prev')} aria-label="Previous">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <div className={styles.sliderTrack}>
                <motion.div
                    className={styles.cardsTrack}
                    animate={controls}
                    initial={{ x: getTranslation(items.length) }}
                >
                    {tripledItems.map((item, idx) => (
                        <div
                            key={`${idx}`}
                            className={styles.cardWrapper}
                            style={{ flex: `0 0 calc((100% - (${(itemsToShow - 1)} * 2rem)) / ${itemsToShow})` }}
                        >
                            {renderItem(item, idx % totalItems)}
                        </div>
                    ))}
                </motion.div>
            </div>

            <button className={styles.navButton} onClick={() => slide('next')} aria-label="Next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    );
}
