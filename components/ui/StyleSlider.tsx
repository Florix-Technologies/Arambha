"use client";
import InfiniteSlider from './InfiniteSlider';
import styles from './BudgetSlider.module.css';

interface StyleSliderProps {
    items: string[];
}

export default function StyleSlider({ items }: StyleSliderProps) {
    return (
        <InfiniteSlider
            items={items}
            renderItem={(src, idx) => (
                <div className={styles.card}>
                    <div className={styles.cardImageWrapper}>
                        <img
                            src={src}
                            alt={`Style item ${idx + 1}`}
                            className={styles.cardImage}
                        />
                    </div>
                </div>
            )}
        />
    );
}
