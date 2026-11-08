const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');

function setup(overrides = {}) {
  const calls = [];
  const dependencies = {
    validateMediaFile: () => null,
    shrinkImage: async file => file,
    supabase: { auth: { getUser: async () => ({ data: { user: { id: 'admin' } } }), getSession: async () => ({ data: { session: { access_token: 'test' } } }) } },
    uploadMedia: async () => { calls.push('upload'); return '/photo.jpg'; },
    createProduct: async input => { calls.push(input); return { data: 'p', error: null }; },
    ...overrides,
  };

  const source = stripTypeScriptTypes(readFileSync(`${__dirname}/mediaUploadTask.ts`, 'utf8').replace(/^import .*;$/gm, '').replace(/export /g, ''));
  const context = vm.createContext({ ...dependencies, Error }); vm.runInContext(source, context);
  return { run: context.saveGalleryUpload, calls };
}
const file = { name: 'photo.jpg', type: 'image/jpeg', size: 100 };
const task = () => ({ file, categoryId: 'c', url: undefined });
const options = () => ({ signal: new AbortController().signal, onProgress() {} });

test('invalid files never upload or save', async () => {
  const { run, calls } = setup({ validateMediaFile: () => 'Too large' });
  await assert.rejects(run(task(), options()), /Too large/);
  assert.equal(calls.length, 0);
});
test('expired sessions never upload or save', async () => {
  const { run, calls } = setup({ supabase: { auth: { getUser: async () => ({ data: { user: null } }) } } });
  await assert.rejects(run(task(), options()), /Log in/);
  assert.equal(calls.length, 0);
});
test('retry after failed save reuses uploaded URL', async () => {
  let saves = 0;
  const { run, calls } = setup({ createProduct: async () => ++saves === 1 ? { error: 'offline' } : { data: 'p', error: null } });
  const item = task();
  await assert.rejects(run(item, options()), /offline/);
  assert.equal(await run(item, options()), 'p');
  assert.deepEqual(calls, ['upload']);
});
test('successful upload persists a gallery product with its caption and media type', async () => {
  const { run, calls } = setup();
  assert.equal(await run(task(), options()), 'p');
  assert.equal(calls[1].category_id, 'c');
  assert.equal(calls[1].description, 'image');
  assert.equal(calls[1].name, 'photo.jpg');
});



test('empty files and missing destinations never authenticate or upload', async () => {
  const { run, calls } = setup();
  await assert.rejects(run({ ...task(), file: { ...file, size: 0 } }, options()), /non-empty/);
  await assert.rejects(run({ ...task(), categoryId: ' ' }, options()), /subcategory/);
  assert.equal(calls.length, 0);
});
test('cancelled uploads never reach storage or database', async () => {
  const { run, calls } = setup();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(run(task(), { signal: controller.signal, onProgress() {} }), /cancelled/);
  assert.equal(calls.length, 0);
});
test('images shrink before upload and report progress', async () => {
  const prepared = { ...file, size: 50 };
  let percent = 0;
  const { run } = setup({
    shrinkImage: async original => { assert.equal(original, file); return prepared; },
    uploadMedia: async (value, options) => { assert.equal(value, prepared); options.onProgress(64); return '/photo.jpg'; },
  });
  await run(task(), { ...options(), onProgress: value => { percent = value; } });
  assert.equal(percent, 64);
});
test('MP4 videos bypass image conversion', async () => {
  const { run, calls } = setup({ shrinkImage: async () => assert.fail('Video must not be decoded as an image') });
  await run({ ...task(), file: { ...file, name: 'clip.mp4', type: 'video/mp4' } }, options());
  assert.equal(calls[1].description, 'video');
});

test('shared validation rejects unsupported MIME types and oversized images/videos', () => {
  const source = stripTypeScriptTypes(readFileSync(`${__dirname}/../../../lib/mediaUpload.ts`, 'utf8').replace(/^import .*;$/gm, '').replace(/export /g, ''));
  const context = vm.createContext({});
  vm.runInContext(source, context);
  for (const rejected of [
    { name: 'photo.jpg', type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 },
    { name: 'clip.mp4', type: 'video/mp4', size: 50 * 1024 * 1024 + 1 },
    { name: 'phone.mov', type: 'video/quicktime', size: 100 },
    { name: 'code.svg', type: 'image/svg+xml', size: 100 },
  ]) assert.equal(typeof context.validateMediaFile(rejected), 'string');
  assert.equal(context.validateMediaFile(file), null);
  assert.equal(context.validateMediaFile({ name: 'clip.mp4', type: 'video/mp4', size: 50 * 1024 * 1024 }), null);
});
