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
};

export default function CatalogMedia({ src, alt, style, className, controls, onClick }: Props) {
  if (isVideoUrl(src)) {
    if (!controls) return <SmartVideo src={src} label={alt} style={style} className={className} onClick={onClick} />;
    return <video src={src} aria-label={alt} style={style} className={className} onClick={onClick} controls playsInline preload="metadata" />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- catalogue images come from whichever host the admin used
  return <img src={src} alt={alt} style={style} className={className} onClick={onClick} loading="lazy" />;
}
