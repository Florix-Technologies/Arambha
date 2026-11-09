const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');

const context = vm.createContext({ URL, Number });
vm.runInContext(stripTypeScriptTypes(readFileSync(`${__dirname}/whatsapp.ts`, 'utf8').replace(/export /g, '')), context);
const run = code => vm.runInContext(code, context);
const decode = url => decodeURIComponent(new URL(url).searchParams.get('text') === null ? '' : url.split('?text=')[1]);

test('order link goes to the verified Arambha number with the real product details', () => {
  context.d = { product: 'Premium Aluminium Kitchen System', collection: 'Interiors', category: 'Aluminium Interior', price: 125000,
    url: 'https://www.arambhainteriorstudio.com/interiors/aluminium-interior/premium-aluminium-kitchen-system-6e91dc4e' };
  const url = run('whatsappUrl(productOrderMessage(d))');
  assert.ok(url.startsWith('https://wa.me/919187628243?text='));
  assert.equal(decode(url), [
    'Hello Arambha Design & Interior Studio,', '', 'I would like to enquire about ordering this product:', '',
    'Product: Premium Aluminium Kitchen System', 'Category: Interiors / Aluminium Interior', 'Price: ₹ 1,25,000',
    'Product Link: https://www.arambhainteriorstudio.com/interiors/aluminium-interior/premium-aluminium-kitchen-system-6e91dc4e',
    '', 'Please share availability and the next steps for placing my order.', '', 'Thank you.',
  ].join('\n'));
});

test('no price line when the product has no price; special characters stay intact and encoded', () => {
  for (const price of [null, 0, undefined]) {
    context.d = { product: 'Sofa & Chair "Set" #1 100%', collection: 'Furniture', category: 'Living + Dining', price, url: 'https://www.example.test/furniture/x/y?a=1&b=2' };
    const url = run('whatsappUrl(productOrderMessage(d))');
    const query = url.split('?text=')[1];
    assert.doesNotMatch(query, /[&#?\s"+]/, 'reserved characters are percent-encoded');
    const text = decode(url);
    assert.ok(!text.includes('Price:'));
    assert.ok(text.includes('Product: Sofa & Chair "Set" #1 100%'));
    assert.ok(text.includes('Category: Furniture / Living + Dining'));
    assert.ok(text.includes('Product Link: https://www.example.test/furniture/x/y?a=1&b=2'));
  }
});
