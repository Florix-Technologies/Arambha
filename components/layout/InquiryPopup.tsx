"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./InquiryPopup.module.css";

const Popup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

    useEffect(() => {
        let firstTimer: NodeJS.Timeout;
        let repeatTimer: NodeJS.Timeout;

        // First popup after 8 seconds (slightly faster than 10s to engage sooner)
        if (!hasOpenedOnce) {
            firstTimer = setTimeout(() => {
                setIsOpen(true);
                setHasOpenedOnce(true);
            }, 40000);
        }

        // After first time → repeat every 30 sec (28s interval + wait time)
        if (hasOpenedOnce) {
            repeatTimer = setInterval(() => {
                setIsOpen(true);
            }, 80000);
        }

        return () => {
            clearTimeout(firstTimer);
            clearInterval(repeatTimer);
        };
    }, [hasOpenedOnce]);

    // Prevent scroll when popup is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const whatsappNumber = "919876543210"; // Using the number from contact page
    const whatsappMessage = "Hi, I am interested in interior design services from Arambha.";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)} // Close on background click
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className={styles.closeButton}
                            aria-label="Close popup"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Left Image Section */}
                        <div className={styles.imageSection}>
                            <img
                                src="/i1.jpeg" // Using an existing interior image
                                alt="Beautiful Interior"
                                className={styles.image}
                            />
                        </div>

                        {/* Right Content Section */}
                        <div className={styles.contentSection}>
                            <h2 className={styles.title}>
                                Dream Interiors Await!
                            </h2>

                            <p className={styles.description}>
                                Get a free consultation and customized quote for your dream home. Let's build something beautiful together.
                            </p>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.ctaButton}
                            >
                                WhatsApp Now
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Popup;