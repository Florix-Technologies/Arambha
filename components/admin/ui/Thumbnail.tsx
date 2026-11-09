"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ImageIcon, ImageOff, Video } from 'lucide-react';
import { isVideoUrl } from '@/lib/imageUtils';
import s from './Thumbnail.module.css';

// Shows the photo or the first frame of a video; a missing or broken file gets a clear placeholder instead of a broken icon.
// Photos load lazily; a video only starts loading (metadata only) once it scrolls into view.
export function Thumbnail({ src, alt, size = 'md', onBroken }: { src?: string; alt: string; size?: 'md' | 'lg'; onBroken?: (src: string) => void }) {
    const [failed, setFailed] = useState<string | null>(null);
    const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');
    const box = useRef<HTMLDivElement>(null);
    const video = !!src && isVideoUrl(src);
    useEffect(() => {
        const node = box.current;
        if (!video || !node) return;
        if (typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '200px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, [video]);
    const broken = !!src && failed === src;
    const fail = (url: string) => { setFailed(url); onBroken?.(url); };
    const className = `${s.thumbnail} ${size === 'lg' ? s.lg : ''}`;
    if (!src || broken) return <div className={className} data-broken={broken || undefined}>
        <span role="img" aria-label={`${alt}: ${broken ? 'file failed to load' : 'no image'}`}>{broken ? <ImageOff size={20} /> : <ImageIcon size={20} />}</span>
    </div>;
    return <div ref={box} className={className}>
        {video
            // #t=1 shows a frame one second in: many clips start on a black or empty frame.
            ? <video src={visible ? `${src}#t=1` : undefined} muted playsInline preload={visible ? 'metadata' : 'none'} aria-label={alt} onError={() => fail(src)} />
            : <Image src={src} alt={alt} width={size === 'lg' ? 160 : 64} height={size === 'lg' ? 160 : 64} loading="lazy" decoding="async" unoptimized onError={() => fail(src)} />}
        {video && <Video className={s.video} size={16} aria-hidden="true" />}
    </div>;
}
