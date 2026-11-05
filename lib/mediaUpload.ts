import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

export const MEDIA_BUCKET = 'catalog-media';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const extensions: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4',
};
export const MEDIA_ACCEPT = Object.keys(extensions).join(',');
export const NOT_MP4_MESSAGE = "This video can't be uploaded because it isn't an MP4. Phone videos are often .mov files. Convert it to MP4, then try again.";
export const VIDEO_TOO_LARGE_MESSAGE = 'This video is larger than 50 MB. Make it smaller or shorter, then try again.';
export const IMAGE_TOO_LARGE_MESSAGE = 'This image is larger than 5 MB. Make it smaller, then try again.';
export const WRONG_TYPE_MESSAGE = "This file can't be uploaded. Use a JPG, PNG, WebP, GIF or AVIF image, or an MP4 video.";
export const NOT_ALLOWED_UPLOAD_MESSAGE = 'This account is not allowed to upload. Log in with the admin account.';
export const NOT_SET_UP_MESSAGE = 'Uploads are not set up yet: the storage bucket does not exist.';
export const UPLOAD_FAILED_MESSAGE = 'The upload failed. Check your connection and try again.';

const isVideo = (file: File) => file.type.startsWith('video/') || /\.(mov|avi|mkv|webm|wmv|m4v|3gp)$/i.test(file.name);

export function validateMediaFile(file: File): string | null {
  if (isVideo(file)) {
    if (file.type !== 'video/mp4') return NOT_MP4_MESSAGE;
    return file.size > MAX_VIDEO_BYTES ? VIDEO_TOO_LARGE_MESSAGE : null;
  }
  if (!Object.hasOwn(extensions, file.type)) return WRONG_TYPE_MESSAGE;
  return file.size > MAX_IMAGE_BYTES ? IMAGE_TOO_LARGE_MESSAGE : null;
}

export function uploadErrorMessage(status: number, body: string, file: File): string {
  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed === 'object' && parsed !== null && 'statusCode' in parsed) {
      const code = parsed.statusCode;
      if ((typeof code === 'number' || typeof code === 'string') && String(code).trim() && Number.isFinite(Number(code))) {
        status = Number(code);
      }
    }
  } catch { /* Storage may return plain text. */ }
  if (status === 401 || status === 403 || /row[-\s]level security/i.test(body)) return NOT_ALLOWED_UPLOAD_MESSAGE;
  if (status === 404 || /bucket not found/i.test(body)) return NOT_SET_UP_MESSAGE;
  if (status === 413) return isVideo(file) ? VIDEO_TOO_LARGE_MESSAGE : IMAGE_TOO_LARGE_MESSAGE;
  if (status === 415 || /mime/i.test(body)) return isVideo(file) ? NOT_MP4_MESSAGE : WRONG_TYPE_MESSAGE;
  return UPLOAD_FAILED_MESSAGE;
}

export function uploadMedia(file: File, { accessToken, onProgress, signal }: {
  accessToken: string;
  onProgress: (percent: number) => void;
  signal: AbortSignal;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Upload cancelled', 'AbortError')); return; }
    const validationError = validateMediaFile(file);
    if (validationError) { reject(new Error(validationError)); return; }
    const path = `uploads/${crypto.randomUUID()}.${extensions[file.type]}`;
    const xhr = new XMLHttpRequest();
    const abort = () => {
      xhr.abort();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', 'max-age=31536000');
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
    };
    xhr.onload = () => {
      signal.removeEventListener('abort', abort);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
      } else reject(new Error(uploadErrorMessage(xhr.status, xhr.responseText, file)));
    };
    xhr.onerror = () => { signal.removeEventListener('abort', abort); reject(new Error(UPLOAD_FAILED_MESSAGE)); };
    xhr.onabort = () => { signal.removeEventListener('abort', abort); reject(new DOMException('Upload cancelled', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
    try { xhr.send(file); } catch {
      signal.removeEventListener('abort', abort);
      reject(new Error(UPLOAD_FAILED_MESSAGE));
    }
  });
}
