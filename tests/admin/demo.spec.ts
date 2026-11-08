import { test, expect, login, nav, png } from './fixture';

// Owner demo screenshots on the fake Supabase. Only runs with DEMO=1 (npx playwright test demo --project=chromium-1280).
const OUT = process.env.DEMO_DIR ?? 'C:/Users/RAJ/AppData/Local/Temp/claude/39420d9cdc6bcb4b/bda300b1-ae2d-4d6b-b9d9-669763fc23e8/scratchpad/demo';

for (const [name, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]] as const) {
    test(`demo screenshots (${name})`, async ({ page }, info) => {
        test.skip(!process.env.DEMO || info.project.name !== 'chromium-1280', 'Set DEMO=1 and run the chromium-1280 project');
        await page.setViewportSize(viewport);
        const shot = (file: string) => page.screenshot({ path: `${OUT}/${name}-${file}.png`, fullPage: true });
        const settle = async () => { await expect(page.getByText(/^Loading/)).toHaveCount(0); await expect(page.getByRole('status').filter({ hasText: /^Checking/ })).toHaveCount(0); await page.waitForTimeout(400); };
        await login(page);

        await page.goto('/admin/interiors');
        await expect(page.getByRole('button', { name: 'Edit Kitchen', exact: true })).toBeVisible();
        await settle();
        await shot('a-interiors');

        await page.getByRole('button', { name: 'Add subcategory', exact: true }).click();
        await page.getByRole('dialog').getByLabel(/Subcategory name/).fill('Bedrooms');
        await shot('b-add-subcategory');
        await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();

        await page.getByRole('link', { name: /^Kitchen\b/ }).click();
        await expect(page).toHaveURL('/admin/interiors/int-kitchen');
        await expect(page.getByRole('table', { name: 'Products', exact: true })).toBeVisible();
        await settle();
        await shot('c-kitchen');

        await page.getByRole('link', { name: 'Add product', exact: true }).click();
        await expect(page.getByLabel('Subcategory', { exact: true })).toHaveValue('int-kitchen');
        await settle();
        await shot('d-add-product');

        await page.getByLabel('Product name', { exact: true }).fill('Island kitchen');
        await page.getByLabel('Upload photos or videos', { exact: true }).setInputFiles([png('island-front.png'), png('island-side.png')]);
        await expect(page.getByRole('list', { name: 'Photos and videos', exact: true }).locator('li')).toHaveCount(2);
        await settle();
        await shot('e-product-photos');

        await page.goto('/admin');
        await expect(page.getByRole('table', { name: 'Catalog', exact: true })).toBeVisible();
        await settle();
        await shot('f-overview');

        if (name === 'mobile') {
            await nav(page).getByRole('button', { name: 'More', exact: true }).click();
            await expect(page.getByRole('menuitem', { name: 'Media Library' })).toBeVisible();
            await shot('g-more-menu');
            await page.keyboard.press('Escape');
        }

        await page.goto('/admin/interiors');
        await page.getByRole('button', { name: 'Delete Kitchen', exact: true }).click();
        await expect(page.getByRole('dialog')).toContainText('Deleting subcategories is switched off');
        await shot('h-delete-subcategory');
    });
}
