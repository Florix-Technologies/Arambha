"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { fetchNavCategories, type NavCategories } from '@/lib/catalog';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDarkText = pathname !== '/';
  const isContactPage = pathname === '/contact';
  const isAdminPage = pathname.startsWith('/admin');
  // Product pages start with content at the top, so the large floating logo would cover the photo: use the compact bar.
  const isProductPage = /^\/(interiors|furniture)\/[^/]+\/[^/]+/.test(pathname);

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
      title: "Interior Solution",
      links: [
        { name: 'Kitchen', href: '/services?filter=kitchen' },
        { name: 'Wardrobe', href: '/services?filter=wardrobe' },
        { name: 'Living room with TV unit', href: '/services?filter=living-room-tv' },
        { name: 'Crockery unit', href: '/services?filter=crockery-unit' },
        { name: 'Pooja room', href: '/services?filter=pooja-room' },
        { name: 'Washroom and Master washroom', href: '/services?filter=washroom' },
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

  const [navCategories, setNavCategories] = useState<NavCategories>({});

  useEffect(() => {
    fetchNavCategories()
      .then(setNavCategories)
      .catch(error => console.error('Error fetching navigation categories:', error));
  }, []);

  function groupCategories(collection: string, firstTitle: string, moreTitle: string) {
    const categories = navCategories[collection] ?? [];
    const groups = [];
    for (let i = 0; i < categories.length; i += 4) {
      groups.push({
        title: i === 0 ? firstTitle : moreTitle,
        links: categories.slice(i, i + 4).map(category => ({
          name: category.name,
          href: `/${collection}/${encodeURIComponent(category.slug)}`,
        })),
      });
    }
    return groups;
  }

  const dynamicGallery = groupCategories('gallery', 'Our Portfolio', 'More Projects');
  const dynamicInteriors = groupCategories('interiors', 'Design Styles', 'Additional Designs');
  const dynamicFurniture = groupCategories('furniture', 'Furniture Collection', 'More Categories');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Gallery', href: '/gallery', hasDropdown: dynamicGallery.length > 0, dropdownContent: dynamicGallery, size: 'small' },
    { name: 'Our Services', href: '/services', hasDropdown: true, dropdownContent: services, size: 'medium' },
    { name: 'Interiors', href: '/interiors', hasDropdown: dynamicInteriors.length > 0, dropdownContent: dynamicInteriors, size: 'small' },
    { name: 'Furniture', href: '/furniture', hasDropdown: dynamicFurniture.length > 0, dropdownContent: dynamicFurniture, size: 'small' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled || isAdminPage || isProductPage ? styles.scrolled : ''} ${isDarkText ? styles.dark : styles.light} ${!isVisible ? styles.hidden : ''} ${isContactPage ? styles.contactNav : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo2.png" alt="Arambha Design & Interior Studio, home" width={708} height={705} sizes="220px" priority />
        </Link>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {navLinks.map((link) => (
            <div key={link.name} className={`${styles.navItemContainer} ${link.name === 'Furniture' ? styles.furnitureItem : ''}`}>
              <Link
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`)) ? styles.active : ''}`}
              >
                {link.name}
                {link.hasDropdown && <span className={styles.arrow}></span>}
              </Link>

              {link.hasDropdown && (
                <div className={`${styles.megaMenu} ${link.size === 'large' ? styles.largeMenu : link.size === 'medium' ? styles.mediumMenu : styles.smallMenu}`}>
                  <div className={`${styles.megaMenuContent} ${link.size === 'large' ? styles.largeContent : link.size === 'medium' ? styles.mediumContent : styles.smallContent}`}>
                    {link.dropdownContent?.map((section, idx) => (
                      <div key={idx} className={styles.megaMenuColumn}>
                        <p className={styles.columnTitle}>{section.title}</p>
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
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className={`${styles.bar} ${isOpen ? styles.open : ''}`}></span>
          <span className={`${styles.bar} ${isOpen ? styles.open : ''}`}></span>
          <span className={`${styles.bar} ${isOpen ? styles.open : ''}`}></span>
        </button>

        {/* Mobile Menu */}
        <div id="mobile-menu" className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
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
