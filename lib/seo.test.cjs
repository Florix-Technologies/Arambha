const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const load = file => stripTypeScriptTypes(readFileSync(`${__dirname}/${file}`, 'utf8').replace(/^import .*;$/gm, '').replace(/export /g, ''));
const context = vm.createContext({ URL, SITE_URL: 'https://example.test' });
['slug.ts', 'imageUtils.ts', 'seo.ts'].forEach(file => vm.runInContext(load(file), context));
const run = code => vm.runInContext(code, context);

const product = { id: '6e91dc4e-0000-4000-8000-000000000000', name: 'Premium Kitchen!', description: 'x'.repeat(60), image_url: 'https://a.test/k.jpg', images: [], price: null };

test('product URLs carry a readable name and the first 8 id characters', () => {
  context.p = product;
  assert.equal(run("productPath('interiors', 'kitchen', p)"), '/interiors/kitchen/premium-kitchen-6e91dc4e');
});

test('thin products stay out of search results', () => {
  context.p = product;
  assert.equal(run('isIndexableProduct(p)'), true);
  context.p = { ...product, description: 'short' };
  assert.equal(run('isIndexableProduct(p)'), false);
  context.p = { ...product, image_url: null, images: [] };
  assert.equal(run('isIndexableProduct(p)'), false);
});

test('product JSON-LD only exists for a real price and never invents availability', () => {
  context.p = product;
  assert.equal(run("productJsonLd('interiors', { name: 'Kitchen', slug: 'kitchen' }, p)"), null);
  context.p = { ...product, price: 1200 };
  const ld = JSON.parse(JSON.stringify(run("productJsonLd('interiors', { name: 'Kitchen', slug: 'kitchen' }, p)")));
  assert.deepEqual([ld.offers.price, ld.offers.priceCurrency, 'availability' in ld.offers, 'aggregateRating' in ld], [1200, 'INR', false, false]);
});

test('subcategory titles and descriptions come from real data and honour manual overrides', () => {
  context.products = [product, { ...product, name: 'Second' }];
  const meta = run("subcategoryMeta('interiors', { name: 'Kitchen', slug: 'kitchen' }, products)");
  assert.equal(meta.title, 'Kitchen Designs – Interiors in Bangalore');
  assert.match(meta.description, /^Explore 2 Kitchen designs by Arambha Design & Interior Studio, Bangalore, including Premium Kitchen!, Second/);
  assert.ok(meta.description.length <= 160);
  const custom = run("subcategoryMeta('interiors', { name: 'Kitchen', slug: 'kitchen', seo_title: '  Mine ' }, products)");
  assert.equal(custom.title, 'Mine');
});
