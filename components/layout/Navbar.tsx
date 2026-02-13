"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDarkText = pathname !== '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Gallery', href: '/gallery' },
        { name: 'Our Services', href: '/services' },
    { name: 'Interiors', href: '/interiors' },
    { name: 'Furniture', href: '/furniture' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${isDarkText ? styles.dark : styles.light}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <img src="/logo2.png" alt="Logo" style={{ width: '250px', height: '250px', objectFit: 'cover' }} />
        </Link>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className={styles.mobileToggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.bar} ${isOpen ? styles.open : ''}`}></span>
          <span className={`${styles.bar} ${isOpen ? styles.open : ''}`}></span>
          <span className={`${styles.bar} ${isOpen ? styles.open : ''}`}></span>
        </button>

        {/* Mobile Menu */}
        <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={styles.mobileNavLink}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
