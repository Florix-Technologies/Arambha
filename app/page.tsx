import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import BudgetSlider from '@/components/ui/BudgetSlider';
import DesignCategories from '@/components/ui/DesignCategories';
import ProcessSection from '@/components/ui/ProcessSection';
import StatsSection from '@/components/ui/StatsSection';
import WhatYouGet from '@/components/ui/WhatYouGet';
import WhyArambha from '@/components/ui/WhyArambha';
import CTASection from '@/components/ui/CTASection';

export default function Home() {

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
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className={styles.heroVideo}
          >
            <source src="/v3.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
          <Button href="/contact" variant="text">Start Your Project &rarr;</Button>
        </div>
      </section>

      {/* Featured Works */}
      <section className={`section ${styles.featuredWorks}`}>
        <div className="container">

          <div className={styles.grid}>
            {/* Project 1 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>

                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.cardImage}
                  style={{ zIndex: 1 }}
                >
                  <source src="/SR.MP4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>The Stone Residence</h3>
                <p className={styles.cardCategory}>Residential Interior</p>
              </div>
            </div>

            {/* Project 2 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>

                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.cardImage}
                  style={{ zIndex: 1 }}
                >
                  <source src="/v6.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Olive Grove Villa</h3>
                <p className={styles.cardCategory}>Architectural Design</p>
              </div>
            </div>

            {/* Project 3 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>

                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.cardImage}
                  style={{ zIndex: 1 }}
                >
                  <source src="/v10.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Urban Loft</h3>
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
          <BudgetSlider />

        </div>
      </section>

      {/* Design Categories Section */}
      <DesignCategories categories={designCategories} />


      <ProcessSection />
      <StatsSection />
      <WhatYouGet />
      <WhyArambha />
      <CTASection />
    </div>
  );
}
