import { test, expect, login, nav, png, publicUrl, mock } from './fixture';

const ROUTES = ['/admin', '/admin/furniture', '/admin/interiors', '/admin/interiors/int-kitchen', '/admin/gallery/gal-kitchen', '/admin/products/new', '/admin/products/product-1', '/admin/media', '/admin/settings', '/admin/help'];
const tiles = (page: import('@playwright/test').Page) => page.getByRole('list', { name: 'Photos and videos', exact: true }).locator('li');

test('every admin route redirects to login when logged out', async ({ page }) => {
    for (const route of ROUTES) {
        await page.goto(route);
        await expect(page).toHaveURL('/admin/login');
        await expect(page.getByRole('heading', { level: 1, name: 'Log in to Arambha Admin' })).toBeVisible();
    }
});

test('login and Overview counts match the data', async ({ page, fake }) => {
    await login(page);
    expect(fake.signedIn).toBe(true);
    const table = page.getByRole('table', { name: 'Catalog', exact: true });
    const rows = table.locator('tbody tr');
    for (const [index, name, subs, products] of [[0, 'Furniture', 2, 3], [1, 'Interiors', 2, 2], [2, 'Gallery', 1, 1]] as const) {
        await expect(rows.nth(index).getByRole('link', { name, exact: true })).toBeVisible();
        await expect(rows.nth(index).getByRole('cell').nth(0)).toHaveText(String(subs));
        await expect(rows.nth(index).getByRole('cell').nth(1)).toHaveText(String(products));
    }
    await expect(table.locator('tfoot td').nth(0)).toHaveText('5');
    await expect(table.locator('tfoot td').nth(1)).toHaveText('6');
    await expect(page.getByRole('link', { name: 'Add product', exact: true }).first()).toHaveAttribute('href', '/admin/products/new');
    // Recently added: newest first.
    await expect(page.getByRole('heading', { name: 'Recently added' })).toBeVisible();
    await expect(page.locator('ul li a', { hasText: 'Broken photo chair' }).first()).toBeVisible();
});

test('Needs attention lists the broken photo and the empty subcategory', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: '1 product with a missing or broken photo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /1 subcategory is empty/ })).toBeVisible();
    const attention = page.locator('section', { has: page.getByRole('heading', { name: /broken photo/ }) });
    await expect(attention.getByRole('link', { name: /Broken photo chair/ })).toHaveAttribute('href', '/admin/products/product-6');
    await expect(page.locator('section', { has: page.getByRole('heading', { name: /is empty/ }) }).getByRole('link', { name: /Wardrobes/ })).toHaveAttribute('href', '/admin/interiors/wardrobes');
    await page.goto('/admin/media');
    await page.getByLabel('Show', { exact: true }).selectOption('problems');
    await expect(page.getByRole('link', { name: /Broken photo chair/ })).toBeVisible();
});

test('navigation marks the active page and Back/Forward keep it right', async ({ page }) => {
    await login(page);
    const current = () => nav(page).locator('[aria-current="page"]');
    await expect(current()).toHaveText('Overview');
    await nav(page).getByRole('link', { name: 'Interiors', exact: true }).click();
    await expect(page).toHaveURL('/admin/interiors');
    await expect(current()).toHaveText('Interiors');
    await nav(page).getByRole('link', { name: 'Gallery', exact: true }).click();
    await expect(page).toHaveURL('/admin/gallery');
    await expect(current()).toHaveText('Gallery');
    await page.goBack();
    await expect(page).toHaveURL('/admin/interiors');
    await expect(current()).toHaveText('Interiors');
    await page.goForward();
    await expect(page).toHaveURL('/admin/gallery');
    await expect(current()).toHaveText('Gallery');
    // A subcategory page keeps its main category active.
    await page.goto('/admin/interiors/int-kitchen');
    await expect(current()).toHaveText('Interiors');
});

test('Interiors: add and edit a subcategory', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/interiors');
    await expect(page.getByRole('button', { name: 'Add subcategory', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Add subcategory', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Add subcategory to Interiors');
    await dialog.getByLabel(/Subcategory name/).fill('Lounges');
    await dialog.getByRole('button', { name: 'Add subcategory', exact: true }).click();
    await expect(page).toHaveURL('/admin/interiors/new-1');
    expect(fake.writes).toEqual([{ table: 'categories', method: 'POST', id: null, payload: [{ name: 'Lounges', slug: 'lounges', collection: 'interiors' }] }]);
    await expect(page.getByRole('heading', { level: 1, name: 'Lounges' })).toBeVisible();

    await page.goto('/admin/interiors');
    await page.getByRole('button', { name: 'Edit Lounges', exact: true }).click();
    await page.getByRole('dialog').getByLabel(/Subcategory name/).fill('Lounge');
    await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Lounge 0 products/ })).toBeVisible();
    expect(fake.writes[1]).toMatchObject({ table: 'categories', method: 'PATCH', id: 'eq.new-1', payload: { name: 'Lounge' } });

    expect(fake.writes).toHaveLength(2);
});

test('deleting a subcategory with products moves them first; nothing is ever lost', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/interiors/int-kitchen');
    await page.getByRole('main').getByRole('button', { name: 'More', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Delete subcategory' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Kitchen has 2 products');
    await expect(dialog.getByRole('button', { name: 'Move 2 and delete' })).toBeDisabled();
    await dialog.getByLabel('Move products to').selectOption({ label: 'Wardrobes' });
    await dialog.getByRole('button', { name: 'Move 2 and delete' }).click();
    await expect(page).toHaveURL('/admin/interiors');
    expect(fake.writes.map(w => `${w.method} ${w.table}`)).toEqual(['PATCH products', 'DELETE categories']);
    expect(fake.writes[0].payload).toEqual({ category_id: 'wardrobes' });
    expect(fake.categories.map(c => c.id)).not.toContain('int-kitchen');
    expect(fake.products).toHaveLength(6);
    expect(fake.products.filter(p => p.category_id === 'wardrobes')).toHaveLength(2);
});

test('an empty subcategory deletes after confirmation; a product added meanwhile blocks it', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/interiors');
    await page.getByRole('button', { name: 'Delete Wardrobes', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('It has no products');
    // Another tab adds a product after the dialog opened: the delete must be refused, not cascade.
    fake.products.push({ ...fake.products[2], id: 'late', category_id: 'wardrobes' });
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(dialog).toContainText('Move them first');
    expect(fake.categories.map(c => c.id)).toContain('wardrobes');
    fake.products = fake.products.filter(p => p.id !== 'late');
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(fake.categories.map(c => c.id)).not.toContain('wardrobes');
    expect(fake.writes.filter(w => w.method === 'DELETE')).toHaveLength(1);
});

test('Interiors > Kitchen shows only its own products', async ({ page }) => {
    await login(page);
    await page.goto('/admin/interiors');
    await page.getByRole('link', { name: /^Kitchen\b/ }).click();
    await expect(page).toHaveURL('/admin/interiors/int-kitchen');
    await expect(page.getByRole('heading', { level: 1, name: 'Kitchen', exact: true })).toBeVisible();
    const table = page.getByRole('table', { name: 'Products', exact: true });
    await expect(table.locator('tbody td:nth-child(2)')).toHaveText(['Modular kitchen B', 'Modular kitchen A']);
    await expect(page.getByText('Kitchen project')).toHaveCount(0); // Gallery > Kitchen
    await expect(page.getByText('Oak chair')).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: '2 products' })).toBeVisible();
    await page.getByLabel('Search products', { exact: true }).fill('kitchen b');
    await expect(table.locator('tbody td:nth-child(2)')).toHaveText(['Modular kitchen B']);
});

test('Add product from Kitchen preselects Interiors + Kitchen and saves with its category_id', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/interiors/int-kitchen');
    await page.getByRole('link', { name: 'Add product', exact: true }).click();
    await expect(page).toHaveURL('/admin/products/new?category=interiors&subcategory=int-kitchen');
    await expect(page.getByLabel('Main category', { exact: true })).toHaveValue('interiors');
    await expect(page.getByLabel('Subcategory', { exact: true })).toHaveValue('int-kitchen');
    await expect(page.getByText('Interiors › Kitchen').first()).toBeVisible();
    await page.getByLabel('Product name', { exact: true }).fill('Island kitchen');
    await page.getByLabel('Description', { exact: true }).fill('With island');
    await page.getByLabel(/^Price/).fill('99000');
    await page.getByLabel('Upload photos or videos', { exact: true }).setInputFiles(png('island.png'));
    await expect(tiles(page)).toHaveCount(1);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL('/admin/interiors/int-kitchen');
    const object = fake.objects[0];
    expect(fake.writes).toEqual([{ table: 'products', method: 'POST', id: null, payload: [{ category_id: 'int-kitchen', image_url: publicUrl(object), images: [], name: 'Island kitchen', description: 'With island', price: 99000 }] }]);
    await expect(page.getByRole('table', { name: 'Products', exact: true }).getByRole('link', { name: 'Island kitchen', exact: true })).toBeVisible();
});

test('uploading files sends a storage upload, shows Cover, and Make cover reorders', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/products/new?category=furniture&subcategory=chairs');
    await page.getByLabel('Upload photos or videos', { exact: true }).setInputFiles([png('first.png'), png('second.png')]);
    await expect(tiles(page)).toHaveCount(2);
    await expect(tiles(page).first()).toContainText('Cover');
    expect(fake.objects).toHaveLength(2);
    for (const object of fake.objects) {
        expect(object.path).toMatch(/\/catalog-media\/uploads\/[\da-f-]+\.(png|webp|jpg)$/);
        expect(object.bytes.length).toBeGreaterThan(0);
        expect(object.headers).toMatchObject({ 'x-upsert': 'false', authorization: 'Bearer fake-access-token' });
    }
    const [one, two] = fake.objects.map(publicUrl);
    await expect(tiles(page).first().locator('img')).toHaveAttribute('src', one);
    await tiles(page).nth(1).getByRole('button', { name: 'Make cover', exact: true }).click();
    await expect(tiles(page).first().locator('img')).toHaveAttribute('src', two);
    await expect(tiles(page).first()).toContainText('Cover');
    await expect(tiles(page).nth(1).locator('img')).toHaveAttribute('src', one);
    await page.getByLabel('Product name', { exact: true }).fill('Two photo chair');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL('/admin/furniture/chairs');
    expect(fake.writes[0].payload).toEqual([expect.objectContaining({ category_id: 'chairs', image_url: two, images: [one], name: 'Two photo chair' })]);
});

test('add from a link instead adds a tile', async ({ page }) => {
    await login(page);
    await page.goto('/admin/products/new?category=furniture');
    await page.getByText('Add from a link instead').click();
    await page.getByLabel('Image or video link', { exact: true }).fill(`${mock}/storage/v1/object/public/catalog-media/linked.png`);
    await page.getByRole('button', { name: 'Add link', exact: true }).click();
    await expect(tiles(page)).toHaveCount(1);
});

test('edit persists name and an empty price as null', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/products/product-1');
    await page.getByLabel('Product name', { exact: true }).fill('Updated oak chair');
    await page.getByLabel(/^Price/).fill('');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
    expect(fake.writes).toEqual([expect.objectContaining({ table: 'products', method: 'PATCH', id: 'eq.product-1', payload: expect.objectContaining({ name: 'Updated oak chair', price: null }) })]);
    await page.reload();
    await expect(page.getByLabel('Product name', { exact: true })).toHaveValue('Updated oak chair');
    await expect(page.getByLabel(/^Price/)).toHaveValue('');
});

test('move a product to another subcategory', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/interiors/int-kitchen');
    await page.getByRole('button', { name: 'Move Modular kitchen A', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Move Modular kitchen A' });
    await expect(dialog.getByRole('button', { name: 'Move', exact: true })).toBeDisabled();
    await dialog.getByLabel('Move to subcategory').selectOption({ label: 'Wardrobes' });
    await dialog.getByRole('button', { name: 'Move', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(fake.writes).toEqual([{ table: 'products', method: 'PATCH', id: 'in.(product-3)', payload: { category_id: 'wardrobes' } }]);
    expect(fake.products.find(p => p.id === 'product-3')!.category_id).toBe('wardrobes');
    await expect(page.getByRole('link', { name: 'Modular kitchen A' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Modular kitchen B', exact: true })).toBeVisible();
});

test('delete a product needs confirmation', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/interiors/int-kitchen');
    await page.getByRole('button', { name: 'Delete Modular kitchen B', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Delete', exact: true });
    await expect(dialog).toContainText("Delete Modular kitchen B? This can't be undone.");
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    expect(fake.writes).toEqual([]);
    await page.getByRole('button', { name: 'Delete Modular kitchen B', exact: true }).click();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Modular kitchen B' })).toHaveCount(0);
    expect(fake.writes).toEqual([{ table: 'products', method: 'DELETE', id: 'eq.product-4', payload: null }]);
    expect(fake.products.some(p => p.id === 'product-4')).toBe(false);
});

test('gallery subcategory upload saves one item per file', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/gallery/gal-kitchen');
    await page.getByLabel('Upload photos or videos', { exact: true }).setInputFiles(png('shot.png'));
    await expect(page.getByRole('table', { name: 'Products', exact: true }).getByRole('link', { name: 'shot.png', exact: true })).toBeVisible();
    expect(fake.objects).toHaveLength(1);
    expect(fake.writes).toHaveLength(1);
    expect(fake.writes[0]).toMatchObject({ table: 'products', method: 'POST', payload: [expect.objectContaining({ category_id: 'gal-kitchen', image_url: publicUrl(fake.objects[0]) })] });
});

for (const denial of ['zero', '42501'] as const) {
    test(`permission denied (${denial}) shows an error and keeps the edit`, async ({ page, fake }) => {
        await login(page);
        await page.goto('/admin/products/product-1');
        await page.getByLabel('Product name', { exact: true }).fill('Forbidden edit');
        fake.denied = denial;
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        // Exclude Next.js's empty route announcer, which also has role="alert".
        await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('This account is not allowed to make changes. Log in with the admin account.');
        await expect(page.getByLabel('Product name', { exact: true })).toHaveValue('Forbidden edit');
        expect(fake.products[0].name).toBe('Oak chair');
    });
}

test('permission denied when adding a subcategory', async ({ page, fake }) => {
    await login(page);
    await page.goto('/admin/interiors');
    await page.getByRole('button', { name: 'Add subcategory', exact: true }).click();
    await page.getByRole('dialog').getByLabel(/Subcategory name/).fill('Bedrooms');
    fake.denied = '42501';
    await page.getByRole('dialog').getByRole('button', { name: 'Add subcategory', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('This account is not allowed to make changes.');
    expect(fake.categories.some(c => c.name === 'Bedrooms')).toBe(false);
});

test('no horizontal overflow on any admin screen', async ({ page }) => {
    await login(page);
    for (const route of ROUTES) {
        await page.goto(route);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
        await expect(page.getByText(/^Loading/)).toHaveCount(0);
        const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
        expect(scroll, `${route} scrollWidth`).toBeLessThanOrEqual(width);
    }
});

test('log out returns to login and protects the admin again', async ({ page, fake }) => {
    await login(page);
    await page.getByRole('button', { name: /^Account/ }).click();
    await page.getByRole('menuitem', { name: 'Log out', exact: true }).click();
    await expect(page).toHaveURL('/admin/login');
    expect(fake.signedIn).toBe(false);
    await page.goto('/admin/interiors');
    await expect(page).toHaveURL('/admin/login');
});
