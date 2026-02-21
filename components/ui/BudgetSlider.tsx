"use client";
import InfiniteSlider from './InfiniteSlider';
import styles from './BudgetSlider.module.css';

const budgetItems = [
    { label: "2BHK – Luxury", price: "₹Starting from 3.5 Lakhs", img: "/v121.mp4" },
    { label: "3BHK – Premium", price: "₹Starting from 4.5 Lakhs", img: "/v122.mp4" },
    { label: "4BHK – Ultra", price: "₹Starting from 6 Lakhs", img: "/4bhkh.mp4" },
    { label: "Designer Kitchen", price: "₹Starting from 1.5 Lakhs", img: "/kitchen.mp4" },
    { label: "Master Bedroom", price: "₹Starting from 1.3 Lakhs", img: "/master bedroom.mp4" },
    { label: "Sliding Wardrobe", price: "₹Starting from 1.3 Lakhs", img: "/Wardrobe.mp4" },
    { label: "Elegant Living", price: "₹Starting from 1.4 Lakhs", img: "/livingR.mp4" },
    { label: "Modern Bathroom", price: "₹Starting from 70 Thousand", img: "/BR.mp4" },
    { label: "Kids Bedroom", price: "₹Starting from 90 Thousand", img: "/KB.mp4" },
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
