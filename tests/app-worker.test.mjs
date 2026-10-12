import test from 'node:test';
import assert from 'node:assert/strict';
import { serveApp } from '../worker/index.js';

// Mimics R2: a failed If-None-Match precondition returns metadata without a body.
function bucket(objects) {
  const meta = (key) => ({ httpEtag: `"${key}"` });
  return {
    head: async (key) => (key in objects ? meta(key) : null),
    get: async (key, options = {}) => {
      if (!(key in objects)) return null;
      const match = options.onlyIf?.get?.('If-None-Match');
      if (match === `"${key}"`) return meta(key);
      return {
        ...meta(key),
        body: objects[key],
        text: async () => objects[key],
      };
    },
  };
}

function env(objects) {
  return {
    WEB_APP: bucket(objects),
    ASSETS: {
      fetch: async () => new Response('static asset', { status: 200 }),
    },
  };
}

const live = {
  'app/current.json': '{"schemaVersion":1,"version":"0.2.0"}\n',
  'app/index.html': '<!doctype html>',
  'app/index.js': 'script',
  'app/index.wasm': 'wasm bytes',
};
const get = (path, objects = live, init = {}) =>
  serveApp(new Request(`https://www.prelimina.com${path}`, init), env(objects));

test('the app is served at /app/ without a version in the address', async () => {
  const redirect = await get('/app');
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('Location'), '/app/');
  for (const path of ['/app/', '/app/index.html']) {
    const page = await get(path);
    assert.equal(page.status, 200);
    assert.equal(await page.text(), '<!doctype html>');
    assert.equal(page.headers.get('Cache-Control'), 'no-cache');
    assert.match(
      page.headers.get('Content-Security-Policy'),
      /'wasm-unsafe-eval'/,
    );
  }
  const wasm = await get('/app/index.wasm');
  assert.equal(wasm.headers.get('Content-Type'), 'application/wasm');
  assert.equal(await wasm.text(), 'wasm bytes');
  const version = await get('/app/version.json');
  assert.deepEqual(await version.json(), {
    schemaVersion: 1,
    version: '0.2.0',
  });
});

test('an unchanged file revalidates with 304 and other names are not served', async () => {
  const cached = await get('/app/index.wasm', live, {
    headers: { 'If-None-Match': '"app/index.wasm"' },
  });
  assert.equal(cached.status, 304);
  assert.equal(cached.headers.get('ETag'), '"app/index.wasm"');
  for (const path of [
    '/app/current.json',
    '/app/0.2.0/index.wasm',
    '/app/other.js',
  ]) {
    assert.equal((await get(path)).status, 404, path);
  }
  assert.equal(
    (await get('/app/index.wasm', live, { method: 'POST' })).status,
    405,
  );
  const head = await get('/app/index.wasm', live, { method: 'HEAD' });
  assert.equal(head.status, 200);
});

test('an empty bucket reports the app as unavailable and other paths stay static', async () => {
  assert.equal((await get('/app/', {})).status, 404);
  assert.equal((await get('/app/version.json', {})).status, 404);
  assert.equal(await (await get('/applications/', {})).text(), 'static asset');
});
