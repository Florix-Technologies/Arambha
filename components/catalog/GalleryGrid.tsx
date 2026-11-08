"use client";
import { useEffect, useState } from 'react';
import { isVideoUrl } from '@/lib/imageUtils';
import CatalogMedia from '@/components/ui/CatalogMedia';
import styles from '@/app/(site)/gallery/page.module.css';

export type GalleryItem = { src: string | null; alt: string };

/** One grid of gallery photos/videos with a click-to-enlarge lightbox. */
export default function GalleryGrid({ items, priorityFirst }: { items: GalleryItem[]; priorityFirst?: boolean }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [selected]);

  return (
    <>
      <div className={styles.grid}>
        {items.map((item, i) => (
          <div
            key={i}
            className={styles.card}
            style={{ aspectRatio: '4 / 3', cursor: item.src ? 'pointer' : 'default' }}
            onClick={() => item.src && setSelected(item)}
          >
            {item.src
              ? <CatalogMedia src={item.src} alt={item.alt} className={styles.media} priority={priorityFirst && i === 0} width={800} height={600} />
              : <div className={styles.noImage}><span>{item.alt}</span></div>}
          </div>
        ))}
      </div>

      {selected?.src && (
        <div className={styles.lightboxOverlay} onClick={() => setSelected(null)} role="dialog" aria-modal="true" aria-label="Enlarged view">
          <button className={styles.closeButton} onClick={e => { e.stopPropagation(); setSelected(null); }} aria-label="Close lightbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            {isVideoUrl(selected.src)
              ? <video src={selected.src} aria-label={selected.alt} autoPlay loop controls className={styles.lightboxMedia} />
              // eslint-disable-next-line @next/next/no-img-element -- catalogue images come from whichever host the admin used
              : <img src={selected.src} alt={selected.alt} className={styles.lightboxMedia} />}
          </div>
        </div>
      )}
    </>
  );
}
