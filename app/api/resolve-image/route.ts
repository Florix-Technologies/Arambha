import { NextRequest, NextResponse } from 'next/server';
import { extractImgbbImage, IMGBB_DIRECT_LINK_HELP, isImgbbShareLink } from '@/lib/imageUtils';

const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 1_000_000;
const TIMEOUT_MS = 8_000;
const SHARE_PATH = /^\/[A-Za-z0-9_-]+(\/[A-Za-z0-9._-]+)?\/?$/;

/** The only URLs this route may fetch: https on the ibb.co hosts, so it cannot be used as an open proxy. */
function shareUrl(raw: string, base?: string): URL | null {
  try {
    const url = new URL(raw, base);
    if (!isImgbbShareLink(url.href) || url.username || url.password || url.port || !SHARE_PATH.test(url.pathname)) return null;
    return new URL(`https://${url.hostname}${url.pathname}`);
  } catch {
    return null;
  }
}

async function readLimited(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let html = '', bytes = 0;
  while (bytes < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    html += decoder.decode(value, { stream: true });
  }
  await reader.cancel();
  return html;
}

async function fetchSharePage(start: URL): Promise<string | null> {
  let url = start;
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(url, { redirect: 'manual', signal, headers: { Accept: 'text/html' }, cache: 'no-store' });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      const next = shareUrl(response.headers.get('location') ?? '', url.href);
      if (!next) return null;
      url = next;
      continue;
    }
    if (response.ok) return readLimited(response);
    await response.body?.cancel();
    return null;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const target = shareUrl(request.nextUrl.searchParams.get('url') ?? '');
  if (!target) return NextResponse.json({ error: 'Only ibb.co share links can be resolved.' }, { status: 400 });

  try {
    const html = await fetchSharePage(target);
    const image = html ? extractImgbbImage(html) : null;
    if (image) return NextResponse.json({ url: image });
  } catch (error) {
    console.error('ImgBB lookup failed:', error);
  }
  return NextResponse.json({ error: IMGBB_DIRECT_LINK_HELP }, { status: 422 });
}
