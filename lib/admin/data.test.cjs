const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const source = readFileSync(`${__dirname}/data.ts`, 'utf8').replace(/^import .*;$/gm, '').replace(/export /g, '');
const context = vm.createContext({ URL, TERMS: { productName: 'Product name', price: 'Price', subcategory: 'Subcategory' } });
// data.ts imports the slug helpers; load the real ones so duplicate detection is tested, not stubbed.
const strip = file => stripTypeScriptTypes(readFileSync(`${__dirname}/${file}`, 'utf8').replace(/^import .*;$/gm, '').replace(/export /g, ''));
vm.runInContext(strip('../slug.ts'), context);
context.CATEGORIES = { furniture: { label: 'Furniture' } };
vm.runInContext(stripTypeScriptTypes(source), context);
test('media addresses reject executable and protocol-relative URLs', () => {
  for (const url of ['/chair.jpg', 'https://example.com/chair.jpg']) assert.equal(context.validateMediaUrl(url), null);
  for (const url of ['', '//example.com/a', 'javascript:alert(1)', 'data:text/html,test']) assert.ok(context.validateMediaUrl(url));
});

test('create and update reject expired sessions before any database query', async () => {
  context.supabase = {
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    from: () => { assert.fail('Unauthenticated save must not query products'); },
  };
  const input = { name: 'Chair', category_id: 'c', description: '', price: '', image_url: '/chair.jpg', images: [] };
  assert.match((await context.createProduct(input)).error, /not allowed to make changes/);
  assert.match((await context.updateProduct('p', input)).error, /not allowed to make changes/);
});
test('names and prices reject invalid input and accept optional or zero price', () => {
  assert.ok(context.validateName('  '));
  assert.equal(context.validateName('Chair'), null);
  for (const price of ['', ' ', 0, '0', '12.50']) assert.equal(context.validatePrice(price), null);
  for (const price of [-1, '-2', 'abc', Infinity, NaN, null]) assert.ok(context.validatePrice(price));
});
test('row mapping preserves nullable fields and uses existing UI semantics', () => {
  const row = { id: 'p', name: 'Chair', category_id: 'c', image_url: null, description: null, price: null, created_at: '2026-01-01' };
  const mapped = context.mapProduct(row, { id: 'c', name: 'Chairs', category: 'furniture' });
  assert.equal(mapped.subcategory, 'Chairs');
  assert.equal(mapped.price, undefined);
  assert.equal(mapped.status, 'active');
  assert.equal(mapped.date, row.created_at);
});
// Product-count query used by deleteCategory: select(..., { count, head }).eq('category_id', id).
// The safety-migration probe (select seo_title) succeeds: the database refuses unsafe deletes.
const protectedCats = { select: () => ({ limit: async () => ({ error: null }) }) };
const emptyCount = (count = 0) => ({ select: () => ({ eq: async () => ({ count, error: null }) }) });
test('mutation errors catch RLS denials and rejected requests without a database', async () => {
  const auth = { getUser: async () => ({ data: { user: { id: 'admin' } }, error: null }) };
  context.supabase = { auth, from: () => ({ ...protectedCats, delete: () => ({ eq: () => ({ select: async () => ({ data: [], error: null }) }) }) }) };
  assert.match((await context.deleteProduct('p')).error, /not allowed to make changes/);
  context.supabase = { auth, from: table => table === 'products' ? emptyCount() : { ...protectedCats, delete: () => ({ eq: () => ({ select: async () => ({ data: null, error: { code: '42501', message: 'denied' } }) }) }) } };
  assert.match((await context.deleteCategory('c')).error, /not allowed to make changes/);
  context.supabase = { auth, from: () => { throw new Error('offline'); } };
  assert.equal((await context.deleteProduct('p')).error, 'offline');
  assert.equal((await context.deleteProduct('')).error, 'An ID is required');
});

test('product deletion rejects expired sessions before querying products', async () => {
  context.supabase = {
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    from: () => { assert.fail('Unauthenticated deletion must not query products'); },
  };
  assert.match((await context.deleteProduct('p')).error, /not allowed to make changes/);
});

test('product deletion returns the deleted ID after verified authentication', async () => {
  context.supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'admin' } }, error: null }) },
    from: table => {
      assert.equal(table, 'products');
      return { ...protectedCats, delete: () => ({ eq: (column, id) => {
        assert.equal(column, 'id');
        assert.equal(id, 'p');
        return { select: async () => ({ data: [{ id }], error: null }) };
      } }) };
    },
  };
  assert.equal((await context.deleteProduct('p')).data, 'p');
});

test('verified saves preserve all media, zero price and nullable price', async () => {
  const input = { name: ' Chair ', category_id: 'c', description: ' Soft ', price: '0', image_url: '/chair.jpg', images: ['/side.jpg', '/back.jpg'] };
  let payload;
  const selected = { select: async () => ({ data: [{ id: 'p' }], error: null }) };
  context.supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'admin' } }, error: null }) },
    from: () => ({
      insert: rows => { payload = rows[0]; return selected; },
      update: row => { payload = row; return { eq: (column, id) => { assert.equal(column, 'id'); assert.equal(id, 'p'); return selected; } }; },
    }),
  };
  assert.equal((await context.createProduct(input)).data, 'p');
  assert.equal(payload.name, 'Chair');
  assert.equal(payload.description, 'Soft');
  assert.equal(payload.price, 0);
  assert.deepEqual(Array.from(payload.images), input.images);
  assert.equal((await context.updateProduct('p', { ...input, price: '' })).data, 'p');
  assert.equal(payload.price, null);
  assert.deepEqual(Array.from(payload.images), input.images);
});

test('edit loading keeps raw media and reports missing products', async () => {
  const row = { id: 'p', category_id: 'c', images: ['/one.jpg', '/two.jpg'], price: 0 };
  context.supabase = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }) }) };
  assert.equal((await context.getProduct('p')).data, row);
  context.supabase = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) };
  assert.equal((await context.getProduct('missing')).error, 'Product not found');
});

test('product lists include every capped page in stable order and surface later errors', async () => {
  const rows = Array.from({ length: 1005 }, (_, i) => ({ id: `p${i}`, name: `Product ${i}`, created_at: '2026-01-01', category_id: 'c' }));
  context.categoryFromParam = value => value === 'furniture';
  let failLater = false;
  const ranges = [], orders = [];
  context.supabase = { from(table) {
    let offset = 0;
    const query = {
      select() { return this; }, eq() { return this; },
      order(column, options) { orders.push([column, options.ascending]); return this; },
      range(from, to) { offset = from; ranges.push([from, to]); return this; },
      then(resolve, reject) {
        return Promise.resolve(table === 'categories'
          ? { data: [{ id: 'c', name: 'Chairs', collection: 'furniture' }], error: null }
          : failLater && offset > 0 ? { data: null, error: { message: 'page failed' } }
          : { data: rows.slice(offset, offset + 1000), error: null }).then(resolve, reject);
      }
    };
    return query;
  } };
  const result = await context.listProducts('furniture');
  assert.equal(result.error, null);
  assert.deepEqual(Array.from(result.data, row => row.id), rows.map(row => row.id));
  assert.deepEqual(ranges.map(range => range[0]), [0, 1000]);
  assert.deepEqual(orders, Array.from({ length: 2 }, () => [['created_at', false], ['id', false]]).flat());
  failLater = true;
  const failed = await context.listProducts('furniture', 'c');
  assert.equal(failed.data, null);
  assert.equal(failed.error, 'page failed');
});

test('category writes reject expired sessions before database access', async () => {
  context.categoryFromParam = value => value === 'furniture';
  context.supabase = {
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    from: () => assert.fail('Unauthenticated category write must not query the database'),
  };
  assert.match((await context.renameCategory({ id: 'c', category: 'furniture' }, 'Chairs')).error, /not allowed to make changes/);
  assert.match((await context.deleteCategory('c')).error, /not allowed to make changes/);
});

test('product lists reuse supplied categories, including an empty list', async () => {
  context.supabase = { from: () => assert.fail('Empty known categories need no database query') };
  const result = await context.listProducts('furniture', undefined, []);
  assert.equal(result.error, null);
  assert.equal(result.data.length, 0);
});

test('supplied categories map products without fetching categories again', async () => {
  context.supabase = { from(table) {
    assert.equal(table, 'products');
    return { select() { return this; }, eq() { return this; }, order() { return this; },
      range: async () => ({ data: [{ id: 'p', name: 'Chair' }], error: null }) };
  } };
  const result = await context.listProducts('furniture', 'c', [{ id: 'c', name: 'Chairs', category: 'furniture' }]);
  assert.equal(result.error, null);
  assert.equal(result.data[0].subcategory, 'Chairs');
});

const admin = { getUser: async () => ({ data: { user: { id: 'admin' } }, error: null }) };

test('createCategory rejects without a session and rejects a duplicate name', async () => {
  context.categoryFromParam = value => value === 'furniture';
  context.supabase = { auth: { getUser: async () => ({ data: { user: null }, error: null }) }, from: () => assert.fail('No session, no query') };
  assert.match((await context.createCategory('furniture', 'Chairs')).error, /not allowed to make changes/);
  let inserted = false;
  context.supabase = { auth: admin, from: () => ({
    select: () => ({ eq: async () => ({ data: [{ id: 'c1', name: 'Chairs', slug: 'chairs' }], error: null }) }),
    insert: () => { inserted = true; return { select: async () => ({ data: [{ id: 'new' }], error: null }) }; },
  }) };
  for (const name of ['chairs', '  CHAIRS ']) assert.match((await context.createCategory('furniture', name)).error, /already exists/);
  assert.equal(inserted, false);
  assert.equal((await context.createCategory('furniture', 'Tables')).data, 'new');
});

test('moveProducts errors when fewer rows were updated than requested', async () => {
  const update = rows => ({ update: () => ({ in: () => ({ select: async () => ({ data: rows, error: null }) }) }) });
  context.supabase = { auth: admin, from: () => update([{ id: 'a' }]) };
  assert.match((await context.moveProducts(['a', 'b'], 'c')).error, /could not be moved/);
  context.supabase = { auth: admin, from: () => update([]) };
  assert.match((await context.moveProducts(['a', 'b'], 'c')).error, /not allowed to make changes/);
  context.supabase = { auth: admin, from: () => update([{ id: 'a' }, { id: 'b' }]) };
  assert.equal((await context.moveProducts(['a', 'b'], 'c')).data, 2);
});

test('deleteCategory refuses a subcategory that still has products and never deletes', async () => {
  let deleted = false;
  context.supabase = { auth: admin, from: table => table === 'products' ? emptyCount(3) : { ...protectedCats, delete: () => { deleted = true; return {}; } } };
  assert.match((await context.deleteCategory('c')).error, /3 products\. Move them first/);
  assert.equal(deleted, false);
});

test('deleteCategory deletes an empty subcategory', async () => {
  context.supabase = { auth: admin, from: table => table === 'products' ? emptyCount(0)
    : { ...protectedCats, delete: () => ({ eq: (column, id) => { assert.equal(column, 'id'); return { select: async () => ({ data: [{ id }], error: null }) }; } }) } };
  assert.equal((await context.deleteCategory('c')).data, 'c');
});

test('deleteCategory with a target moves every product still in the subcategory before deleting', async () => {
  const calls = [];
  context.supabase = { auth: admin, from: table => table === 'products' ? {
    update: row => ({ eq: async (column, id) => { calls.push(['move', row.category_id, column, id]); return { error: null }; } }),
    ...emptyCount(0),
  } : { ...protectedCats, delete: () => ({ eq: (column, id) => { calls.push(['delete', id]); return { select: async () => ({ data: [{ id }], error: null }) }; } }) } };
  assert.equal((await context.deleteCategory('c', 'target')).data, 'c');
  assert.deepEqual(calls, [['move', 'target', 'category_id', 'c'], ['delete', 'c']]);
  assert.match((await context.deleteCategory('c', 'c')).error, /different subcategory/);
});

test('rename keeps the slug so web addresses do not change', async () => {
  let payload;
  context.categoryFromParam = value => value === 'furniture';
  context.supabase = { auth: admin, from: () => ({
    select: () => ({ eq: async () => ({ data: [{ id: 'c', name: 'Chairs', slug: 'chairs' }], error: null }) }),
    update: row => { payload = row; return { eq: () => ({ select: async () => ({ data: [{ id: 'c' }], error: null }) }) }; },
  }) };
  assert.equal((await context.renameCategory({ id: 'c', category: 'furniture' }, 'Dining chairs')).data, 'c');
  assert.deepEqual({ ...payload }, { name: 'Dining chairs' });
});

test('deleteCategory refuses to run until the database safety update is applied, then works without a release', async () => {
  vm.runInContext('protection = null', context);
  let writes = 0;
  context.supabase = { auth: admin, from: table => table === 'categories'
    ? { select: () => ({ limit: async () => ({ error: { code: '42703', message: 'column categories.seo_title does not exist' } }) }), delete: () => { writes++; return {}; } }
    : { update: () => { writes++; return {}; }, ...emptyCount(0) } };
  assert.match((await context.deleteCategory('c', 'target')).error, /database safety update/);
  assert.equal(writes, 0);
  context.supabase = { auth: admin, from: table => table === 'products' ? emptyCount(0)
    : { ...protectedCats, delete: () => ({ eq: (_c, id) => ({ select: async () => ({ data: [{ id }], error: null }) }) }) } };
  assert.equal((await context.deleteCategory('c')).data, 'c');
});