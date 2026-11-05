export type MediaUrlResult = { ok: true; url: string } | { ok: false; error: string };

export const IMGBB_DIRECT_LINK_HELP =
  'Could not read this ImgBB link. On ImgBB, copy the image\'s "Direct link" (it starts with https://i.ibb.co/) and paste that instead.';

export const GOOGLE_DRIVE_WARNING =
  'Google Drive restricts embedding, so even a publicly shared file may not load on the site. ImgBB or Imgur are more reliable.';

const DIRECT_MEDIA_PATH = /\.(jpe?g|png|gif|webp|avif|svg|bmp|mp4|webm|mov)$/i;
const IMGBB_SHARE_HOSTS = new Set(['ibb.co', 'www.ibb.co']);
const IMGBB_IMAGE_HOST = 'i.ibb.co';
const IMGBB_PLACEHOLDER_SIZE = 180;

function parseAbsoluteUrl(url: string): URL | null {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

export function isImgbbShareLink(url: string): boolean {
  const parsed = parseAbsoluteUrl(url);
  return !!parsed && IMGBB_SHARE_HOSTS.has(parsed.hostname);
}

export function isImgbbDirectLink(url: string): boolean {
  return parseAbsoluteUrl(url)?.hostname === IMGBB_IMAGE_HOST;
}

export function isGoogleDriveLink(url: string): boolean {
  return parseAbsoluteUrl(url)?.hostname === 'drive.google.com';
}

/** ImgBB answers a missing image with a 180x180 placeholder and no load error. */
export function isImgbbPlaceholder(url: string, width: number, height: number): boolean {
  return isImgbbDirectLink(url) && width === IMGBB_PLACEHOLDER_SIZE && height === IMGBB_PLACEHOLDER_SIZE;
}

function convertGoogleDriveLink(url: string): string {
  const fileId = url.match(/\/file\/d\/([^/?]+)/)?.[1];
  return fileId ? `https://drive.google.com/uc?id=${fileId}&export=view` : url;
}

/** The og:image of an ImgBB share page, only when it points at ImgBB's image host. */
export function extractImgbbImage(html: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/\bproperty\s*=\s*["']og:image["']/i.test(tag)) continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1];
    const parsed = content ? parseAbsoluteUrl(content) : null;
    if (parsed?.protocol === 'https:' && parsed.hostname === IMGBB_IMAGE_HOST && DIRECT_MEDIA_PATH.test(parsed.pathname)) {
      return parsed.href;
    }
  }
  return null;
}

async function resolveImgbbShareLink(url: string): Promise<MediaUrlResult> {
  try {
    const response = await fetch(`/api/resolve-image?url=${encodeURIComponent(url)}`);
    const body: { url?: string } = await response.json();
    if (response.ok && body.url) return { ok: true, url: body.url };
  } catch (error) {
    console.error('Could not resolve the ImgBB link:', error);
  }
  return { ok: false, error: IMGBB_DIRECT_LINK_HELP };
}

/**
 * The one place a pasted media link is checked before it is previewed or saved. Direct links and paths are never
 * rewritten; ImgBB share links are resolved to the real image, because the share ID is not the image ID.
 */
export async function normalizeMediaUrl(raw: string): Promise<MediaUrlResult> {
  const url = raw.trim();
  if (!url) return { ok: false, error: 'Enter an image link.' };
  if (url.startsWith('/') || url.startsWith('data:image/')) return { ok: true, url };

  const parsed = parseAbsoluteUrl(url);
  if (!parsed) return { ok: false, error: 'Enter a full link starting with https://' };
  if (parsed.hostname === IMGBB_IMAGE_HOST || DIRECT_MEDIA_PATH.test(parsed.pathname)) return { ok: true, url };
  if (IMGBB_SHARE_HOSTS.has(parsed.hostname)) return resolveImgbbShareLink(url);
  if (parsed.hostname === 'imgbb.com' || parsed.hostname.endsWith('.imgbb.com')) return { ok: false, error: IMGBB_DIRECT_LINK_HELP };
  if (isGoogleDriveLink(url)) return { ok: true, url: convertGoogleDriveLink(url) };
  return { ok: true, url };
}
