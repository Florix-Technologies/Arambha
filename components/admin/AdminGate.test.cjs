const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const source = readFileSync(`${__dirname}/AdminGate.tsx`, 'utf8');
// The auth effect is the first useEffect inside AdminGate (useActiveCategory has its own, earlier one).
const start = source.indexOf('    useEffect(() => {', source.indexOf('export function AdminGate'));
const effect = source.slice(start, source.indexOf('    useEffect(() => {', start + 1));

test('same-user auth events keep children mounted; sign-out clears them and invalidates pending checks', async () => {
  let user = null, checking = true, callback, resolveUser, rejectUser;
  let mounted = false, mounts = 0, unmounts = 0;
  const render = () => {
    const visible = !!user && !checking;
    if (visible && !mounted) mounts++;
    if (!visible && mounted) unmounts++;
    mounted = visible;
  };
  const timers = [];
  const context = vm.createContext({
    useEffect: fn => fn(), signingOut: { current: false },
    setUser: value => { user = value; render(); },
    setChecking: value => { checking = value; render(); },
    setTimeout: fn => timers.push(fn),
    supabase: { auth: {
      getUser: () => new Promise((resolve, reject) => { resolveUser = resolve; rejectUser = reject; }),
      onAuthStateChange: fn => { callback = fn; return { data: { subscription: { unsubscribe() {} } } }; },
    } },
  });
  vm.runInContext(stripTypeScriptTypes(effect), context);
  const verified = id => ({ data: { user: { id } }, error: null });
  resolveUser(verified('admin'));
  await new Promise(setImmediate);
  assert.equal(mounts, 1);
  for (const event of ['TOKEN_REFRESHED', 'SIGNED_IN', 'USER_UPDATED']) {
    callback(event, { user: { id: 'admin' } });
    assert.equal(mounted, true);
    timers.shift()();
    resolveUser(verified('admin'));
    await new Promise(setImmediate);
  }
  assert.equal(mounts, 1);
  assert.equal(unmounts, 0);
  // A background re-check that fails on the network, or with a non-auth error, keeps the screen.
  callback('TOKEN_REFRESHED', { user: { id: 'admin' } });
  timers.shift()();
  rejectUser(new Error('offline'));
  await new Promise(setImmediate);
  callback('TOKEN_REFRESHED', { user: { id: 'admin' } });
  timers.shift()();
  resolveUser({ data: { user: null }, error: { status: 500, message: 'server' } });
  await new Promise(setImmediate);
  assert.equal(mounted, true);
  assert.equal(unmounts, 0);
  // A definite auth rejection during a re-check signs the admin out.
  callback('TOKEN_REFRESHED', { user: { id: 'admin' } });
  timers.shift()();
  resolveUser({ data: { user: null }, error: { status: 401, message: 'invalid' } });
  await new Promise(setImmediate);
  assert.equal(mounted, false);
  resolveUser = null;
  callback('SIGNED_IN', { user: { id: 'admin' } });
  timers.shift()();
  resolveUser(verified('admin'));
  await new Promise(setImmediate);
  assert.equal(mounted, true);
  callback('TOKEN_REFRESHED', { user: { id: 'admin' } });
  timers.shift()();
  callback('SIGNED_OUT', null);
  assert.equal(mounted, false);
  assert.equal(user, null);
  resolveUser(verified('admin'));
  await new Promise(setImmediate);
  assert.equal(mounted, false);
  callback('SIGNED_IN', { user: { id: 'other' } });
  assert.equal(checking, true);
});
