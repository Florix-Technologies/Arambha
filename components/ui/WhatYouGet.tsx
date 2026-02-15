"use client";

import styles from './WhatYouGet.module.css';

const deliverables = [
    {
        title: "Living/Dining Room",
        description: "TV Unit, TV Back Panelling, Crockery Unit, Bar Unit, Bookshelf",
        icon: (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="45" height="45" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="10" y="60" width="45" height="30" fill="var(--color-accent)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="20" y="25" width="25" height="15" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="10" y1="20" x2="55" y2="20" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="25" y1="10" x2="25" y2="90" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <circle cx="17" cy="15" r="1.5" fill="var(--color-text-primary)" />
            </svg>
        )
    },
    {
        title: "Bedroom",
        description: "Wardrobes, TV Unit, Bed with Storage, Dressing Unit, Study Unit",
        icon: (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="20" height="5" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="40" y="10" width="15" height="5" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="10" y="45" width="50" height="35" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="15" y="55" width="18" height="10" fill="var(--color-accent)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="37" y="55" width="18" height="10" fill="var(--color-accent)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <path d="M10 65 L60 65 L60 85 L10 85 Z" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="10" y1="75" x2="60" y2="75" stroke="var(--color-text-primary)" strokeWidth="1.5" />
            </svg>
        )
    },
    {
        title: "Kitchen",
        description: "Countertops, Backsplashes, Accessories, Shutters, Storage",
        icon: (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 15 L65 15 L75 30 L25 30 Z" fill="var(--color-accent)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="25" y="45" width="50" height="40" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="28" y="55" width="44" height="25" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="43" y1="65" x2="40" y2="75" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="57" y1="65" x2="60" y2="75" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <circle cx="35" cy="50" r="1.5" fill="var(--color-text-primary)" />
                <circle cx="45" cy="50" r="1.5" fill="var(--color-text-primary)" />
                <circle cx="55" cy="50" r="1.5" fill="var(--color-text-primary)" />
                <circle cx="65" cy="50" r="1.5" fill="var(--color-text-primary)" />
            </svg>
        )
    },
    {
        title: "Innovative Storage",
        description: "Janitor Unit, Skirting Drawer, Pantry Pull Out, Appliance Garage, Hidden Bar Cabinet, Magic Corner",
        icon: (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="50" width="50" height="40" fill="var(--color-accent)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="20" y1="70" x2="70" y2="70" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="40" y1="60" x2="50" y2="60" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="40" y1="80" x2="50" y2="80" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="50" y="30" width="10" height="15" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="50" y1="35" x2="60" y2="35" stroke="var(--color-text-primary)" />
                <line x1="50" y1="40" x2="60" y2="40" stroke="var(--color-text-primary)" />
            </svg>
        )
    },
    {
        title: "Interior Design Services",
        description: "False Ceiling, Wall Panelling, Decor Accents, Lighting, Furnishing, Appliances",
        icon: (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="40" width="15" height="50" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <circle cx="17.5" cy="45" r="5" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="35" y="65" width="40" height="25" fill="var(--color-accent)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="40" y="65" width="30" height="5" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <line x1="35" y1="75" x2="75" y2="75" stroke="var(--color-text-primary)" strokeWidth="1.5" />
            </svg>
        )
    },
    {
        title: "Home Improvement Services",
        description: "Painting, Bathroom Remodelling, Tiling, Plumbing, Electrical, Civil Work, Deep Cleaning",
        icon: (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 70 L80 70 C80 85 70 90 50 90 C30 90 20 85 20 70 Z" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="20" y="70" width="60" height="5" fill="var(--color-accent)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <path d="M25 55 V70 M35 55 V70 M25 55 C25 50 35 50 35 55" stroke="var(--color-text-primary)" strokeWidth="1.5" />
                <rect x="55" y="55" width="20" height="10" fill="white" stroke="var(--color-text-primary)" strokeWidth="1.5" />
            </svg>
        )
    }
];

export default function WhatYouGet() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>What You Get</h2>
                </div>

                <div className={styles.grid}>
                    {deliverables.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.illustration}>
                                {item.icon}
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.description}>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
