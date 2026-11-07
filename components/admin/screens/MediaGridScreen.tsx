"use client";
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, X } from 'lucide-react';
import { PageHeader, Button, Card, Badge, TextField, SelectField } from '../ui';
import { TERMS, MESSAGES, CATEGORIES } from '@/lib/admin/taxonomy';
import { adminFont } from '../font';
import type { AdminMedia, AdminSubcategory, UploadProgress } from '@/lib/admin/types';
import s from './MediaGridScreen.module.css';
export function MediaGridScreen({ name, media, uploads, subcategories, drawerOpen = false }: {
    name: string;
    media: AdminMedia[];
    uploads: UploadProgress[];
    subcategories: AdminSubcategory[];
    drawerOpen?: boolean;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const [open, setOpen] = useState(drawerOpen);
    const [current, setCurrent] = useState(media[0]);
    const isVideo = (file: string) => /\.(mp4|mov|webm)(?:\?|$)/i.test(file);
    return <div className={s.page}>
        <PageHeader title={name} breadcrumbs={[{ label: CATEGORIES.gallery.label, href: '/admin-preview/gallery' }, { label: name }]} primaryAction={
            <Button>
                {TERMS.uploadMedia}
            </Button>
        } />
        <label className={s.drop}>
            <Upload size={24} />
            {MESSAGES.dropHint}
            <input type="file" multiple accept="image/*,video/*" />
        </label>
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
                    <Button variant="plain" aria-label={`${TERMS.cancel}: ${u.file}`}>
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
                <Button variant="secondary">
                    {TERMS.moveTo}
                </Button>
                <Button variant="destructive">
                    {TERMS.delete}
                </Button>
            </div>
        }
        <div className={s.grid}>
            {media.map(m =>
                <Card key={m.id}>
                    <div className={s.cardTop}>
                        <label className={s.check}>
                            <input aria-label={`${TERMS.selectRow}: ${m.caption}`} type="checkbox" checked={selected.includes(m.id)} onChange={() => setSelected(selected.includes(m.id) ? selected.filter(id => id !== m.id) : [...selected, m.id])} />
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
                    <TextField label={TERMS.caption} defaultValue={m.caption} />
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
                            <TextField label={TERMS.caption} defaultValue={current.caption} />
                            <SelectField label={TERMS.subcategory} defaultValue={current.subcategory}>
                                {subcategories.map(sub =>
                                    <option key={sub.id}>
                                        {sub.name}
                                    </option>
                                )}
                            </SelectField>
                            <Button variant="destructive">
                                {TERMS.delete}
                            </Button>
                        </div>
                    }
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    </div>;
}
