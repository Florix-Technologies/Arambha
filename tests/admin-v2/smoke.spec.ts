import { test as base, expect } from '@playwright/test';
import { CATEGORIES, TERMS } from '../../lib/admin/taxonomy';
import { SAMPLE } from '../../lib/admin/mockData';

const test = base.extend<{ browserSafety: void }>({
    browserSafety: [async ({ page, context, baseURL }, use) => {
        const errors: string[] = [];
        const externalRequests: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await context.route('**/*', async route => {
            const url = new URL(route.request().url());
            if (url.origin !== new URL(baseURL!).origin) {
                externalRequests.push(`${url.origin}${url.pathname}`);
                await route.abort();
            } else if (url.pathname.startsWith('/mock-supabase')) {
                await route.fulfill({ status: 401, json: { message: 'No preview session' } });
            } else {
                await route.continue();
            }
        });
        await use();
        expect(externalRequests, 'Unexpected external requests').toEqual([]);
        expect(errors, 'Console errors and uncaught exceptions').toEqual([]);
    }, { auto: true }],
});

for (const path of ['', '/furniture', '/interiors', '/gallery', '/products/new']) {
    test(`unauthenticated ${path || '/'} redirects to login`, async ({ page }) => {
        await page.goto(`/admin-v2${path}`);
        await expect(page).toHaveURL('/admin-v2/login');
        await expect(page.getByRole('heading', { name: TERMS.loginTitle, exact: true })).toBeVisible();
        await expect(page.getByLabel(TERMS.email, { exact: true })).toBeVisible();
        await expect(page.getByLabel(TERMS.password, { exact: true })).toBeVisible();
        await expect(page.getByRole('navigation')).toHaveCount(0);
    });
}

const screens = [
    ['', TERMS.dashboard],
    ['/furniture', CATEGORIES.furniture.label],
    ['/interiors', CATEGORIES.interiors.label],
    ['/gallery', CATEGORIES.gallery.label],
    ['/interiors/aluminium-interior', SAMPLE.aluminium],
    ['/interiors/wooden-interior', SAMPLE.wooden],
    ['/gallery/kitchen', SAMPLE.kitchen],
    ['/products/new', SAMPLE.partition],
    ['/login', TERMS.loginTitle],
] as const;

for (const [path, heading] of screens) {
    test(`preview ${path || '/'} renders without overflow`, async ({ page }) => {
        await page.goto(`/admin-preview${path}`);
        await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
        await expect(page.getByRole('main')).toBeVisible();
        if (path !== '/login') {
            await expect(page.getByRole('navigation', { name: TERMS.navigation })).toBeVisible();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
}

test('navigation works using Tab, Shift+Tab and Enter', async ({ page }) => {
    await page.goto('/admin-preview');
    const navigation = page.getByRole('navigation', { name: TERMS.navigation });
    const dashboard = navigation.getByRole('link', { name: TERMS.dashboard, exact: true });
    const furniture = navigation.getByRole('link', { name: CATEGORIES.furniture.label, exact: true });
    // Reach the sidebar or mobile bottom navigation using only the keyboard.
    for (let step = 0; step < 40; step++) {
        await page.keyboard.press('Tab');
        if (await dashboard.evaluate(element => element === document.activeElement)) break;
    }
    await expect(dashboard).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(furniture).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dashboard).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/admin-preview/furniture');
    await expect(page.getByRole('heading', { level: 1, name: CATEGORIES.furniture.label, exact: true })).toBeVisible();
    await expect(furniture).toHaveAttribute('aria-current', 'page');
});
