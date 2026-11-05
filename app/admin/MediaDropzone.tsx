'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { shrinkImage } from '@/lib/imageShrink';
import { MEDIA_ACCEPT, uploadMedia, validateMediaFile, UPLOAD_FAILED_MESSAGE } from '@/lib/mediaUpload';
import MediaPreview from './MediaPreview';
import styles from './ItemWizard.module.css';
type Props = { value?: string; multiple?: boolean; photosOnly?: boolean; disabled?: boolean; onUploaded: (url: string) => void; onBusyChange: (busy: boolean) => void };
export default function MediaDropzone({ value, multiple, photosOnly, disabled, onUploaded, onBusyChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<File[] | null>(null);
  const controller = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => () => { controller.current?.abort(); }, []);
  const upload = async (files: File[]) => {
    if (controller.current || disabled) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true); onBusyChange(true); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Your session has ended. Log in again, then try again.');
      for (const original of files) {
        if (abort.signal.aborted) break;
        setPercent(0);
        if (photosOnly && !original.type.startsWith('image/') && !/\.heic$/i.test(original.name)) throw new Error('Choose a photo for extra photos.');
        const file = original.type.startsWith('image/') || /\.hei[cf]$/i.test(original.name) ? await shrinkImage(original) : original;
        if (abort.signal.aborted) break;
        const invalid = validateMediaFile(file);
        if (invalid) throw new Error(invalid);
        const url = await uploadMedia(file, { accessToken: session.access_token, onProgress: setPercent, signal: abort.signal });
        if (!abort.signal.aborted) onUploaded(url);
      }
    } catch (cause) { if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : UPLOAD_FAILED_MESSAGE); }
    finally { controller.current = null; setBusy(false); onBusyChange(false); }
  };
  const choose = (files: File[]) => {
    if (busy || disabled || !files.length) return;
    const chosen = multiple ? files : files.slice(0, 1);
    if (value && !multiple) setPending(chosen); else void upload(chosen);
  };
  return <div>
    <div className={styles.dropzone} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); choose(Array.from(e.dataTransfer.files)); }}>
      <input ref={input} id={id} type="file" accept={photosOnly ? 'image/*' : MEDIA_ACCEPT + ',image/heic,image/heif,.heic,.heif,.mov'} multiple={multiple} disabled={disabled || busy} onChange={e => { choose(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      <button type="button" disabled={disabled || busy} onClick={() => input.current?.click()}>{multiple ? 'Choose extra photos' : 'Choose a photo or video'}</button>
      <p>Or drag and drop {multiple ? 'photos' : 'a file'} here.</p>
      {value && <MediaPreview url={value} alt="Current main photo or video" className={styles.media} />}
    </div>
    {pending && <div role="group" aria-label="Replace main media" className={styles.notice}><p>Replace your current main photo or video?</p><button type="button" onClick={() => { const files = pending; setPending(null); void upload(files); }}>Replace</button> <button type="button" onClick={() => setPending(null)}>Keep</button></div>}
    {busy && <div role="status"><progress value={percent} max={100} aria-label="Upload progress" /> Uploading� {percent}% <button type="button" onClick={() => controller.current?.abort()}>Cancel upload</button></div>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
