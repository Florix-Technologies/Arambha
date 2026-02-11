import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

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
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(90, 80, 110, 0.85)',
                  color: '#fff',
                  borderRadius: '1.2rem',
                  padding: '0.3rem 1.1rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  zIndex: 2
                }}>Starting at 3.57L*</span>
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
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  bottom: '16px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  borderRadius: '0.7rem',
                  padding: '0.2rem 0.9rem',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  zIndex: 2
                }}>2BHK</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>The Stone Residence</h3>
                <p className={styles.cardCategory}>Residential Interior</p>
              </div>
            </div>

            {/* Project 2 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(90, 80, 110, 0.85)',
                  color: '#fff',
                  borderRadius: '1.2rem',
                  padding: '0.3rem 1.1rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  zIndex: 2
                }}>Starting at 4.23L*</span>
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
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  bottom: '16px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  borderRadius: '0.7rem',
                  padding: '0.2rem 0.9rem',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  zIndex: 2
                }}>3BHK</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Olive Grove Villa</h3>
                <p className={styles.cardCategory}>Architectural Design</p>
              </div>
            </div>

            {/* Project 3 */}
            <div className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(90, 80, 110, 0.85)',
                  color: '#fff',
                  borderRadius: '1.2rem',
                  padding: '0.3rem 1.1rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  zIndex: 2
                }}>Starting at 2.99L*</span>
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
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  bottom: '16px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  borderRadius: '0.7rem',
                  padding: '0.2rem 0.9rem',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  zIndex: 2
                }}>4BHK</span>
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
<section className="section">
  <div className="container">

    {/* Heading */}
    <h2 className={styles.featuredTitle}>
      Our Interior Design Works with Budget
    </h2>

    {/* ===================== */}
    {/* Budget Cards – Row 1 */}
    {/* ===================== */}
    <div className={styles.grid}>
      {[
        { label: "2BHK – Price ?", img: "/placeholder.jpg" },
        { label: "3BHK – Price ?", img: "/placeholder.jpg" },
        { label: "4BHK – Price ?", img: "/placeholder.jpg" },
      ].map((item, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardImageWrapper}>
            <img
              src={item.img}
              alt={item.label}
              className={styles.cardImage}
            />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardCategory}>{item.label}</p>
          </div>
        </div>
      ))}
    </div>

    {/* ===================== */}
    {/* Room-wise Cards – Row 2 */}
    {/* ===================== */}
    <div className={styles.grid} style={{ marginTop: "3rem" }}>
      {[
        { title: "Kitchen", img: "/placeholder.jpg" },
        { title: "Bedroom – Sliding", img: "/placeholder.jpg" },
        { title: "Bedroom – Swing Door", img: "/placeholder.jpg" },
        { title: "Living", img: "/placeholder.jpg" },
      ].map((room, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{room.title}</h3>
          </div>
          <div className={styles.cardImageWrapper}>
            <img
              src={room.img}
              alt={room.title}
              className={styles.cardImage}
            />
          </div>
        </div>
      ))}
    </div>

    {/* ===================== */}
    {/* Styles We Offer */}
    {/* ===================== */}
            <div style={{ marginTop: "4rem" }}>

  {/* MAIN HEADING */}
  <h2 className={styles.featuredTitle}>
    Styles We Offer
  </h2>

  {stylesWeOffer.map((style, i) => (
    <div key={i} style={{ marginBottom: "3rem" }}>
      <h3 className={styles.introTitle}>{style.title}</h3>

      <div className={styles.grid} style={{ marginTop: "1rem" }}>
        {style.images.map((src, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardImageWrapper}>
              <img
                src={src}
                alt={`${style.title} ${idx + 1}`}
                className={styles.cardImage}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}

</div>



  </div>
</section>


    </div>
  );
}
