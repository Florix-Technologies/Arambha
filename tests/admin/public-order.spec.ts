import { test, expect } from '@playwright/test';

// WhatsApp ordering on the real public pages, read-only: links are inspected, never followed, so no message is sent.
// Run against a server showing the live catalog, e.g. a local `next start` on 3200:
//   PUBLIC_BASE=http://127.0.0.1:3200 npx playwright test public-order
const BASE = process.env.PUBLIC_BASE ?? '';
const SITE = 'https://www.arambhainteriorstudio.com';
const ORDER = 'Order Now on WhatsApp';
const messageOf = (href: string | null) => new URL(href ?? '').searchParams.get('text') ?? '';

test.skip(!BASE, 'Set PUBLIC_BASE to a server with the live catalog');
test.use({ baseURL: BASE });

for (const collection of ['interiors', 'furniture'] as const) {
  test(`every ${collection} product card and product page orders on WhatsApp with its own details`, async ({ page }) => {
    await page.goto(`/${collection}`);
    const subcategories = await page.locator(`main a[href^="/${collection}/"]`).evaluateAll((links, c) =>
      [...new Set(links.map(a => a.getAttribute('href') ?? '').filter(h => new RegExp(`^/${c}/[^/]+$`).test(h)))], collection);

    for (const sub of subcategories) {
      await page.goto(sub);
      const subName = (await page.locator('h1').innerText()).trim();
      const cards = page.locator('main article');
      const products: Array<{ path: string; message: string }> = [];
      for (const card of await cards.all()) {
        const order = card.getByRole('link', { name: ORDER });
        await expect(order).toBeVisible();
        await expect(order).toHaveAttribute('target', '_blank');
        const href = await order.getAttribute('href');
        expect(href).toMatch(/^https:\/\/wa\.me\/919187628243\?text=[^\s]+$/);
        const path = (await card.locator('a').first().getAttribute('href')) ?? '';
        const name = (await card.getByRole('heading').innerText()).trim();
        const message = messageOf(href);
        expect(message).toContain(`Product: ${name}\n`);
        expect(message).toContain(`Category: ${collection[0].toUpperCase()}${collection.slice(1)} / ${subName}\n`);
        expect(message).toContain(`Product Link: ${SITE}${path}\n`);
        expect(message).not.toMatch(/undefined|null|NaN/);
        products.push({ path, message });
      }
      expect(products.length, `${sub} lists products`).toBeGreaterThan(0);

      for (const { path, message } of products) {
        await page.goto(path);
        const order = page.getByRole('link', { name: ORDER });
        await expect(order).toHaveCount(1);
        await expect(order).toBeVisible();
        expect(messageOf(await order.getAttribute('href'))).toBe(message);
        const price = await page.locator('main').getByText(/^₹ [\d,]+$/).first().textContent().catch(() => null);
        if (price) expect(message).toContain(`Price: ${price}\n`);
        else expect(message).not.toContain('Price:');
        await expect(page.getByRole('link', { name: /^WhatsApp$/ })).toHaveCount(0);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
      }
    }
  });
}

test('gallery photos are not products: no order buttons there', async ({ page }) => {
  await page.goto('/gallery/kitchen-gallery');
  await expect(page.getByRole('link', { name: ORDER })).toHaveCount(0);
});
