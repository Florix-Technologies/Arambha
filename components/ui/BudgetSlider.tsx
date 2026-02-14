"use client";
import InfiniteSlider from './InfiniteSlider';
import styles from './BudgetSlider.module.css';

const budgetItems = [
    { label: "2BHK – Price ?", img: "/placeholder.jpg" },
    { label: "3BHK – Price ?", img: "/placeholder.jpg" },
    { label: "4BHK – Price ?", img: "/placeholder.jpg" },
    { label: "Kitchen", img: "/placeholder.jpg" },
    { label: "Bedroom – Sliding", img: "/placeholder.jpg" },
    { label: "Bedroom – Swing Door", img: "/placeholder.jpg" },
    { label: "Living", img: "/placeholder.jpg" },
    { label: "Modern Kitchen", img: "/placeholder.jpg" },
    { label: "Luxury Wardrobe", img: "/placeholder.jpg" },
];

export default function BudgetSlider() {
    return (
        <InfiniteSlider
            items={budgetItems}
            renderItem={(item) => (
                <div className={styles.card}>
                    <div className={styles.cardImageWrapper}>
                        <img
                            src={item.img}
                            alt={item.label}
                            className={styles.cardImage}
                        />
                    </div>
                    <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{item.label}</h3>
                    </div>
                </div>
            )}
        />
    );
}
