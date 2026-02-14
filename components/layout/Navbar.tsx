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

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if we are past the "Philosophy of Aesthetics" section
      // Hero (100vh) + Philosophy (~500px) = roughly 1200px
      const threshold = window.innerHeight * 1.3;

      if (currentScrollY > threshold) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide
          setIsVisible(false);
        } else {
          // Scrolling up - show
          setIsVisible(true);
        }
      } else {
        // Always show in the early sections
        setIsVisible(true);
      }

      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const services = [
    {
      title: "Complete Interior Solutions",
      links: [
        { name: 'Modular House Interiors', href: '/services?filter=modular-house' },
        { name: 'Hybrid Manual Interiors', href: '/services?filter=hybrid-manual' },
      ]
    },
    {
      title: "Modular Solutions",
      links: [
        { name: 'Kitchen', href: '/services?filter=kitchen' },
        { name: 'Wardrobe', href: '/services?filter=wardrobe' },
      ]
    },
    {
      title: "Interior Finishing",
      links: [
        { name: 'Civil Works', href: '/services?filter=civil-works' },
        { name: 'Lighting', href: '/services?filter=lighting' },
        { name: 'Flooring', href: '/services?filter=flooring' },
        { name: 'False Ceiling', href: '/services?filter=false-ceiling' },
        { name: 'Wall Design', href: '/services?filter=wall-design' },
        { name: 'Painting', href: '/services?filter=painting' },
      ]
    },
    {
      title: "Furniture & Partition System",
      links: [
        { name: 'Furniture', href: '/services?filter=furniture' },
        { name: 'Office & Commercial Furniture', href: '/services?filter=office-furniture' },
        { name: 'Aluminum Interiors & Partitions', href: '/services?filter=aluminum-interiors' },
      ]
    }
  ];

  const galleryItems = [
    {
      title: "Residential Projects",
      links: [
        { name: 'Living Room Designs', href: '/gallery?filter=living-room' },
        { name: 'Master Bedroom', href: '/gallery?filter=master-bedroom' },
        { name: 'Kids Room', href: '/gallery?filter=kids-room' },
        { name: 'Modular Kitchens', href: '/gallery?filter=kitchen' },
      ]
    },
    {
      title: "Commercial & Office",
      links: [
        { name: 'Corporate Offices', href: '/gallery?filter=offices' },
        { name: 'Retail Shops', href: '/gallery?filter=retail' },
        { name: 'Workstations', href: '/gallery?filter=workstations' },
        { name: 'Reception Areas', href: '/gallery?filter=reception' },
      ]
    },
    {
      title: "Hospitality & Institutional",
      links: [
        { name: 'Cafes & Restaurants', href: '/gallery?filter=cafes' },
        { name: 'Hotels', href: '/gallery?filter=hotels' },
        { name: 'Educational Spaces', href: '/gallery?filter=educational' },
        { name: 'Healthcare Facilities', href: '/gallery?filter=healthcare' },
      ]
    },
    {
      title: "Specialty Spaces",
      links: [
        { name: 'Home Theatre', href: '/gallery?filter=home-theatre' },
        { name: 'Pooja Room', href: '/gallery?filter=pooja-room' },
        { name: 'Balcony & Deck', href: '/gallery?filter=balcony' },
        { name: 'Study & Library', href: '/gallery?filter=study' },
      ]
    }
  ];

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Gallery', href: '/gallery', hasDropdown: true, dropdownContent: galleryItems },
    { name: 'Our Services', href: '/services', hasDropdown: true, dropdownContent: services },
    { name: 'Interiors', href: '/interiors' },
    { name: 'Furniture', href: '/furniture' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${isDarkText ? styles.dark : styles.light} ${!isVisible ? styles.hidden : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <img src="/logo2.png" alt="Logo" />
        </Link>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {navLinks.map((link) => (
            <div key={link.name} className={styles.navItemContainer}>
              <Link
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.name}
                {link.hasDropdown && <span className={styles.arrow}></span>}
              </Link>

              {link.hasDropdown && (
                <div className={styles.megaMenu}>
                  <div className={styles.megaMenuContent}>
                    {link.dropdownContent?.map((section, idx) => (
                      <div key={idx} className={styles.megaMenuColumn}>
                        <h4 className={styles.columnTitle}>{section.title}</h4>
                        <ul className={styles.columnList}>
                          {section.links.map((sLink, sIdx) => (
                            <li key={sIdx}>
                              <Link href={sLink.href} className={styles.megaMenuLink}>
                                {sLink.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className={styles.megaMenuFooter}>
                    <Link href={link.href} className={styles.viewAllBtn}>
                      View All {link.name === 'Gallery' ? 'Portfolio' : 'Services'}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
