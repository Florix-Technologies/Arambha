"use client";

import { useCallback, useState } from 'react';

type Props = {
  src: string;
  title: string;
  className?: string;
};

export default function LazyMap({ src, title, className }: Props) {
  const [loaded, setLoaded] = useState(false);
  const observe = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setLoaded(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setLoaded(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Keep the address query, but open the regular map rather than the embed.
  const mapUrl = new URL(src);
  mapUrl.searchParams.delete('output');

  return (
    <div
      ref={observe}
      className={className}
      style={{ position: 'relative', display: 'grid', placeItems: 'center', backgroundColor: '#e8e4dc' }}
    >
      {loaded ? (
        <iframe
          src={src}
          title={title}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <a
          href={mapUrl.toString()}
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, color: '#24201c', textDecoration: 'underline' }}
        >
          Open in Google Maps
        </a>
      )}
    </div>
  );
}
