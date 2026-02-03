import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function Home() {
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
            <source src="/v3_enhanced.mp4" type="video/mp4" />
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
          <Button href="/contact" variant="text">Start Your Project &rarr;</Button>
        </div>
      </section>

      {/* Featured Works */}
      <section className="section">
        <div className="container">
          <div className={styles.featuredHeader}>
            <h2 className={styles.featuredTitle}>Selected Works</h2>
            <Button href="/gallery" variant="text">View All Projects</Button>
          </div>

          <div className={styles.grid}>
            {/* Project 1 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>
                {/* Placeholder for project images - In real app, these would be real images */}
                <Image
                  src="/i1.jpeg"
                  alt="The Stone Residence"
                  fill
                  className={styles.cardImage}
                />
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
                <Image
                  src="/i3.jpeg"
                  alt="Urban Loft"
                  fill
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Urban Loft</h3>
                <p className={styles.cardCategory}>Furniture & Styling</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
