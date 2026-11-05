"use client";
import { useEffect, useRef, useState, type CSSProperties, type MouseEventHandler } from 'react';

const LOAD_MARGIN = '200px';

type Props = {
  src: string;
  className?: string;
  style?: CSSProperties;
  label?: string;
  onClick?: MouseEventHandler<HTMLVideoElement>;
  /** The visitor pressed pause, so scrolling back must not restart it. */
  userPaused?: boolean;
};

// iPhones need a time offset to draw the first frame of a video that has not started playing.
const withFirstFrame = (src: string) => (src.includes('#') ? src : `${src}#t=0.001`);

/**
 * Every decorative video on the site goes through this. A page can list dozens of videos, but phones run out of memory
 * if they all load, so a video only has a source while it is on screen or about to be, and gives it up when it leaves.
 */
export default function SmartVideo({ src, className, style, label, onClick, userPaused = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React sets `muted` only as a property, and iOS Safari reads the attribute when deciding whether to autoplay.
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute('muted', '');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.autoplay = false;

    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: LOAD_MARGIN });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!near) {
      if (video.hasAttribute('src')) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      return;
    }
    const wanted = withFirstFrame(src);
    if (video.getAttribute('src') !== wanted) {
      video.setAttribute('src', wanted);
      video.load();
    }
    if (userPaused || !video.autoplay) video.pause();
    else video.play().catch(() => {
      // Autoplay refused, for example in iPhone Low Power Mode: the first frame stays visible instead.
    });
  }, [near, src, userPaused]);

  return (
    <video
      ref={ref}
      className={className}
      style={{ backgroundColor: '#e8e4dc', ...style }}
      aria-label={label}
      onClick={onClick}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
