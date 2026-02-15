"use client";

import { motion } from 'framer-motion';
import styles from './CTASection.module.css';

export default function CTASection() {
    return (
        <section
            className={styles.section}
            style={{
                backgroundImage: 'url(https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1920)'
            }}
        >
            <div className={styles.overlay} />

            <div className={styles.decorativeElements}>
                <motion.div
                    className={`${styles.circle} ${styles.circle1}`}
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className={`${styles.circle} ${styles.circle2}`}
                    animate={{
                        scale: [1, 1.15, 1],
                        rotate: [360, 180, 0]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            <div className={styles.container}>
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Ready To Design Your Dream Home?
                    </motion.h2>

                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Book A Free Design Consultation With Our Expert Designers
                    </motion.p>

                    <motion.button
                        className={styles.ctaButton}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Book Now
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
