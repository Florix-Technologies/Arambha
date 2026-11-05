import Image from 'next/image';
import { ImageIcon, Video } from 'lucide-react';
import s from './Thumbnail.module.css';
export function Thumbnail({ src, alt, kind = 'photo' }: {
    src?: string;
    alt: string;
    kind?: 'photo' | 'video';
}) { return <div className={s.thumbnail}>{src ? <Image src={src} alt={alt} width={64} height={64} unoptimized/> : <span role="img" aria-label={alt}>{kind === 'video' ? <Video size={24}/> : <ImageIcon size={24}/>}</span>}{src && kind === 'video' && <Video className={s.video} size={20} aria-hidden="true"/>}</div>; }
