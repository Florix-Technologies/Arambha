import { NextResponse, type NextRequest } from 'next/server';

/**
 * Old ?filter=<slug> links (Google, bookmarks, the previous menu) move permanently to /{collection}/<slug>;
 * ?filter=all goes to the main page. A next.config redirect cannot do this: it keeps the query string, so
 * filter=all would redirect to itself forever. Other query parameters (utm tags) are kept.
 */
export function proxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;
  const filter = searchParams.get('filter');
  if (filter === null) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.searchParams.delete('filter');
  if (filter !== 'all' && /^[a-z0-9-]+$/.test(filter)) url.pathname = `${pathname}/${filter}`;
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ['/interiors', '/furniture', '/gallery'] };
