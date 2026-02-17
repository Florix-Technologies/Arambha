"use client";
import InfiniteSlider from './InfiniteSlider';
import styles from './BudgetSlider.module.css';

const budgetItems = [
    { label: "2BHK – Luxury", price: "₹Starting from 3.5 Lakhs", img: "/i1.jpeg" },
    { label: "3BHK – Premium", price: "₹Starting from 4.5 Lakhs", img: "/i2.jpeg" },
    { label: "4BHK – Ultra", price: "₹Starting from 6 Lakhs", img: "/i3.jpeg" },
    { label: "Designer Kitchen", price: "₹Starting from 1.5 Lakhs", img: "/i4.jpeg" },
    { label: "Master Bedroom", price: "₹Starting from 1.3 Lakhs", img: "/i5.jpeg" },
    { label: "Sliding Wardrobe", price: "₹Starting from 1.3 Lakhs", img: "/i6.jpeg" },
    { label: "Elegant Living", price: "₹Starting from 1.4 Lakhs", img: "/i7.jpeg" },
    { label: "Modern Bathroom", price: "₹Starting from 70 Thousand", img: "/i8.jpeg" },
    { label: "Kids Bedroom", price: "₹Starting from 90 Thousand", img: "/i9.jpeg" },
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
                        <p className={styles.cardPrice}>{item.price}</p>
                    </div>
                </div>
            )}
        />
    );
}
