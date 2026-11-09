import { test as base, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

// Admin performance measurement on REAL catalog data, read-only. Skipped unless LIVE_READONLY=1 with the public
// LIVE_SUPABASE_URL / LIVE_SUPABASE_ANON_KEY (process env only). Same fake login and GET-only proxy as live-readonly.spec.ts.
// Writes PERF_OUT (JSON). Run: PERF_PROD=1 npx playwright test perf --project=chromium-1280 (after `npm run build`).
const PORT = process.env.E2E_PORT ?? '3100';
const LIVE = process.env.LIVE_SUPABASE_URL ?? '';
const KEY = process.env.LIVE_SUPABASE_ANON_KEY ?? '';
const OUT = process.env.PERF_OUT ?? 'perf-admin.json';
const mock = `http://127.0.0.1:${PORT}/mock-supabase`;
const user = { id: 'perf', aud: 'authenticated', role: 'authenticated', email: 'perf@example.test', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

const test = base.extend<{ blocked: string[] }>({
    blocked: async ({ page }, provide) => {
        const blocked: string[] = [];
        let signedIn = false;
        await page.route(`${mock}/auth/v1/**`, async route => {
            const { pathname } = new URL(route.request().url());
            if (pathname.endsWith('/token')) { signedIn = true; await route.fulfill({ json: { access_token: 'perf', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'perf', user } }); }
            else if (pathname.endsWith('/user')) await route.fulfill({ status: signedIn ? 200 : 401, json: signedIn ? user : { message: 'No session' } });
            else await route.fulfill({ status: 204, body: '' });
        });
        await page.route(`${mock}/rest/v1/**`, async route => {
            const request = route.request();
            if (request.method() !== 'GET' && request.method() !== 'HEAD') { blocked.push(`${request.method()} ${request.url()}`); await route.abort(); return; }
            const response = await route.fetch({ url: request.url().replace(mock, LIVE), headers: { ...request.headers(), apikey: KEY, authorization: `Bearer ${KEY}` } }).catch(() => null);
            if (response) await route.fulfill({ response }).catch(() => undefined); else await route.abort().catch(() => undefined);
        });
        await page.route(`${mock}/storage/v1/**`, async route => { blocked.push(`${route.request().method()} ${route.request().url()}`); await route.abort(); });
        await provide(blocked);
        expect(blocked, 'no write may leave the browser').toEqual([]);
    },
});

const loading = (page: Page) => page.getByRole('status').filter({ hasText: /^Loading|^Checking/ });
const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Navigation' }).first();

test('admin performance (live, read-only)', async ({ page, blocked }, info) => {
    test.skip(!process.env.LIVE_READONLY || !LIVE || !KEY || info.project.name !== 'chromium-1280', 'Set LIVE_READONLY=1, LIVE_SUPABASE_URL and LIVE_SUPABASE_ANON_KEY');
    test.setTimeout(300_000);
    void blocked;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    const urls = new Map<string, string>();
    let supabase = 0, bytes = 0, mediaBytes = 0, media = 0;
    let kinds: Record<string, number> = {};
    cdp.on('Network.requestWillBeSent', e => { urls.set(e.requestId, e.request.url); if (e.request.url.startsWith(mock)) { supabase++; const kind = `${e.request.method} ${new URL(e.request.url).pathname.replace('/mock-supabase/', '')}`; kinds[kind] = (kinds[kind] ?? 0) + 1; } });
    cdp.on('Network.loadingFinished', e => {
        bytes += e.encodedDataLength;
        if (/\.(png|jpe?g|webp|gif|avif|mp4|mov|webm)(\?|#|$)/i.test(urls.get(e.requestId) ?? '')) { mediaBytes += e.encodedDataLength; media++; }
    });
    const results: Record<string, unknown>[] = [];
    // done = main content visible and no "Loading…"/"Checking…" status left; then wait for the network to go quiet.
    async function step(name: string, action: () => Promise<unknown>, ready: () => Promise<unknown>) {
        supabase = bytes = mediaBytes = media = 0; kinds = {};
        const start = Date.now();
        await action();
        await ready();
        await expect(loading(page)).toHaveCount(0, { timeout: 60_000 });
        const visibleMs = Date.now() - start;
        await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => undefined);
        results.push({ step: name, supabaseRequests: supabase, supabaseByEndpoint: kinds, mediaRequests: media, bytesTotal: bytes, bytesMedia: mediaBytes, msToContentAndNoLoading: visibleMs, msToNetworkIdle: Date.now() - start });
    }
    await page.goto('/admin/login');
    await page.getByLabel('Email', { exact: true }).fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill('not-a-real-password');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.getByRole('table', { name: 'Catalog', exact: true })).toBeVisible();
    await expect(loading(page)).toHaveCount(0, { timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => undefined);

    const overview = () => expect(page.getByRole('table', { name: 'Catalog', exact: true })).toBeVisible({ timeout: 60_000 });
    // Main content = the page heading AND its first list item (a skeleton alone does not count).
    const content = (name: string, item: string) => async () => {
        await expect(page.getByRole('heading', { level: 1, name })).toBeVisible({ timeout: 60_000 });
        await expect(page.locator(item).first()).toBeVisible({ timeout: 60_000 });
    };
    const list = 'main ul a';
    // Cold loads (full page load each).
    await step('cold Overview', () => page.goto('/admin'), overview);
    await step('cold Interiors', () => page.goto('/admin/interiors'), content('Interiors', list));
    await step('cold Media Library', () => page.goto('/admin/media'), content('Media Library', list));
    // Journey (client-side navigation, like an owner clicking around).
    await step('journey Overview', () => page.goto('/admin'), overview);
    await step('journey Interiors', () => sidebar(page).getByRole('link', { name: 'Interiors', exact: true }).click(), content('Interiors', list));
    await step('journey Subcategory page', () => page.locator('main ul a').first().click(), () => expect(page.getByRole('table').getByRole('link', { name: /^Edit / }).first()).toBeVisible({ timeout: 60_000 }));
    await step('journey Product form', () => page.getByRole('table').getByRole('link', { name: /^Edit / }).first().click(), () => expect(page.getByLabel('Product name', { exact: true })).not.toHaveValue('', { timeout: 60_000 }));
    await step('journey Media Library', () => sidebar(page).getByRole('link', { name: 'Media Library', exact: true }).click(), content('Media Library', list));
    writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), build: process.env.PERF_PROD ? 'production' : 'dev', results }, null, 2));
});
