"use client";
import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { MEDIA_ACCEPT, validateBeforeShrink } from '@/lib/mediaUpload';
import { Button } from '../ui';
import { saveGalleryUpload, type GalleryUpload } from './mediaUploadTask';
import s from './MediaUpload.module.css';

type Row = { id: string; file: string; percent: number; status: string; error?: string };
// Gallery items are single photos or videos: each dropped file is uploaded and saved as one item in this subcategory.
export function GalleryUploader({ subcategoryId, onUploaded }: { subcategoryId: string; onUploaded: () => void }) {
    const input = useRef<HTMLInputElement>(null);
    const tasks = useRef(new Map<string, GalleryUpload>());
    const controllers = useRef(new Map<string, AbortController>());
    const mounted = useRef(true);
    const [queue, setQueue] = useState<Row[]>([]);
    useEffect(() => {
        mounted.current = true;
        const active = controllers.current;
        return () => { mounted.current = false; active.forEach(controller => controller.abort()); };
    }, []);
    function patch(id: string, values: Partial<Row>) {
        if (mounted.current) setQueue(items => items.map(item => item.id === id ? { ...item, ...values } : item));
    }
    async function run(id: string) {
        const task = tasks.current.get(id);
        if (!task || controllers.current.has(id)) return;
        const controller = new AbortController();
        controllers.current.set(id, controller);
        patch(id, { status: task.url ? 'Saving' : 'Uploading', percent: task.url ? 100 : 0, error: undefined });
        try {
            await saveGalleryUpload(task, { signal: controller.signal, onProgress: percent => patch(id, { percent, status: percent === 100 ? 'Saving' : 'Uploading' }) });
            if (!mounted.current) return;
            patch(id, { status: 'Uploaded', percent: 100 });
            tasks.current.delete(id);
            onUploaded();
        } catch (error) {
            patch(id, { status: 'Failed', error: error instanceof Error ? error.message : 'Upload failed. Try again.' });
        } finally { controllers.current.delete(id); }
    }
    async function enqueue(files: File[]) {
        const batch = files.map(file => {
            const id = crypto.randomUUID();
            const invalid = file.size === 0 ? 'This file is empty.' : validateBeforeShrink(file);
            if (!invalid) tasks.current.set(id, { file, categoryId: subcategoryId });
            return { id, file: file.name, percent: 0, status: invalid ? 'Rejected' : 'Queued', error: invalid ?? undefined };
        });
        setQueue(items => [...items, ...batch]);
        for (const item of batch) {
            if (!mounted.current) break;
            if (!item.error) await run(item.id);
        }
    }
    return <div className={s.uploader}>
        <label className={s.drop} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void enqueue(Array.from(event.dataTransfer.files)); }}>
            <Upload size={24} aria-hidden="true" />
            <strong>Drop photos or videos here, or click to choose</strong>
            <span>JPG, PNG, WebP, GIF or AVIF up to 5 MB (large photos are shrunk for you). MP4 up to 50 MB.</span>
            <input ref={input} aria-label="Upload photos or videos" type="file" multiple accept={MEDIA_ACCEPT} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void enqueue(files); }} />
        </label>
        {queue.length > 0 && <ul className={s.uploads} aria-label="Upload progress">
            {queue.map(item => <li className={s.upload} key={item.id}>
                <div><strong>{item.file}</strong><p role="status">{item.status}</p>
                    <div className={s.progress}><progress aria-label={item.file} max={100} value={item.percent} /><span>{item.percent}%</span></div>
                    {item.error && <p role="alert">{item.error}</p>}
                </div>
                {item.status === 'Failed' && <Button variant="secondary" onClick={() => void run(item.id)}>Retry</Button>}
            </li>)}
        </ul>}
    </div>;
}
