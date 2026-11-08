import type { Metadata } from 'next';
import { preload } from 'react-dom';
import { SITE_URL } from '@/lib/site';
import { BRAND, pageMeta, serializeJsonLd } from '@/lib/seo';
import Button from '@/components/ui/Button';
import SmartVideo from '@/components/ui/SmartVideo';
import SectionBoundary from '@/components/ui/SectionBoundary';
import styles from './page.module.css';
import BudgetSlider from '@/components/ui/BudgetSlider';
import DesignCategories from '@/components/ui/DesignCategories';
import ProcessSection from '@/components/ui/ProcessSection';
import StatsSection from '@/components/ui/StatsSection';
import WhatYouGet from '@/components/ui/WhatYouGet';
import WhyArambha from '@/components/ui/WhyArambha';
import CTASection from '@/components/ui/CTASection';

export const metadata: Metadata = pageMeta({
  title: 'Interior Designers in Bangalore | Arambha Design & Interior Studio',
  description:
    'Explore home interiors, modular kitchens, wardrobes and custom furniture by Arambha Design & Interior Studio in Rajajinagar, Bangalore. Request a design consultation.',
  path: '/',
  absoluteTitle: true,
});

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: BRAND,
  alternateName: 'Arambha',
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#business` },
};

export default function Home() {
  // The hero poster is the largest thing on screen at load, so fetch it first.
  preload('/hero-poster.jpg', { as: 'image', fetchPriority: 'high' });

  const designCategories = [
    {
      title: "1. Contemporary Style",
      images: ["ContemporaryStyle/ContemporaryStyle1.jpeg", "ContemporaryStyle/ContemporaryStyle2.jpeg", "ContemporaryStyle/ContemporaryStyle3.jpeg", "ContemporaryStyle/ContemporaryStyle4.jpeg", "ContemporaryStyle/ContemporaryStyle5.jpeg"],
    },
    {
      title: "2. Minimalist Style",
      images: ["Minimalist/m4.jpeg", "Minimalist/m5.jpeg", "Minimalist/m6.jpeg", "Minimalist/m7.jpeg"],
    },
    {
      title: "3. Modern Classic Style (Fusion)",
      images: ["/MCS/MCS1.jpeg", "/MCS/MCS2.jpeg", "/MCS/MCS3.jpeg", "/MCS/MCS4.jpeg", "/MCS/MCS5.jpeg"],
    },
    {
      title: "4. Traditional / Ethnic",
      images: ["Traditional/t1.jpg", "Traditional/t2.jpg", "Traditional/t3.jpg", "Traditional/t4.jpg", "Traditional/t5.jpg", "Traditional/t6.jpg", "Traditional/t7.jpg"],
    },
  ];

  return (
    <div className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeJsonLd) }}
      />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <SmartVideo src="/v3.mp4" className={styles.heroVideo} poster="/hero-poster.jpg" deferLoad />
        </div>
        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Crafting Spaces, Defining Lifestyles</h1>
          <p className={styles.heroSubtitle}>PREMIUM INTERIOR DESIGN & ARCHITECTURAL SOLUTIONS</p>
          <div className={styles.heroCta}>
            <Button href="/gallery" variant="primary">View Our Work</Button>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className={`section ${styles.intro}`}>
        <div className="container">
          <h2 className={styles.introTitle}>Philosophy of Aesthetics</h2>
          <p className={styles.introText}>
            At Arambha, we believe that design is not just about visual appeal—it&apos;s about creating
            environments that resonate with the soul. Drawing inspiration from nature&apos;s earthy palette,
            we blend sustainable materials with modern architectural principles to craft spaces that
            are timeless, functional, and undeniably sophisticated.
          </p>
          <h2 className={styles.introTitle}>Our Legacy in Furniture & Interiors</h2>
          <p className={styles.introText}>
            With over 35 years of experience in furniture and interior solutions, we have successfully completed 2000+ projects and delivered 30,000+ furniture pieces across India. Our commitment to quality, reliability, and customer satisfaction has made us a trusted partner in transforming homes and commercial spaces.
          </p>
          <Button href="/contact" variant="text" className={styles.highlightedLink}>Start Your Project &rarr;</Button>
        </div>
      </section>

      {/* Featured Works */}
      <section className={`section ${styles.featuredWorks}`}>
        <div className="container">

          <div className={styles.grid}>
            {/* Project 1 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>

                <SmartVideo src="/SR.MP4" className={styles.cardImage} style={{ zIndex: 1 }} />

              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardCategory}>Residential Interior</p>
              </div>
            </div>

            {/* Project 2 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>

                <SmartVideo src="/v6.mp4" className={styles.cardImage} style={{ zIndex: 1 }} />

              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardCategory}>Architectural Design</p>
              </div>
            </div>

            {/* Project 3 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>

                <SmartVideo src="/v10.mp4" className={styles.cardImage} style={{ zIndex: 1 }} />

              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardCategory}>Furniture & Styling</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Interior Design Works with Budget */}
      <section className={`section ${styles.budgetSection}`}>
        <div className="container">

          {/* Heading */}
          <h2 className={styles.featuredTitle}>
            Your Vision , Your Budget , Our Expertise
          </h2>

          {/* ===================== */}
          {/* Budget Cards – Slider */}
          {/* ===================== */}
          <SectionBoundary name="BudgetSlider"><BudgetSlider /></SectionBoundary>

        </div>
      </section>

      {/* Design Categories Section */}
      <SectionBoundary name="DesignCategories"><DesignCategories categories={designCategories} /></SectionBoundary>


      <SectionBoundary name="ProcessSection"><ProcessSection /></SectionBoundary>
      <SectionBoundary name="StatsSection"><StatsSection /></SectionBoundary>
      <SectionBoundary name="WhatYouGet"><WhatYouGet /></SectionBoundary>
      <SectionBoundary name="WhyArambha"><WhyArambha /></SectionBoundary>
      <SectionBoundary name="CTASection"><CTASection /></SectionBoundary>
    </div>
  );
}
