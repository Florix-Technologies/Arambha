import Image from 'next/image';
import styles from './page.module.css';

export default function GalleryPage() {
  const items = [
    { id: 1, type: 'image', size: 'large', title: 'Stylish Living Space', src: '/i10.jpeg' },
    { id: 2, type: 'image', size: 'small', title: 'Minimalist Setup', src: '/i2.jpeg' },
    { id: 3, type: 'video', size: 'medium', title: 'Walkthrough', src: '/v4.mp4' },
    { id: 4, type: 'image', size: 'medium', title: 'Stylish Kitchen', src: '/i4.jpeg' },
    { id: 5, type: 'image', size: 'large', title: 'Modern Storage', src: '/i5.jpeg' },
    { id: 6, type: 'video', size: 'small', title: 'Texture Showcase', src: '/v5.mp4' },
    { id: 7, type: 'image', size: 'medium', title: 'Bedroom Textures', src: '/i6.jpeg' },
    { id: 8, type: 'video', size: 'large', title: 'Walkthrough', src: '/v7.mp4' },
    { id: 9, type: 'image', size: 'small', title: 'Ceramic Art', src: '/i7.jpeg' },
    { id: 10, type: 'image', size: 'medium', title: 'Modern Workspace', src: '/i8.jpeg' },
    { id: 11, type: 'video', size: 'medium', title: 'Open Concept', src: '/v8.mp4' },
    { id: 12, type: 'image', size: 'large', title: 'Cozy Family Space', src: '/i9.jpeg' },
    { id: 13, type: 'image', size: 'small', title: 'Modern Bedroom', src: '/i1.jpeg' },
    { id: 14, type: 'video', size: 'medium', title: 'Modern Living Space', src: '/v6.mp4' },
    { id: 15, type: 'video', size: 'medium', title: 'Modern Living Space', src: '/v1.mp4' },
    { id: 16, type: 'video', size: 'medium', title: 'Aluminium Living Space', src: '/v2.mp4' },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.backgroundWrapper}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.backgroundVideo}
        >
          <source src="/v9.mp4" type="video/mp4" />
        </video>
        <div className={styles.backgroundOverlay}></div>
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Our Work</h1>
          <p className={styles.subtitle}>A curated selection of our finest interior and architectural projects.</p>
        </header>

        <div className={styles.gallery}>
          {items.map((item) => (
            <div key={item.id} className={`${styles.item} ${styles[item.size]}`}>
               <div className={styles.mediaWrapper}>
                  {item.type === 'video' ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className={styles.media}
                    >
                      <source src={item.src} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className={styles.media}
                      style={{ objectFit: 'cover' }}
                    />
                  )}
               </div>
               <div className={styles.overlay}>
                 <h3 className={styles.itemTitle}>{item.title}</h3>
               </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
