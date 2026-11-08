"use client";
import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon, ImageOff, Video } from 'lucide-react';
import { isVideoUrl } from '@/lib/imageUtils';
import s from './Thumbnail.module.css';

// Shows the photo or the first frame of a video; a missing or broken file gets a clear placeholder instead of a broken icon.
export function Thumbnail({ src, alt, size = 'md' }: { src?: string; alt: string; size?: 'md' | 'lg' }) {
    const [failed, setFailed] = useState<string | null>(null);
    const broken = !!src && failed === src;
    const className = `${s.thumbnail} ${size === 'lg' ? s.lg : ''}`;
    if (!src || broken) return <div className={className} data-broken={broken || undefined}>
        <span role="img" aria-label={`${alt}: ${broken ? 'file failed to load' : 'no image'}`}>{broken ? <ImageOff size={20} /> : <ImageIcon size={20} />}</span>
    </div>;
    return <div className={className}>
        {isVideoUrl(src)
            // #t=1 shows a frame one second in: many clips start on a black or empty frame.
            ? <video src={`${src}#t=1`} muted playsInline preload="metadata" aria-label={alt} onError={() => setFailed(src)} />
            : <Image src={src} alt={alt} width={size === 'lg' ? 160 : 64} height={size === 'lg' ? 160 : 64} unoptimized onError={() => setFailed(src)} />}
        {isVideoUrl(src) && <Video className={s.video} size={16} aria-hidden="true" />}
    </div>;
}
