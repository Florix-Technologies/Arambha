import Image from 'next/image';
import styles from './page.module.css';

export default function InteriorsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Interior Solutions</h1>
        <p className={styles.subtitle}>Bespoke wooden and aluminium craft for modern living spaces.</p>
      </header>

      {/* Wooden Interiors */}
      <section className={styles.section} id="wooden">
        <h2 className={styles.sectionTitle}>Wooden Interiors</h2>
        <div className={styles.categoryGrid}>
           <div className={styles.card}>
             <div className={styles.imagePlaceholder} style={{background: '#8C7C62'}}>Kitchen Cabinetry</div>
             <div className={styles.cardContent}>
               <h3>Custom Kitchens</h3>
               <p>Handcrafted wooden modular kitchens designed for functionality and warmth.</p>
             </div>
           </div>
           
           <div className={styles.card}>
             <div className={styles.imagePlaceholder} style={{background: '#5C5852'}}>Wardrobes</div>
             <div className={styles.cardContent}>
               <h3>Bedroom Wardrobes</h3>
               <p>Spacious, elegant floor-to-ceiling wardrobes with premium finishes.</p>
             </div>
           </div>
           
           <div className={styles.card}>
             <div className={styles.imagePlaceholder} style={{background: '#AF9F85'}}>Wall Paneling</div>
             <div className={styles.cardContent}>
               <h3>Decorative Paneling</h3>
               <p>Adds texture and acoustic warmth to living and office spaces.</p>
             </div>
           </div>
        </div>
      </section>

      <div className={styles.divider}></div>

      {/* Aluminium Interiors */}
      <section className={styles.section} id="aluminium">
        <h2 className={styles.sectionTitle}>Aluminium Interiors</h2>
        <div className={styles.categoryGrid}>
           <div className={styles.card}>
             <div className={styles.imagePlaceholder} style={{background: '#BEBDB8'}}>Office Partitions</div>
             <div className={styles.cardContent}>
               <h3>Sleek Partitions</h3>
               <p>Minimalist aluminium frames for modern office separation.</p>
             </div>
           </div>
           
           <div className={styles.card}>
             <div className={styles.imagePlaceholder} style={{background: '#A6A5A1'}}>Sliding Doors</div>
             <div className={styles.cardContent}>
               <h3>Glazed Sliding Systems</h3>
               <p>Smooth, durable, and space-saving door solutions.</p>
             </div>
           </div>
           
           <div className={styles.card}>
             <div className={styles.imagePlaceholder} style={{background: '#D1D0CE'}}>Modular Workstations</div>
             <div className={styles.cardContent}>
               <h3>Workstations</h3>
               <p>Durable and configurable aluminium-based desk systems.</p>
             </div>
           </div>
        </div>
      </section>

      <div className={styles.inquiryBox}>
        <h3>Interested in our Interior solutions?</h3>
        <p>We provide end-to-end design and execution.</p>
        <a href="/contact" className={styles.contactBtn}>Get in Touch</a>
      </div>
    </div>
  );
}
