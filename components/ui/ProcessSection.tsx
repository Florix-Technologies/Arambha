"use client";

import { motion } from 'framer-motion';
import styles from './ProcessSection.module.css';

const steps = [
    {
        number: "01",
        title: "Discovery & Intent",
        description: "We begin with a deep exploration of your life's rhythm. This isn't just a meeting; it's the foundation where your aspirations meet our architectural expertise.",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000"
    },
    {
        number: "02",
        title: "The Creative Blueprint",
        description: "Our studio transforms abstract ideas into tangible concepts. We curate materials, textures, and spatial hierarchies to define the soul of your space.",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000"
    },
    {
        number: "03",
        title: "Architectural Precision",
        description: "Precision in every millimeter. Our technical team engineers custom joinery and lighting systems that are as high-performing as they are beautiful.",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000"
    },
    {
        number: "04",
        title: "The Masterful Reveal",
        description: "Experience the transition from vision to reality. We orchestrate every detail of the installation, ensuring a flawless and emotional handover of your new home.",
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000"
    }
];

export default function ProcessSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.span
                        className={styles.subtitle}
                        initial={{ opacity: 0, letterSpacing: "20px" }}
                        whileInView={{ opacity: 1, letterSpacing: "4px" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                    >
                        The Journey
                    </motion.span>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Crafting Perfection
                    </motion.h2>
                </div>

                <div className={styles.canvas}>
                    {steps.map((step, index) => (
                        <div key={index} className={styles.panel}>
                            <img
                                src={step.image}
                                alt={step.title}
                                className={styles.bgImage}
                            />
                            <div className={styles.overlay} />

                            <div className={styles.verticalTitle}>
                                {step.title}
                            </div>

                            <div className={styles.content}>
                                <span className={styles.number}>{step.number}</span>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <div className={styles.descriptionBox}>
                                    <p className={styles.description}>{step.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
