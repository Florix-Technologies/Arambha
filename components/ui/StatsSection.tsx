"use client";

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import styles from './StatsSection.module.css';

const StatCounter = ({ value, label, suffix = "+" }: { value: number, label: string, suffix?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const numberRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (numberRef.current) {
                numberRef.current.innerText = Math.round(latest).toLocaleString();
            }
        });
        return () => unsubscribe();
    }, [springValue]);

    return (
        <motion.div
            ref={containerRef}
            className={styles.statCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            <div className={styles.iconDecor}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                </svg>
            </div>

            <div className={styles.numberWrapper}>
                <span className={styles.number}>
                    <span ref={numberRef}>0</span>
                    <span className={styles.suffix}>{suffix}</span>
                </span>
            </div>
            <span className={styles.label}>{label}</span>

            {/* Decorative Line */}
            <motion.div
                className={styles.line}
                initial={{ width: 0 }}
                whileInView={{ width: "40px" }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ height: '2px', background: 'var(--color-accent)', margin: '1.5rem auto 0' }}
            />
        </motion.div>
    );
};

export default function StatsSection() {
    return (
        <section className={styles.section}>
            <div className={styles.shape + ' ' + styles.shape1} />
            <div className={styles.shape + ' ' + styles.shape2} />

            <div className={styles.container}>
                <StatCounter value={1050} label="Finished Projects" />
                <StatCounter value={1000} label="Premium Designs" />
                <StatCounter value={1050} label="Happy Clients" />
            </div>
        </section>
    );
}
