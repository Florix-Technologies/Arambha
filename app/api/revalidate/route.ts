import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase';

// Same account the database policies trust (supabase_setup.sql).
const ADMIN_EMAIL = 'admin@arambhainteriorstudio.com';
const MAX_PATHS = 100;

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } }).auth.getUser(token);
  if (error || data.user?.email?.toLowerCase() !== ADMIN_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null) as { paths?: unknown } | null;
  const paths = body?.paths;
  if (!Array.isArray(paths) || paths.length > MAX_PATHS || !paths.every(p => typeof p === 'string' && /^\/(?!\/)[^\s?#]{0,300}$/.test(p) && !p.startsWith('/admin') && !p.startsWith('/api'))) {
    return NextResponse.json({ error: 'paths must be an array of site paths' }, { status: 400 });
  }

  const unique = [...new Set([...(paths as string[]), '/sitemap.xml'])];
  // 'layout' also refreshes every page below the path (subcategory and product pages).
  unique.forEach(path => revalidatePath(path, 'layout'));
  return NextResponse.json({ revalidated: unique });
}
