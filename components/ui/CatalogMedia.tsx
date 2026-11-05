import type { CSSProperties, MouseEventHandler } from 'react';
import { isVideoUrl } from '@/lib/imageUtils';

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
    return (
      <video
        src={src}
        aria-label={alt}
        style={style}
        className={className}
        onClick={onClick}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- catalogue images come from whichever host the admin used
  return <img src={src} alt={alt} style={style} className={className} onClick={onClick} />;
}
