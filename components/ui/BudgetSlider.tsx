"use client";
import InfiniteSlider from './InfiniteSlider';
import styles from './BudgetSlider.module.css';

const budgetItems = [
    { label: "2BHK – Luxury", img: "/i1.jpeg" },
    { label: "3BHK – Premium", img: "/i2.jpeg" },
    { label: "4BHK – Ultra", img: "/i3.jpeg" },
    { label: "Designer Kitchen", img: "/i4.jpeg" },
    { label: "Master Bedroom", img: "/i5.jpeg" },
    { label: "Sliding Wardrobe", img: "/i6.jpeg" },
    { label: "Elegant Living", img: "/i7.jpeg" },
    { label: "Modern Bathroom", img: "/i8.jpeg" },
    { label: "Kids Bedroom", img: "/i9.jpeg" },
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
