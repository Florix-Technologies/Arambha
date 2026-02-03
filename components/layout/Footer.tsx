import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <img src="/logo1.png" alt="Logo" style={{ height: '240px', width: 'auto' }} />
          </div>
          
          <div className={styles.contactInfo}>
            <h3>Contact</h3>
            <p>123 Design Avenue</p>
            <p>Bangalore, India</p>
            <p className={styles.link}>hello@arambha.com</p>
            <p className={styles.link}>+91 98765 43210</p>
          </div>

          <div className={styles.sitemap}>
            <h3>Explore</h3>
            <Link href="/gallery">Gallery</Link>
            <Link href="/interiors">Interiors</Link>
            <Link href="/furniture">Furniture</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p>&copy; {year} Arambha Design and Interior Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
