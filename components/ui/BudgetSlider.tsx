"use client";
import InfiniteSlider from './InfiniteSlider';
import styles from './BudgetSlider.module.css';

const budgetItems = [
    { label: "2BHK – Luxury", price: "₹Starting from 3.5 Lakhs", img: "/v121.mp4" },
    { label: "3BHK – Premium", price: "₹Starting from 4.5 Lakhs", img: "/v122.mp4" },
    { label: "4BHK – Ultra", price: "₹Starting from 6 Lakhs", img: "/i3.jpeg" },
    { label: "Designer Kitchen", price: "₹Starting from 1.5 Lakhs", img: "/i4.jpeg" },
    { label: "Master Bedroom", price: "₹Starting from 1.3 Lakhs", img: "/mater1.jpeg" },
    { label: "Sliding Wardrobe", price: "₹Starting from 1.3 Lakhs", img: "/sliding1.jpeg" },
    { label: "Elegant Living", price: "₹Starting from 1.4 Lakhs", img: "/i7.jpeg" },
    { label: "Modern Bathroom", price: "₹Starting from 70 Thousand", img: "/bath1.jpeg" },
    { label: "Kids Bedroom", price: "₹Starting from 90 Thousand", img: "/i9.jpeg" },
];

// Helper function to detect if file is video or image
const getMediaType = (src: string): 'image' | 'video' => {
    if (src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg')) {
        return 'video';
    }
    return 'image';
};

export default function BudgetSlider() {
    return (
        <InfiniteSlider
            items={budgetItems}
            renderItem={(item) => (
                <div className={styles.card}>
                    <div className={styles.cardImageWrapper}>
                        {getMediaType(item.img) === 'video' ? (
                            <video
                                src={item.img}
                                className={styles.cardImage}
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <img
                                src={item.img}
                                alt={item.label}
                                className={styles.cardImage}
                            />
                        )}
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
