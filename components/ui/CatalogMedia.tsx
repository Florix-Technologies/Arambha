import type { CSSProperties, MouseEventHandler } from 'react';
import { isVideoUrl } from '@/lib/imageUtils';
import SmartVideo from './SmartVideo';

type Props = {
  src: string;
  alt: string;
  style?: CSSProperties;
  className?: string;
  controls?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  /** The likely largest image on the page: loaded eagerly and first. Everything else is lazy. */
  priority?: boolean;
  /** Intrinsic size hint so the browser can reserve space before the image arrives. */
  width?: number;
  height?: number;
};

export default function CatalogMedia({ src, alt, style, className, controls, onClick, priority, width, height }: Props) {
  if (isVideoUrl(src)) {
    if (!controls) return <SmartVideo src={src} label={alt} style={style} className={className} onClick={onClick} />;
    return <video src={src} aria-label={alt} style={style} className={className} onClick={onClick} controls playsInline preload="none" />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- catalogue images come from whichever host the admin used
  return <img src={src} alt={alt} style={style} className={className} onClick={onClick} width={width} height={height} decoding="async" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />;
}
