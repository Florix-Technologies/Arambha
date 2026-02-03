import styles from './page.module.css';

export default function FurniturePage() {
  const categories = [
    { name: 'Chairs', items: ['Lounge Chair', 'Accent Chair', 'Dining Chair'] },
    { name: 'Cots', items: ['King Size Bed', 'Queen Storage Bed', 'Kids Bunk'] },
    { name: 'Dining Tables', items: ['6-Seater Oak', 'Round Marble', 'Minimalist Glass'] },
    { name: 'Office Chairs', items: ['Ergonomic Mesh', 'Leather Executive', 'Visitor Chair'] },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Furniture Collection</h1>
        <p className={styles.subtitle}>Handcrafted pieces that blend form, function, and timeless aesthetics.</p>
      </header>

      <div className={styles.categories}>
        {categories.map((cat, index) => (
          <section key={index} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat.name}</h2>
            <div className={styles.grid}>
              {cat.items.map((item, i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.imagePlaceholder}>
                    {/* Placeholder color based on index for variety */}
                    <div style={{
                      width: '100%', 
                      height: '100%', 
                      background: i % 2 === 0 ? '#E5E2DC' : '#D4CFC5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#5C5852'
                    }}>
                      {item} Image
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.productName}>{item}</h3>
                    <p className={styles.productDesc}>Customizable finish and fabric.</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className={styles.customSection}>
        <h2>Looking for something unique?</h2>
        <p>We specialize in bespoke custom furniture design tailored to your specific needs.</p>
        <a href="/contact" className={styles.inquireLink}>Request Custom Design</a>
      </div>
    </div>
  );
}
