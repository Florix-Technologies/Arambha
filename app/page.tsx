import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import BudgetSlider from '@/components/ui/BudgetSlider';
import StyleSlider from '@/components/ui/StyleSlider';

export default function Home() {

  const stylesWeOffer = [
    {
      title: "1. Contemporary Style",
      images: [
        "home1.jpeg",
        "/contemporary/2.jpg",
        "/contemporary/3.jpg",
        "/contemporary/4.jpg",
        "/contemporary/5.jpg",
      ],
    },
    {
      title: "2. Minimalist Style",
      images: [
        "/minimalist/1.jpg",
        "/minimalist/2.jpg",
        "/minimalist/3.jpg",
        "/minimalist/4.jpg",
        "/minimalist/5.jpg",
      ],
    },
    {
      title: "3. Modern Classic Style (Fusion)",
      images: [
        "/fusion/1.jpg",
        "/fusion/2.jpg",
        "/fusion/3.jpg",
        "/fusion/4.jpg",
        "/fusion/5.jpg",
      ],
    },
    {
      title: "4. Traditional / Ethnic",
      images: [
        "/traditional/1.jpg",
        "/traditional/2.jpg",
        "/traditional/3.jpg",
        "/traditional/4.jpg",
        "/traditional/5.jpg",
      ],
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
                  <source src="/v11.mp4" type="video/mp4" />
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
            Our Interior Design Works with Budget
          </h2>

          {/* ===================== */}
          {/* Budget Cards – Slider */}
          {/* ===================== */}
          <BudgetSlider />

          {/* ===================== */}
          {/* Styles We Offer */}
          {/* ===================== */}
          <div style={{ marginTop: "4rem" }}>

            {/* MAIN HEADING */}
            <h2 className={styles.featuredTitle} style={{ marginBottom: "2.5rem" }}>
              Styles We Offer
            </h2>

            {stylesWeOffer.map((style, i) => (
              <div key={i} style={{ marginBottom: "4rem" }}>
                <h3 className={styles.introTitle} style={{ marginBottom: "1.5rem" }}>{style.title}</h3>

                <div style={{ marginTop: "1rem" }}>
                  <StyleSlider items={style.images} />
                </div>
              </div>
            ))}

          </div>



        </div>
      </section>


    </div>
  );
}
