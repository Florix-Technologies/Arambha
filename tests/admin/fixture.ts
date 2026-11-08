import { test as base, expect, type Page } from '@playwright/test';
import { deflateSync } from 'node:zlib';

export type Product = { id: string; category_id: string; name: string; description: string; image_url: string; images: string[]; price: number | null; created_at: string };
export type Category = { id: string; name: string; slug: string; collection: 'furniture' | 'interiors' | 'gallery' };
export type Write = { table: string; method: string; payload: unknown; id: string | null };
export const origin = 'http://127.0.0.1:3100';
export const mock = `${origin}/mock-supabase`;
export const credentials = { email: 'admin@example.test', password: 'fake-browser-test-password' };
const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: credentials.email, app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

// Small solid-colour PNG, so screenshots show distinct tiles. The colour comes from the file name.
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf: Buffer) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type: string, data: Buffer) {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0); body.copy(out, 4); out.writeUInt32BE(crc(body), body.length + 4);
    return out;
}
export function makePng(seed: string, size = 160) {
    let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const [r, g, b] = [90 + (h & 127), 90 + ((h >> 7) & 127), 90 + ((h >> 14) & 127)];
    const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: size }, () => [r, g, b]).flat())]);
    const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header.set([8, 2, 0, 0, 0], 8);
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(Buffer.concat(Array(size).fill(row)))), chunk('IEND', Buffer.alloc(0))]);
}
export const png = (name: string) => ({ name, mimeType: 'image/png', buffer: makePng(name, 600) });
const media = (name: string) => `${mock}/storage/v1/object/public/catalog-media/${name}`;

export const categories: Category[] = [
    { id: 'chairs', name: 'Chairs', slug: 'chairs', collection: 'furniture' },
    { id: 'tables', name: 'Tables', slug: 'tables', collection: 'furniture' },
    { id: 'int-kitchen', name: 'Kitchen', slug: 'kitchen', collection: 'interiors' },
    { id: 'wardrobes', name: 'Wardrobes', slug: 'wardrobes', collection: 'interiors' },
    { id: 'gal-kitchen', name: 'Kitchen', slug: 'kitchen', collection: 'gallery' },
];
function fakeData() {
    const p = (n: number, category_id: string, name: string, image: string, price: number | null): Product =>
        ({ id: `product-${n}`, category_id, name, description: `${name} description`, image_url: media(image), images: [], price, created_at: `2026-01-0${n}T00:00:00Z` });
    return {
        categories: categories.map(c => ({ ...c })),
        products: [
            p(1, 'chairs', 'Oak chair', 'oak.png', 4500), p(2, 'tables', 'Dining table', 'table.png', 18000),
            p(3, 'int-kitchen', 'Modular kitchen A', 'kitchen-a.png', 250000), p(4, 'int-kitchen', 'Modular kitchen B', 'kitchen-b.png', null),
            p(5, 'gal-kitchen', 'Kitchen project', 'gallery-k.png', null), p(6, 'chairs', 'Broken photo chair', 'broken.png', 3000),
        ],
        writes: [] as Write[],
        objects: [] as { path: string; bytes: Buffer; headers: Record<string, string>; type: string }[],
        denied: null as 'zero' | '42501' | null,
        signedIn: false,
        nextId: 1,
    };
}
export type Fake = ReturnType<typeof fakeData>;

export const test = base.extend<{ fake: Fake }>({
    fake: [async ({ page, context }, use) => {
        const fake = fakeData();
        const unexpected: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        // Expected noise: the deliberate 403 of the denial tests and the intentionally broken image.
        page.on('console', message => {
            const text = message.text(), url = message.location().url;
            if (message.type() !== 'error') return;
            if (fake.denied && /status of 403/.test(text)) return;
            if (/status of 404/.test(text) && /broken\.png/.test(url)) return;
            errors.push(text);
        });
        // Block every external browser request, including an accidentally configured real backend.
        await context.route('**/*', async route => {
            const url = new URL(route.request().url());
            if (url.origin !== origin || url.pathname.startsWith('/mock-supabase')) {
                unexpected.push(route.request().url());
                await route.abort();
            } else await route.continue();
        });
        await page.route(`${mock}/auth/v1/**`, async route => {
            const request = route.request();
            const url = new URL(request.url());
            if (url.pathname.endsWith('/token') && request.method() === 'POST') {
                expect(request.postDataJSON()).toMatchObject(credentials);
                fake.signedIn = true;
                await route.fulfill({ json: { access_token: 'fake-access-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'fake-refresh-token', user } });
            } else if (url.pathname.endsWith('/user') && request.method() === 'GET') {
                await route.fulfill({ status: fake.signedIn ? 200 : 401, json: fake.signedIn ? user : { message: 'No session' } });
            } else if (url.pathname.endsWith('/logout') && request.method() === 'POST') {
                fake.signedIn = false;
                await route.fulfill({ status: 204, body: '' });
            } else {
                unexpected.push(request.url());
                await route.fulfill({ status: 400, json: { message: 'Unexpected auth request' } });
            }
        });
        await page.route(`${mock}/rest/v1/**`, async route => {
            const request = route.request();
            const url = new URL(request.url());
            const table = url.pathname.split('/').at(-1) as 'categories' | 'products';
            expect(['categories', 'products']).toContain(table);
            const rows = (table === 'categories' ? fake.categories : fake.products) as Record<string, unknown>[];
            const matches = (row: Record<string, unknown>) => Array.from(url.searchParams).every(([key, value]) => {
                if (value.startsWith('eq.')) return String(row[key]) === value.slice(3);
                if (value.startsWith('in.(')) return value.slice(4, -1).split(',').includes(String(row[key]));
                return true;
            });
            const selected = rows.filter(matches);
            const method = request.method();
            if (method === 'GET' || method === 'HEAD') {
                const single = request.headers().accept?.includes('application/vnd.pgrst.object+json');
                const range = `${selected.length ? `0-${selected.length - 1}` : '*'}/${selected.length}`;
                await route.fulfill({ json: single ? selected[0] ?? null : selected, headers: { 'content-range': range } });
                return;
            }
            expect(fake.signedIn).toBe(true);
            expect(request.headers().authorization).toBe('Bearer fake-access-token');
            const payload = request.postData() ? request.postDataJSON() : null;
            fake.writes.push({ table, method, payload, id: url.searchParams.get('id') });
            if (fake.denied) {
                await route.fulfill(fake.denied === 'zero' ? { json: [] } : { status: 403, json: { code: '42501', message: 'new row violates row-level security policy' } });
                return;
            }
            let changed: Record<string, unknown>[] = [];
            if (method === 'POST') {
                changed = (payload as object[]).map(values => ({ ...values, id: `new-${fake.nextId++}`, created_at: '2026-11-08T00:00:00Z' }));
                rows.push(...changed);
            } else if (method === 'PATCH') {
                changed = selected;
                changed.forEach(row => Object.assign(row, payload));
            } else if (method === 'DELETE') {
                changed = selected;
                // ON DELETE RESTRICT (docs/admin-v2-restrict-category-delete.sql): a subcategory with products is refused.
                if (table === 'categories' && fake.products.some(row => changed.some(c => c.id === row.category_id))) {
                    await route.fulfill({ status: 409, json: { code: '23503', message: 'update or delete on table "categories" violates foreign key constraint' } });
                    return;
                }
                const kept = rows.filter(row => !matches(row));
                if (table === 'categories') fake.categories = kept as Category[]; else fake.products = kept as Product[];
            } else unexpected.push(`${method} ${request.url()}`);
            await route.fulfill({ status: method === 'POST' ? 201 : 200, json: changed.map(row => ({ id: row.id })) });
        });
        await page.route(`${mock}/storage/v1/**`, async route => {
            const request = route.request();
            const path = new URL(request.url()).pathname;
            if (request.method() === 'POST' && path.startsWith('/mock-supabase/storage/v1/object/catalog-media/uploads/')) {
                fake.objects.push({ path, bytes: request.postDataBuffer()!, headers: request.headers(), type: request.headers()['content-type'] });
                await route.fulfill({ json: { Key: path, Id: 'storage-object' } });
            } else if (request.method() === 'GET' && path.includes('/object/public/catalog-media/')) {
                const stored = fake.objects.find(o => o.path === path.replace('/object/public/', '/object/'));
                if (path.endsWith('/broken.png')) await route.fulfill({ status: 404, body: 'not found' });
                else await route.fulfill(stored ? { contentType: stored.type, body: stored.bytes } : { contentType: 'image/png', body: makePng(path.split('/').at(-1)!) });
            } else {
                unexpected.push(request.url());
                await route.abort();
            }
        });
        await use(fake);
        expect(unexpected, 'Unmocked or external requests').toEqual([]);
        expect(errors, 'Uncaught browser errors').toEqual([]);
    }, { auto: true }],
});
export { expect };

export const publicUrl = (object: { path: string }) => `${origin}${object.path.replace('/object/', '/object/public/')}`;
export async function login(page: Page) {
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin/login');
    await page.getByLabel('Email', { exact: true }).fill(credentials.email);
    await page.getByLabel('Password', { exact: true }).fill(credentials.password);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL('/admin');
    await expect(page.getByRole('table', { name: 'Catalog', exact: true })).toBeVisible();
}
export const nav = (page: Page) => page.getByRole('navigation', { name: 'Navigation', exact: true });
