"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { shrinkImage } from '@/lib/imageShrink';
import { GOOGLE_DRIVE_WARNING, isGoogleDriveLink, normalizeMediaUrl } from '@/lib/imageUtils';
import { MEDIA_ACCEPT, UPLOAD_FAILED_MESSAGE, uploadMedia, validateMediaFile } from '@/lib/mediaUpload';
import { Button, TextField, Thumbnail } from '../ui';
import s from './MediaUpload.module.css';

type Row = { id: string; file: string; percent: number; error?: string };
const isImage = (file: File) => file.type.startsWith('image/') || /\.hei[cf]$/i.test(file.name);

// Ordered product media: uploads go straight to storage, the first item is the cover shown on the website.
export function MediaField({ value, onChange, onBusyChange, disabled, error }: {
    value: string[];
    onChange: (update: (previous: string[]) => string[]) => void;
    onBusyChange: (busy: boolean) => void;
    disabled?: boolean;
    error?: string;
}) {
    const [rows, setRows] = useState<Row[]>([]);
    const [link, setLink] = useState('');
    const [linkError, setLinkError] = useState('');
    const controllers = useRef(new Set<AbortController>());
    const alive = useRef(true);
    const busy = rows.some(row => !row.error && row.percent < 100);
    useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
    // Leaving the form cancels the whole batch, so no queued file uploads after the form is gone.
    useEffect(() => { alive.current = true; const active = controllers.current; return () => { alive.current = false; active.forEach(c => c.abort()); }; }, []);
    const patch = (id: string, values: Partial<Row>) => setRows(items => items.map(item => item.id === id ? { ...item, ...values } : item));

    async function upload(files: File[]) {
        if (disabled || !files.length) return;
        const batch = files.map(file => ({ file, row: { id: crypto.randomUUID(), file: file.name, percent: 0 } as Row }));
        setRows(items => [...items.filter(item => !item.error && item.percent < 100), ...batch.map(item => item.row)]);
        for (const { row: { id }, file } of batch) {
            if (!alive.current) break;
            const controller = new AbortController();
            controllers.current.add(controller);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('Your session has ended. Log in again, then try again.');
                const prepared = isImage(file) ? await shrinkImage(file) : file;
                if (!alive.current) break;
                const invalid = validateMediaFile(prepared);
                if (invalid) throw new Error(invalid);
                const url = await uploadMedia(prepared, { accessToken: session.access_token, signal: controller.signal, onProgress: percent => patch(id, { percent: Math.min(percent, 99) }) });
                onChange(previous => [...previous, url]);
                setRows(items => items.filter(item => item.id !== id));
            } catch (cause) {
                if (!controller.signal.aborted) patch(id, { error: cause instanceof Error ? cause.message : UPLOAD_FAILED_MESSAGE });
            } finally { controllers.current.delete(controller); }
        }
    }
    async function addLink() {
        setLinkError('');
        const result = await normalizeMediaUrl(link);
        if (!result.ok) { setLinkError(result.error); return; }
        onChange(previous => [...previous, result.url]);
        setLink('');
    }
    const move = (from: number, to: number) => onChange(previous => {
        const next = [...previous];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
    });
    return <div className={s.uploader}>
        {value.length > 0 && <ul className={s.tiles} aria-label="Photos and videos">
            {value.map((url, index) => <li key={`${url}-${index}`} className={s.tile} data-cover={index === 0 || undefined} data-tour={index === 0 ? 'cover-tile' : undefined}>
                <div className={s.tileTop}>
                    <span>{index === 0 ? 'Cover' : `Photo ${index + 1}`}</span>
                    <Button variant="plain" disabled={disabled} onClick={() => onChange(previous => previous.filter((_, i) => i !== index))} aria-label={`Remove ${index === 0 ? 'cover' : `photo ${index + 1}`}`}><X size={16} /></Button>
                </div>
                <Thumbnail src={url} alt={index === 0 ? 'Cover' : `Photo ${index + 1}`} size="lg" />
                <div className={s.tileActions}>
                    <span>
                        {index > 0 && <Button variant="plain" disabled={disabled} onClick={() => move(index, index - 1)} aria-label={`Move photo ${index + 1} earlier`}><ArrowLeft size={16} /></Button>}
                        {index < value.length - 1 && <Button variant="plain" disabled={disabled} onClick={() => move(index, index + 1)} aria-label={`Move ${index === 0 ? 'cover' : `photo ${index + 1}`} later`}><ArrowRight size={16} /></Button>}
                    </span>
                    {index > 0 && <Button variant="plain" disabled={disabled} onClick={() => move(index, 0)}>Make cover</Button>}
                </div>
            </li>)}
        </ul>}
        <label className={s.drop} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void upload(Array.from(event.dataTransfer.files)); }}>
            <Upload size={24} aria-hidden="true" />
            <strong>{value.length ? 'Add more photos or videos' : 'Drop photos or videos here, or click to choose'}</strong>
            <span>The first one becomes the cover. JPG, PNG, WebP, GIF or AVIF (large photos are shrunk for you), or MP4 up to 50 MB.</span>
            <input type="file" multiple aria-label="Upload photos or videos" disabled={disabled} accept={`${MEDIA_ACCEPT},image/heic,image/heif,.heic,.heif`}
                onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void upload(files); }} />
        </label>
        {error && <p role="alert" className={s.error}>{error}</p>}
        {rows.length > 0 && <ul className={s.uploads} aria-label="Upload progress">
            {rows.map(row => <li key={row.id} className={s.upload}>
                <div><strong>{row.file}</strong>
                    {row.error ? <p role="alert">{row.error}</p> : <div className={s.progress}><progress aria-label={row.file} max={100} value={row.percent} /><span>{row.percent}%</span></div>}
                </div>
                {row.error && <Button variant="plain" onClick={() => setRows(items => items.filter(item => item.id !== row.id))}>Dismiss</Button>}
            </li>)}
        </ul>}
        <details>
            <summary>Add from a link instead</summary>
            <div className={s.link}>
                <TextField label="Image or video link" hint="Google Drive and ImgBB links work too." value={link} error={linkError || undefined} disabled={disabled} onChange={event => { setLink(event.target.value); setLinkError(''); }} />
                <Button variant="secondary" disabled={disabled || !link.trim()} onClick={() => void addLink()}>Add link</Button>
            </div>
            {isGoogleDriveLink(link) && <p className={s.note}>{GOOGLE_DRIVE_WARNING}</p>}
        </details>
    </div>;
}
