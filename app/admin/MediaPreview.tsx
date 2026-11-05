"use client";
import { useState } from 'react';
import { isImgbbPlaceholder } from '@/lib/imageUtils';
import styles from './page.module.css';

type Props = { url: string; alt: string; className?: string };

export default function MediaPreview({ url, alt, className }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (failedUrl === url) {
    return <div className={`${styles.mediaFailed} ${className ?? ''}`} role="img" aria-label={`${alt}: image failed to load`}>Image failed to load</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- previews must show the pasted link itself, not an optimised copy
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailedUrl(url)}
      onLoad={(e) => {
        if (isImgbbPlaceholder(url, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)) setFailedUrl(url);
      }}
    />
  );
}
