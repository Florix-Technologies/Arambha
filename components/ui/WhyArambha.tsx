"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import styles from './WhyArambha.module.css';

const tabs = [
    {
        id: 'personalized',
        label: 'Personalised for You',
        image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1000',
        content: [
            "Customizing your furniture is the first step to having a home that mirrors your way of being in its entirety. Furthermore, creating personalized spaces doesn't have to be expensive. Creating a customized home will make your spaces your own, reflecting your personality while maintaining your style.",
            "We create a balanced and consistent environment, where you feel your personality in the furniture layout, how the lighting fixtures are arranged, and your chosen furniture style. We love to borrow from the creativity around us, but nothing beats your instincts for the final say on your space's look. After all, how you live reflects who you are!"
        ]
    },
    {
        id: 'quality',
        label: 'Quality Guaranteed',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1000',
        content: [
            "At Arambha, quality is not just a promise—it's our foundation. Every piece of furniture, every material, and every finish is carefully selected to meet the highest standards of craftsmanship and durability.",
            "We work with premium materials and trusted suppliers to ensure that your investment stands the test of time. Our rigorous quality control process means that every detail is inspected before it reaches your home, guaranteeing excellence in every corner of your space."
        ]
    },
    {
        id: 'management',
        label: 'Project Management from A to Z',
        image: 'https://images.pexels.com/photos/7031706/pexels-photo-7031706.jpeg?auto=compress&cs=tinysrgb&w=1000',
        content: [
            "From the initial consultation to the final installation, we handle every aspect of your interior design project with precision and care. Our comprehensive project management approach ensures seamless coordination between design, procurement, and execution.",
            "You'll have a dedicated project manager who keeps you informed at every stage, manages timelines, coordinates with vendors, and ensures that your vision is realized exactly as planned. We take the stress out of home transformation, so you can focus on the excitement of your new space."
        ]
    },
    {
        id: 'delivery',
        label: 'On-time Delivery',
        image: 'https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg?auto=compress&cs=tinysrgb&w=1000',
        content: [
            "We understand that your time is valuable. That's why we commit to delivering your project on schedule, without compromising on quality. Our efficient planning and execution processes ensure that deadlines are met consistently.",
            "With transparent timelines, regular updates, and a team dedicated to keeping your project on track, you can trust that your dream home will be ready when promised. Punctuality and reliability are at the core of our service commitment."
        ]
    }
];

export default function WhyArambha() {
    const [activeTab, setActiveTab] = useState(0);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        const activeTabElement = tabRefs.current[activeTab];
        if (activeTabElement) {
            setIndicatorStyle({
                left: activeTabElement.offsetLeft,
                width: activeTabElement.offsetWidth
            });
        }
    }, [activeTab]);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        Why Arambha Creations
                    </motion.h2>

                    <div className={styles.tabsWrapper}>
                        <div className={styles.tabs}>
                            {tabs.map((tab, index) => (
                                <button
                                    key={tab.id}
                                    ref={(el) => { tabRefs.current[index] = el; }}
                                    className={`${styles.tab} ${activeTab === index ? styles.tabActive : ''}`}
                                    onClick={() => setActiveTab(index)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                            <motion.div
                                className={styles.tabIndicator}
                                animate={indicatorStyle}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.contentWrapper}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            className={styles.content}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.imageWrapper}>
                                <img
                                    src={tabs[activeTab].image}
                                    alt={tabs[activeTab].label}
                                    className={styles.image}
                                />
                            </div>

                            <div className={styles.textContent}>
                                {tabs[activeTab].content.map((paragraph, idx) => (
                                    <motion.p
                                        key={idx}
                                        className={styles.description}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    >
                                        {paragraph}
                                    </motion.p>
                                ))}

                                <motion.button
                                    className={styles.ctaButton}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Personalise Your Design
                                </motion.button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
