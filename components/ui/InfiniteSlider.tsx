"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import styles from './BudgetSlider.module.css';

interface GenericSliderProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
}

export default function InfiniteSlider({ items, renderItem }: GenericSliderProps) {
    const totalItems = items.length;
    const [itemsToShow, setItemsToShow] = useState(3);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const controls = useAnimation();

    // Use a ref to track the "virtual" index so we don't have to wait for state updates
    // We use 6x items to provide a massive runway for seamless looping
    const indexRef = useRef(totalItems * 3);
    const [currentIndex, setCurrentIndex] = useState(indexRef.current);

    const duplicatedItems = [...items, ...items, ...items, ...items, ...items, ...items];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsToShow(1);
            else if (window.innerWidth < 1024) setItemsToShow(2);
            else setItemsToShow(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getTranslation = useCallback((index: number) => {
        const gapInRem = 2; // matches gap in CSS
        // ItemWidth = (100% - total_gap) / itemsToShow
        // FullStep = ItemWidth + Gap
        return `calc(-${index} * ( (100% - ${(itemsToShow - 1) * gapInRem}rem) / ${itemsToShow} + ${gapInRem}rem ))`;
    }, [itemsToShow]);

    // Initial placement and sync when itemsToShow changes
    useEffect(() => {
        controls.set({ x: getTranslation(indexRef.current) });
    }, [itemsToShow, getTranslation, controls]);

    const slide = async (direction: 'next' | 'prev') => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        // Moving by 1 card provides the most consistent "forward" feel
        const step = 1;
        const targetIndex = direction === 'next' ? indexRef.current + step : indexRef.current - step;

        // 1. Animate to the target index (this is the visible motion)
        await controls.start({
            x: getTranslation(targetIndex),
            transition: {
                type: "spring",
                stiffness: 120, // Snappy but smooth
                damping: 20,
                mass: 1
            }
        });

        // 2. Perform silent jump if we're drifting too far into the buffer sets
        // We stay within indices [totalItems*2, totalItems*4]
        let resetIndex = targetIndex;
        if (targetIndex >= totalItems * 4) {
            resetIndex = targetIndex - totalItems;
        } else if (targetIndex < totalItems * 2) {
            resetIndex = targetIndex + totalItems;
        }

        if (resetIndex !== targetIndex) {
            // The jump is invisible because duplicatedItems[resetIndex] === duplicatedItems[targetIndex]
            await controls.set({ x: getTranslation(resetIndex) });
        }

        indexRef.current = resetIndex;
        setCurrentIndex(resetIndex);
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
                    initial={{ x: getTranslation(indexRef.current) }}
                >
                    {duplicatedItems.map((item, idx) => (
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
