import { test as base, expect, type Page } from '@playwright/test';
import { TERMS } from '../../lib/admin/taxonomy';

type Product = { id: string; category_id: string; name: string; description: string; image_url: string; images: string[]; price: number | null; created_at: string };
const origin = 'http://127.0.0.1:3100';
const mock = `${origin}/mock-supabase`;
const credentials = { email: 'admin@example.test', password: 'fake-browser-test-password' };
const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: credentials.email, app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0uoAAAAASUVORK5CYII=', 'base64');
const categories = [
    { id: 'chairs', name: 'Chairs', slug: 'chairs', collection: 'furniture' },
    { id: 'tables', name: 'Tables', slug: 'tables', collection: 'furniture' },
    { id: 'partitions', name: 'Partitions', slug: 'partitions', collection: 'interiors' },
    { id: 'kitchens', name: 'Kitchens', slug: 'kitchens', collection: 'gallery' },
];
function fakeData() {
    return {
        products: categories.map((category, index): Product => ({ id: `product-${index}`, category_id: category.id, name: ['Oak chair', 'Dining table', 'Office partition', 'Kitchen project'][index], description: 'Seed description', image_url: `${mock}/storage/v1/object/public/catalog-media/seed.png`, images: [], price: index === 3 ? null : 100 + index, created_at: `2026-01-0${index + 1}T00:00:00Z` })),
        writes: [] as { method: string; payload: unknown; id: string | null }[],
        objects: [] as { path: string; bytes: Buffer; headers: Record<string, string> }[],
        denied: null as 'zero' | '42501' | null,
        signedIn: false,
    };
}
type Fake = ReturnType<typeof fakeData>;
const test = base.extend<{ fake: Fake }>({
    fake: [async ({ page, context }, use) => {
        const fake = fakeData();
        const unexpected: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        // Console errors fail the test too, except the browser's own log line for the deliberate 403 in the denial test.
        page.on('console', message => {
            if (message.type() === 'error' && !(fake.denied && /status of 403/.test(message.text()))) errors.push(message.text());
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
                expect(url.searchParams.get('grant_type')).toBe('password');
                expect(request.postDataJSON()).toMatchObject(credentials);
                fake.signedIn = true;
                await route.fulfill({ json: { access_token: 'fake-access-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'fake-refresh-token', user } });
            } else if (url.pathname.endsWith('/user') && request.method() === 'GET') {
                expect(request.headers().authorization).toBe('Bearer fake-access-token');
                await route.fulfill({ status: fake.signedIn ? 200 : 401, json: fake.signedIn ? user : { message: 'No session' } });
            } else {
                unexpected.push(request.url());
                await route.fulfill({ status: 400, json: { message: 'Unexpected auth request' } });
            }
        });
        await page.route(`${mock}/rest/v1/**`, async route => {
            const request = route.request();
            const url = new URL(request.url());
            const table = url.pathname.split('/').at(-1);
            expect(['categories', 'products']).toContain(table);
            const rows = table === 'categories' ? categories : fake.products;
            const matches = (row: object) => Array.from(url.searchParams).every(([key, value]) => !value.startsWith('eq.') || String(row[key as keyof typeof row]) === value.slice(3));
            const selected = rows.filter(matches);
            if (request.method() === 'GET') {
                const single = request.headers().accept?.includes('application/vnd.pgrst.object+json');
                await route.fulfill({ json: single ? selected[0] ?? null : selected });
                return;
            }
            expect(fake.signedIn).toBe(true);
            expect(request.headers().authorization).toBe('Bearer fake-access-token');
            expect(table).toBe('products');
            const payload = request.postData() ? request.postDataJSON() : null;
            fake.writes.push({ method: request.method(), payload, id: url.searchParams.get('id') });
            if (fake.denied) {
                await route.fulfill(fake.denied === 'zero' ? { json: [] } : { status: 403, json: { code: '42501', message: 'new row violates row-level security policy' } });
                return;
            }
            let changed: Product[] = [];
            if (request.method() === 'POST') {
                expect(Array.isArray(payload)).toBe(true);
                changed = payload.map((values: object) => ({ ...values, id: `created-${fake.writes.length}`, created_at: '2026-11-08T00:00:00Z' }));
                fake.products.push(...changed);
            } else if (request.method() === 'PATCH') {
                changed = fake.products.filter(matches);
                changed.forEach(row => Object.assign(row, payload));
            } else if (request.method() === 'DELETE') {
                changed = fake.products.filter(matches);
                fake.products = fake.products.filter(row => !matches(row));
            } else unexpected.push(`${request.method()} ${request.url()}`);
            await route.fulfill({ status: request.method() === 'POST' ? 201 : 200, json: changed.map(row => ({ id: row.id })) });
        });
        await page.route(`${mock}/storage/v1/**`, async route => {
            const request = route.request();
            const path = new URL(request.url()).pathname;
            if (request.method() === 'POST' && path.startsWith('/mock-supabase/storage/v1/object/catalog-media/uploads/')) {
                fake.objects.push({ path, bytes: request.postDataBuffer()!, headers: request.headers() });
                await route.fulfill({ json: { Key: path, Id: 'storage-object' } });
            } else if (request.method() === 'GET' && path.includes('/object/public/catalog-media/')) {
                await route.fulfill({ contentType: 'image/png', body: png });
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
async function login(page: Page) {
    await page.goto('/admin-v2');
    await expect(page).toHaveURL('/admin-v2/login');
    await page.getByLabel(TERMS.email, { exact: true }).fill(credentials.email);
    await page.getByLabel(TERMS.password, { exact: true }).fill(credentials.password);
    await page.getByRole('button', { name: TERMS.logIn, exact: true }).click();
    await expect(page).toHaveURL('/admin-v2');
    await expect(page.getByRole('table', { name: TERMS.catalog, exact: true })).toBeVisible();
}
async function fillProduct(page: Page) {
    await page.getByLabel(TERMS.productName, { exact: true }).fill('Walnut chair');
    await page.getByLabel(TERMS.description, { exact: true }).fill('Handmade walnut chair');
    await page.getByLabel(TERMS.price, { exact: true }).fill('1234.50');
    await page.getByLabel(TERMS.featuredImage, { exact: true }).fill(`${mock}/storage/v1/object/public/catalog-media/front.png`);
    await page.getByLabel('Additional media URLs', { exact: true }).fill('/side.png\n/back.png');
    await page.getByLabel(TERMS.subcategory, { exact: true }).selectOption('chairs');
}
const expectedValues = { category_id: 'chairs', name: 'Walnut chair', description: 'Handmade walnut chair', price: 1234.5, image_url: `${mock}/storage/v1/object/public/catalog-media/front.png`, images: ['/side.png', '/back.png'] };

test.beforeEach(async ({}, info) => {
    test.skip(info.project.name !== 'chromium-1280' && !(info.project.name === 'chromium-360' && info.title === 'create product with exact payload'), 'Desktop flows plus mobile product creation');
});

test('login and dashboard catalog totals', async ({ page, fake }) => {
    await login(page);
    expect(fake.signedIn).toBe(true);
    const table = page.getByRole('table', { name: TERMS.catalog, exact: true });
    for (const [name, subs, products] of [['Furniture', 2, 2], ['Interiors', 1, 1], ['Gallery', 1, 1], ['Total', 4, 4]] as const) {
        await expect(table.getByRole('row').filter({ has: page.getByRole('rowheader', { name, exact: true }) }).getByRole('cell')).toHaveText([String(subs), String(products)]);
    }
});

test('collections and subcategories list seeded products', async ({ page, fake }) => {
    await login(page);
    for (const category of categories) {
        const product = fake.products.find(row => row.category_id === category.id)!;
        await page.goto(`/admin-v2/${category.collection}`);
        await expect(page.getByRole('table', { name: TERMS.products, exact: true }).getByRole('row').filter({ hasText: product.name })).toBeVisible();
        await page.getByRole('link', { name: category.name, exact: true }).click();
        await expect(page.getByRole('heading', { level: 1, name: category.name, exact: true })).toBeVisible();
        if (category.collection === 'gallery') await expect(page.getByRole('button', { name: `Media details: ${product.name}`, exact: true })).toBeVisible();
        else await expect(page.getByRole('table', { name: TERMS.products, exact: true }).getByRole('row').filter({ hasText: product.name })).toBeVisible();
    }
});

test('create product with exact payload', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin-v2/products/new');
    await fillProduct(page);
    await page.getByRole('button', { name: TERMS.save, exact: true }).click();
    await expect(page).toHaveURL('/admin-v2/products/created-1');
    expect(fake.writes).toEqual([{ method: 'POST', payload: [expectedValues], id: null }]);
    await page.getByRole('link', { name: 'Back to catalog', exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Walnut chair' })).toBeVisible();
    await page.getByRole('link', { name: 'Chairs', exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Walnut chair' })).toBeVisible();
});

test('edit persists name and price including an empty price as null', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin-v2/products/product-0');
    await page.getByLabel(TERMS.productName, { exact: true }).fill('Updated oak chair');
    await page.getByLabel(TERMS.price, { exact: true }).fill('999.25');
    await page.getByRole('button', { name: TERMS.save, exact: true }).click();
    await expect(page.getByRole('button', { name: TERMS.save, exact: true })).toHaveCount(0);
    expect(fake.products[0]).toMatchObject({ name: 'Updated oak chair', price: 999.25 });
    expect(fake.writes[0]).toMatchObject({ method: 'PATCH', id: 'eq.product-0', payload: { name: 'Updated oak chair', price: 999.25 } });
    await page.reload();
    await expect(page.getByLabel(TERMS.productName, { exact: true })).toHaveValue('Updated oak chair');
    await expect(page.getByLabel(TERMS.price, { exact: true })).toHaveValue('999.25');
    await page.getByLabel(TERMS.price, { exact: true }).fill('');
    await page.getByRole('button', { name: TERMS.save, exact: true }).click();
    await expect(page.getByRole('button', { name: TERMS.save, exact: true })).toHaveCount(0);
    expect(fake.products[0].price).toBeNull();
    expect(fake.writes[1]).toMatchObject({ method: 'PATCH', payload: { price: null } });
    await page.reload();
    await expect(page.getByLabel(TERMS.price, { exact: true })).toHaveValue('');
});

test('delete requires confirmation and removes the product', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin-v2/furniture');
    await page.getByRole('button', { name: 'Delete Oak chair', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: TERMS.delete, exact: true });
    await expect(dialog).toContainText("Delete Oak chair? This can't be undone.");
    expect(fake.writes).toEqual([]);
    await dialog.getByRole('button', { name: TERMS.discard, exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Oak chair' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete Oak chair', exact: true }).click();
    await dialog.getByRole('button', { name: TERMS.delete, exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('row').filter({ hasText: 'Oak chair' })).toHaveCount(0);
    expect(fake.products.some(row => row.id === 'product-0')).toBe(false);
    expect(fake.writes).toEqual([{ method: 'DELETE', id: 'eq.product-0', payload: null }]);
    await page.reload();
    await expect(page.getByRole('table', { name: TERMS.products, exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Oak chair' })).toHaveCount(0);
});

test('gallery image upload stores bytes without upsert and appears in grid', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin-v2/gallery/kitchens');
    await page.getByLabel(TERMS.uploadMedia, { exact: true }).setInputFiles({ name: 'kitchen.png', mimeType: 'image/png', buffer: png });
    await expect(page.getByRole('button', { name: 'Media details: kitchen.png', exact: true })).toBeVisible();
    expect(fake.objects).toHaveLength(1);
    const object = fake.objects[0];
    expect(object.path).toMatch(/\/catalog-media\/uploads\/[\da-f-]+\.(png|webp|jpg)$/);
    expect(object.bytes.length).toBeGreaterThan(0);
    expect(object.headers).toMatchObject({ 'x-upsert': 'false', authorization: 'Bearer fake-access-token', apikey: 'preview-only-placeholder' });
    const publicUrl = `${origin}${object.path.replace('/object/', '/object/public/')}`;
    expect(fake.writes).toEqual([{ method: 'POST', id: null, payload: [{ category_id: 'kitchens', name: 'kitchen.png', description: 'image', image_url: publicUrl, images: [], price: null }] }]);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Media details: kitchen.png', exact: true })).toBeVisible();
});

for (const denial of ['zero', '42501'] as const) {
    test(`permission denied (${denial}) keeps edits and persisted data unchanged`, async ({ page, fake }) => {
        await login(page);
        await page.goto('/admin-v2/products/product-0');
        await page.getByLabel(TERMS.productName, { exact: true }).fill('Forbidden edit');
        fake.denied = denial;
        await page.getByRole('button', { name: TERMS.save, exact: true }).click();
        // Exclude Next.js's empty route announcer, which also has role="alert".
        await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('This account is not allowed to make changes. Log in with the admin account.');
        await expect(page.getByLabel(TERMS.productName, { exact: true })).toHaveValue('Forbidden edit');
        await expect(page).toHaveURL('/admin-v2/products/product-0');
        expect(fake.writes).toHaveLength(1);
        expect(fake.products[0].name).toBe('Oak chair');
    });
}

