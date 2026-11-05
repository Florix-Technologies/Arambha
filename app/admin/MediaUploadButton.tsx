'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MEDIA_ACCEPT, UPLOAD_FAILED_MESSAGE, uploadMedia, validateMediaFile } from '@/lib/mediaUpload';
import styles from './page.module.css';

type Props = {
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  label: string;
  disabled?: boolean;
};

export default function MediaUploadButton({ onUploaded, onBusyChange, label, disabled }: Props) {
  const id = useId();
  const [error, setError] = useState('');
  const [percent, setPercent] = useState(0);
  const [busy, setBusy] = useState(false);
  const running = useRef<{ controller: AbortController; finish: () => void } | null>(null);

  useEffect(() => () => {
    const upload = running.current;
    if (upload) {
      running.current = null;
      upload.controller.abort();
      upload.finish();
    }
  }, []);

  const chooseFile = async (file: File) => {
    if (running.current) return;
    setError('');
    const validationError = validateMediaFile(file);
    if (validationError) { setError(validationError); return; }
    const controller = new AbortController();
    let finished = false;
    const upload = { controller, finish: () => {
      if (!finished) { finished = true; onBusyChange(false); }
    } };
    running.current = upload;
    setBusy(true);
    setPercent(0);
    onBusyChange(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (controller.signal.aborted) return;
      if (!session) { setError('Your session has ended. Log in again, then try again.'); return; }
      const url = await uploadMedia(file, { accessToken: session.access_token, onProgress: setPercent, signal: controller.signal });
      if (!controller.signal.aborted) onUploaded(url);
    } catch (cause: unknown) {
      if (!controller.signal.aborted && running.current === upload) {
        setError(cause instanceof Error ? cause.message : UPLOAD_FAILED_MESSAGE);
      }
    } finally {
      if (running.current === upload) { running.current = null; setBusy(false); }
      upload.finish();
    }
  };

  return (
    <div className={styles.uploadRow}>
      <input id={id} className={styles.visuallyHidden} type="file" accept={MEDIA_ACCEPT} disabled={disabled || busy}
        onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void chooseFile(file);
        }} />
      <label htmlFor={id} className={styles.uploadButton}>{label}</label>
      {busy && <div className={styles.uploadProgress}>
        <progress max={100} value={percent} aria-label="Upload progress" />
        <span>Uploading… {percent}%</span>
        <button type="button" className={styles.button} onClick={() => running.current?.controller.abort()}>Cancel</button>
      </div>}
      {error && <p className={styles.fieldError} role="alert">{error}</p>}
    </div>
  );
}
