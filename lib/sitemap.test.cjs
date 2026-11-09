const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
// Next's own serializer, so the test checks the exact XML that production serves.
const { resolveRouteData } = require('next/dist/build/webpack/loaders/metadata/resolve-route-data');

const load = file => stripTypeScriptTypes(readFileSync(`${__dirname}/${file}`, 'utf8').replace(/^import [\s\S]*?;$/gm, '').replace(/export /g, ''));
const context = vm.createContext({ URL, Date, SITE_URL: 'https://www.example.test' });
['slug.ts', 'imageUtils.ts', 'seo.ts', 'sitemap.ts'].forEach(file => vm.runInContext(load(file), context));

/** Minimal strict well-formedness check: valid entities only, no stray '<', every tag closed in order. */
function assertWellFormedXml(xml) {
  const body = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
  const bad = body.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/);
  assert.equal(bad, null, `unescaped '&' near: ${bad && body.slice(Math.max(0, bad.index - 40), bad.index + 40)}`);
  const stack = [];
  for (const [, close, name, self] of body.matchAll(/<(\/?)([\w:.-]+)[^<>]*?(\/?)>/g)) {
    if (self) continue;
    if (close) assert.equal(stack.pop(), name, `mismatched </${name}>`);
    else stack.push(name);
  }
  assert.deepEqual(stack, []);
  assert.equal(body.replace(/<(\/?)([\w:.-]+)[^<>]*?(\/?)>/g, '').includes('<'), false, "stray '<' in text");
}

const product = (over = {}) => ({
  id: '6e91dc4e-0000-4000-8000-000000000000', name: 'Premium Aluminium Kitchen', created_at: '2026-01-01T00:00:00Z',
  description: 'A modular kitchen with an aluminium framework, soft-close shutters and a quartz worktop.', price: null,
  image_url: 'https://cdn.example.test/k.jpg?w=500&h=500&fit=crop', images: ['https://x.test/a b/<odd>"\'.jpg', '/local photo.jpg'], ...over,
});
const categories = [
  { id: 'c1', name: 'Aluminium & Glass', slug: 'aluminium-glass', collection: 'interiors', products: [product()] },
  { id: 'c2', name: 'Sofas', slug: 'sofas', collection: 'furniture', products: [product({ id: '11111111-0000-4000-8000-000000000000', name: 'Thin', description: 'short' })] },
  { id: 'c3', name: 'Empty', slug: 'empty', collection: 'interiors', products: [] },
  { id: 'c4', name: 'Odd', slug: 'odd', collection: 'admin', products: [product()] },
];

test('sitemap with query strings and special characters is well-formed XML', () => {
  context.cats = categories;
  const xml = resolveRouteData(vm.runInContext("buildSitemap(cats, 'https://www.example.test')", context), 'sitemap');
  assertWellFormedXml(xml);
  assert.ok(xml.includes('<image:loc>https://cdn.example.test/k.jpg?w=500&amp;h=500&amp;fit=crop</image:loc>'));
  assert.ok(xml.includes('https://x.test/a%20b/%3Codd%3E%22&apos;.jpg'), 'spaces and brackets percent-encoded, quote escaped');
  assert.ok(xml.includes('<image:loc>https://www.example.test/local%20photo.jpg</image:loc>'), 'relative media made absolute');
});

test('sitemap lists public pages only: no admin/api, no empty or unknown collections, no thin products', () => {
  context.cats = categories;
  const locs = [...resolveRouteData(vm.runInContext("buildSitemap(cats, 'https://www.example.test')", context), 'sitemap')
    .matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1].replace('https://www.example.test', '') || '/');
  assert.deepEqual(locs, ['/', '/services', '/contact', '/interiors', '/furniture',
    '/interiors/aluminium-glass', '/interiors/aluminium-glass/premium-aluminium-kitchen-6e91dc4e', '/furniture/sofas']);
  assert.ok(!locs.some(l => /admin|api/.test(l)));
});

test('the checker itself rejects the live bug', () => {
  assert.throws(() => assertWellFormedXml('<a><b>https://x.test/?w=1&h=2</b></a>'));
  assert.doesNotThrow(() => assertWellFormedXml('<a><b>https://x.test/?w=1&amp;h=2</b></a>'));
});

test('stock photos are never offered to search engines, but a product with real text is still indexed', () => {
  const stockOnly = product({ id: '22222222-0000-4000-8000-000000000000', name: 'Stock', image_url: 'https://images.unsplash.com/photo-1?w=500&h=500', images: [] });
  context.cats = [{ id: 'c1', name: 'Kitchens', slug: 'kitchens', collection: 'interiors', products: [stockOnly, product()] }];
  const xml = resolveRouteData(vm.runInContext("buildSitemap(cats, 'https://www.example.test')", context), 'sitemap');
  assertWellFormedXml(xml);
  assert.ok(!xml.includes('unsplash'));
  assert.ok(xml.includes('<loc>https://www.example.test/interiors/kitchens/stock-22222222</loc>'));
  context.p = stockOnly;
  assert.equal(vm.runInContext('isIndexableProduct(p)', context), true);
  assert.equal(vm.runInContext("productMeta('interiors', { name: 'Kitchens', slug: 'kitchens' }, p).openGraph.images[0].url", context), '/og-default.jpg');
});

test('gallery titles name the room and the city without doubling "Interior"', () => {
  assert.equal(vm.runInContext("subcategoryMeta('gallery', { name: 'Kitchen', slug: 'k' }, []).title", context), 'Kitchen Interior Photos – Bangalore Projects');
  assert.equal(vm.runInContext("subcategoryMeta('gallery', { name: 'Complete House Interior', slug: 'c' }, []).title", context), 'Complete House Interior Photos – Bangalore Projects');
});
