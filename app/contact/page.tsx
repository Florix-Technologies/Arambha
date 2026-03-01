"use client";
import { motion, Variants } from 'framer-motion';
import { useState } from 'react';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const whatsappNumber = '9187628243';
    const message = `Hi Arambha,

I would like to request a consultation.

*Full Name:* ${formData.fullName}
*Email:* ${formData.email}
*Subject:* ${formData.subject}
*Message:* ${formData.message}

Please get back to me at your earliest convenience.

Thank you!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <main className={styles.main}>
      {/* Immersive Video Background */}
      <div className={styles.videoWrapper}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.backgroundVideo}
        >
          <source src="/v5.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay}></div>
      </div>

      <div className={styles.container}>
        <motion.div
          className={styles.contentWrapper}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Centered Heading */}
          <div className={styles.centeredHeader}>
            <motion.div variants={itemVariants}>
              <h1 className={styles.title}>Let&apos;s Create Something <br /><span>Extraordinary</span></h1>
              <p className={styles.subtitle}>
                From bespoke furniture to complete home transformations, we are here to bring your vision to life.
              </p>
            </motion.div>
          </div>

          {/* Left Side: Detail Cards */}
          <div className={styles.infoSection}>
            <div className={styles.contactDetails}>
              <motion.div className={styles.detailCard} variants={itemVariants}>
                <div className={styles.iconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div>
                  <h3>Studio Headquarters</h3>
                  <p>123 Design Avenue, Indiranagar<br />Bangalore, KA 560038</p>
                </div>
              </motion.div>

              <motion.div className={styles.detailCard} variants={itemVariants}>
                <div className={styles.iconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                </div>
                <div>
                  <h3>Direct Inquiry</h3>
                  <p>+91 91876 28243</p>
                  <p>concierge@arambha.com</p>
                </div>
              </motion.div>

              <motion.div className={styles.detailCard} variants={itemVariants}>
                <div className={styles.iconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <div>
                  <h3>Opening Hours</h3>
                  <p>Mon - Sat: 10:00 AM - 7:00 PM</p>
                  <p>Sunday: By Appointment</p>
                </div>
              </motion.div>
            </div>

            <motion.div className={styles.mapWrapper} variants={itemVariants}>
              <iframe
                className={styles.mapFrame}
                src="https://maps.google.com/maps?q=Florix%20Technologies%20Bangalore&output=embed"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>

          {/* Right Side: Form */}
          <motion.div className={styles.formSection} variants={itemVariants}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2>Send a Message</h2>
                <p>Tell us about your project and we&apos;ll get back to you within 24 hours.</p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="Interior Design Consultation">Interior Design Consultation</option>
                    <option value="Bespoke Furniture Inquiry">Bespoke Furniture Inquiry</option>
                    <option value="Commercial Project">Commercial Project</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Your Message</label>
                  <textarea
                    rows={6}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about what you're looking for..."
                    required
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  className={styles.submitBtn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Request Consultation
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}