"use client";
import { useEffect, useRef, useState } from 'react';
import { MEDIA_ACCEPT, validateMediaFile } from '@/lib/mediaUpload';
import { isVideoUrl } from '@/lib/imageUtils';
import { saveGalleryUpload, type GalleryUpload } from './mediaUploadTask';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, X } from 'lucide-react';
import { PageHeader, Button, Card, Badge, TextField, SelectField } from '../ui';
import { TERMS, MESSAGES, CATEGORIES } from '@/lib/admin/taxonomy';
import { adminFont } from '../font';
import type { AdminMedia, AdminSubcategory, UploadProgress } from '@/lib/admin/types';
import s from './MediaGridScreen.module.css';
export function MediaGridScreen({ name, media, uploads, subcategories, drawerOpen = false, subcategoryId, onUploaded }: {
    subcategoryId?: string;
    onUploaded?: (item: AdminMedia) => void;
    name: string;
    media: AdminMedia[];
    uploads: UploadProgress[];
    subcategories: AdminSubcategory[];
    drawerOpen?: boolean;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const [open, setOpen] = useState(drawerOpen);
    const [current, setCurrent] = useState(media[0]);
    const isVideo = isVideoUrl;
    const input = useRef<HTMLInputElement>(null);
    const tasks = useRef(new Map<string, GalleryUpload>());
    const controllers = useRef(new Map<string, AbortController>());
    const mounted = useRef(true);
    const [queue, setQueue] = useState<{ id: string; file: string; percent: number; status: string; error?: string }[]>([]);
    const live = !!subcategoryId && !!onUploaded;
    useEffect(() => {
        mounted.current = true;
        const active = controllers.current;
        return () => { mounted.current = false; active.forEach(controller => controller.abort()); };
    }, []);
    function patch(id: string, values: Partial<(typeof queue)[number]>) {
        if (mounted.current) setQueue(items => items.map(item => item.id === id ? { ...item, ...values } : item));
    }
    async function run(id: string) {
        const task = tasks.current.get(id);
        if (!task || controllers.current.has(id)) return;
        const controller = new AbortController();
        controllers.current.set(id, controller);
        patch(id, { status: task.url ? 'Saving' : 'Uploading', percent: task.url ? 100 : 0, error: undefined });
        try {
            const savedId = await saveGalleryUpload(task, { signal: controller.signal, onProgress: percent => patch(id, { percent, status: percent === 100 ? 'Saving' : 'Uploading' }) });
            if (!mounted.current) return;
            onUploaded?.({ id: savedId, file: task.url!, caption: task.file.name, subcategory: name });
            patch(id, { status: 'Uploaded', percent: 100 });
            tasks.current.delete(id);
        } catch (error) {
            patch(id, { status: 'Failed', error: error instanceof Error ? error.message : 'Upload failed. Try again.' });
        } finally { controllers.current.delete(id); }
    }
    async function enqueue(files: File[]) {
        if (!live || !subcategoryId) return;
        const batch = files.map(file => {
            const id = crypto.randomUUID();
            const invalid = file.size === 0 ? 'This file is empty.' : validateMediaFile(file);
            if (!invalid) tasks.current.set(id, { file, categoryId: subcategoryId });
            return { id, file: file.name, percent: 0, status: invalid ? 'Rejected' : 'Queued', error: invalid ?? undefined };
        });
        setQueue(items => [...items, ...batch]);
        for (const item of batch) {
            if (!mounted.current) break;
            if (!item.error) await run(item.id);
        }
    }
    return <div className={s.page}>
        <PageHeader title={name} breadcrumbs={[{ label: CATEGORIES.gallery.label, href: live ? '/admin-v2/gallery' : '/admin-preview/gallery' }, { label: name }]} primaryAction={
            <Button disabled={!live} onClick={() => input.current?.click()}>
                {TERMS.uploadMedia}
            </Button>
        } />
        <label className={s.drop} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void enqueue(Array.from(event.dataTransfer.files)); }}>
            <Upload size={24} />
            {live ? 'Drop files here, or click to choose photos or videos.' : MESSAGES.dropHint}
            <input ref={input} aria-label={TERMS.uploadMedia} disabled={!live} type="file" multiple accept={MEDIA_ACCEPT} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void enqueue(files); }} />
        </label>
        <p>JPG, PNG, WebP, GIF or AVIF up to 5 MB; MP4 up to 50 MB.</p>
        {queue.length > 0 && <div className={s.uploads} aria-label={TERMS.uploadProgress}>
            {queue.map(item => <div className={s.upload} key={item.id}>
                <div><strong>{item.file}</strong><p role="status">{item.status}</p>
                    <div className={s.progress}><progress aria-label={item.file} max={100} value={item.percent} /><span>{item.percent}%</span></div>
                    {item.error && <p role="alert">{item.error}</p>}
                </div>
                {item.status === 'Failed' && <Button variant="secondary" onClick={() => void run(item.id)}>Retry</Button>}
            </div>)}
        </div>}
        {media.length === 0 && <Card><p>{MESSAGES.noMedia}</p></Card>}
        <div className={s.uploads} aria-label={TERMS.uploadProgress}>
            {uploads.map(u =>
                <div className={s.upload} key={u.file}>
                    <div>
                        <strong>
                            {u.file}
                        </strong>
                        <div className={s.progress}>
                            <progress aria-label={u.file} max={100} value={u.percent} />
                            <span>
                                {u.percent}%
                            </span>
                        </div>
                    </div>
                    <Button variant="plain" disabled aria-label={`${TERMS.cancel}: ${u.file}`}>
                        <X size={20} />
                    </Button>
                </div>
            )}
        </div>
        {selected.length > 0 &&
            <div className={s.bulk} role="region" aria-label={TERMS.bulkActions}>
                <strong>
                    {TERMS.bulkActions} ({selected.length})
                </strong>
                <Button variant="secondary" disabled>
                    {TERMS.moveTo}
                </Button>
                <Button variant="destructive" disabled>
                    {TERMS.delete}
                </Button>
            </div>
        }
        <div className={s.grid}>
            {media.map(m =>
                <Card key={m.id}>
                    <div className={s.cardTop}>
                        <label className={s.check}>
                            <input disabled={live} aria-label={`${TERMS.selectRow}: ${m.caption}`} type="checkbox" checked={selected.includes(m.id)} onChange={() => setSelected(selected.includes(m.id) ? selected.filter(id => id !== m.id) : [...selected, m.id])} />
                        </label>
                        <Badge>
                            {isVideo(m.file) ? TERMS.video : TERMS.photo}
                        </Badge>
                    </div>
                    <button className={s.mediaButton} aria-label={`${TERMS.mediaDetails}: ${m.caption}`} onClick={() => { setCurrent(m); setOpen(true); }}>
                        {isVideo(m.file) ?
                            <video src={m.file} preload="metadata" muted playsInline aria-label={m.caption} />
                            :
                            <span role="img" aria-label={m.caption} style={{ backgroundImage: `url("${m.thumbnail || m.file}")` }} />
                        }
                    </button>
                    <TextField readOnly label={TERMS.caption} defaultValue={m.caption} />
                </Card>
            )}
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className={`adminRoot ${adminFont.variable} ${s.overlay}`} />
                <Dialog.Content className={`adminRoot ${adminFont.variable} ${s.drawer}`} aria-describedby={undefined}>
                    <div className={s.drawerHeader}>
                        <Dialog.Title>
                            {TERMS.mediaDetails}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="plain" aria-label={TERMS.close}>
                                <X size={20} />
                            </Button>
                        </Dialog.Close>
                    </div>
                    {current &&
                        <div className={s.drawerFields} key={current.id}>
                            {isVideo(current.file) ?
                                <video src={current.file} controls className={s.drawerMedia} />
                                :
                                <div role="img" aria-label={current.caption} className={s.drawerMedia} style={{ backgroundImage: `url("${current.thumbnail || current.file}")` }} />
                            }
                            <TextField readOnly label={TERMS.caption} defaultValue={current.caption} />
                            <SelectField disabled label={TERMS.subcategory} defaultValue={current.subcategory}>
                                {subcategories.map(sub =>
                                    <option key={sub.id}>
                                        {sub.name}
                                    </option>
                                )}
                            </SelectField>
                            <Button variant="destructive" disabled>
                                {TERMS.delete}
                            </Button>
                        </div>
                    }
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    </div>;
}
