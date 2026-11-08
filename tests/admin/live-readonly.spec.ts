import { test as base, expect, type Page } from '@playwright/test';

// Owner review on REAL catalog data, read-only. Runs only with LIVE_READONLY=1 plus the project's public URL and
// public anon key in LIVE_SUPABASE_URL / LIVE_SUPABASE_ANON_KEY (process env only, never committed).
// Login is faked; catalog reads (GET/HEAD) are proxied to the live project; every other request to it is blocked,
// so nothing can be written. Run: npx playwright test live-readonly --project=chromium-1280
const PORT = process.env.E2E_PORT ?? '3100';
const LIVE = process.env.LIVE_SUPABASE_URL ?? '';
const KEY = process.env.LIVE_SUPABASE_ANON_KEY ?? '';
const OUT = process.env.DEMO_DIR ?? 'C:/Users/RAJ/AppData/Local/Temp/claude/39420d9cdc6bcb4b/bda300b1-ae2d-4d6b-b9d9-669763fc23e8/scratchpad/demo';
const mock = `http://127.0.0.1:${PORT}/mock-supabase`;
const user = { id: 'owner-review', aud: 'authenticated', role: 'authenticated', email: 'owner-review@example.test', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

const test = base.extend<{ blocked: string[] }>({
    blocked: async ({ page }, provide) => {
        const blocked: string[] = [];
        let signedIn = false;
        await page.route(`${mock}/auth/v1/**`, async route => {
            const { pathname } = new URL(route.request().url());
            if (pathname.endsWith('/token')) { signedIn = true; await route.fulfill({ json: { access_token: 'review', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'review', user } }); }
            else if (pathname.endsWith('/user')) await route.fulfill({ status: signedIn ? 200 : 401, json: signedIn ? user : { message: 'No session' } });
            else await route.fulfill({ status: 204, body: '' });
        });
        await page.route(`${mock}/rest/v1/**`, async route => {
            const request = route.request();
            if (request.method() !== 'GET' && request.method() !== 'HEAD') { blocked.push(`${request.method()} ${request.url()}`); await route.abort(); return; }
            const response = await route.fetch({ url: request.url().replace(mock, LIVE), headers: { ...request.headers(), apikey: KEY, authorization: `Bearer ${KEY}` } });
            await route.fulfill({ response });
        });
        await page.route(`${mock}/storage/v1/**`, async route => { blocked.push(`${route.request().method()} ${route.request().url()}`); await route.abort(); });
        await provide(blocked);
        expect(blocked, 'no write may leave the browser').toEqual([]);
    },
});

async function settle(page: Page) {
    await expect(page.getByRole('status').filter({ hasText: /^Loading|^Checking/ })).toHaveCount(0, { timeout: 30_000 });
    await page.waitForTimeout(1500);
}

for (const [name, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]] as const) {
    test(`live read-only screenshots (${name})`, async ({ page, blocked }, info) => {
        test.skip(!process.env.LIVE_READONLY || !LIVE || !KEY || info.project.name !== 'chromium-1280', 'Set LIVE_READONLY=1, LIVE_SUPABASE_URL and LIVE_SUPABASE_ANON_KEY');
        test.setTimeout(180_000);
        void blocked;
        await page.setViewportSize(viewport);
        const shot = (file: string) => page.screenshot({ path: `${OUT}/live-${name}-${file}.png`, fullPage: true });
        await page.goto('/admin/login');
        await page.getByLabel('Email', { exact: true }).fill(user.email);
        await page.getByLabel('Password', { exact: true }).fill('not-a-real-password');
        await page.getByRole('button', { name: 'Log in', exact: true }).click();
        await expect(page.getByRole('table', { name: 'Catalog', exact: true })).toBeVisible();
        await settle(page); await shot('1-overview');

        await page.goto('/admin/interiors'); await settle(page); await shot('2-interiors');
        await page.getByRole('link', { name: /^Aluminium Interior/ }).click(); await settle(page); await shot('3-aluminium-products');
        await page.goto('/admin/interiors');
        await page.getByRole('link', { name: /^Kitchen Designs/ }).click(); await settle(page); await shot('4-kitchen-designs');
        await page.getByRole('link', { name: 'Add product', exact: true }).first().click();
        await expect(page.getByLabel('Subcategory', { exact: true })).not.toHaveValue('');
        await settle(page); await shot('5-add-product-from-kitchen');

        await page.goto('/admin/gallery'); await settle(page); await shot('6-gallery');
        await page.getByRole('link', { name: /^Kitchen/ }).click(); await settle(page); await shot('7-gallery-kitchen');
        await page.goto('/admin/media'); await settle(page); await shot('8-media-library');
        await page.goto('/admin/interiors');
        await page.getByRole('link', { name: /^Aluminium Interior/ }).click();
        await page.locator('a', { hasText: 'Aluminium Glass Partition Wall' }).first().click();
        await expect(page.getByLabel('Product name', { exact: true })).toHaveValue('Aluminium Glass Partition Wall');
        await settle(page); await shot('9-edit-product');
    });
}
