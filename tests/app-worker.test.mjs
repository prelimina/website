import test from 'node:test';
import assert from 'node:assert/strict';
import { serveApp } from '../worker/index.js';

function bucket(objects) {
  const lookup = (key) =>
    key in objects
      ? {
          body: objects[key],
          httpEtag: `"${key}"`,
          text: async () => objects[key],
        }
      : null;
  return { get: async (key) => lookup(key), head: async (key) => lookup(key) };
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
  'app/0.2.0/index.html': '<!doctype html>',
  'app/0.2.0/index.wasm': 'wasm bytes',
};
const get = (path, objects = live, method = 'GET') =>
  serveApp(
    new Request(`https://www.prelimina.com${path}`, { method }),
    env(objects),
  );

test('app entry redirects to the live version without caching', async () => {
  for (const path of ['/app', '/app/']) {
    const response = await get(path);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('Location'), '/app/0.2.0/');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
  const version = await get('/app/version.json');
  assert.deepEqual(await version.json(), {
    schemaVersion: 1,
    version: '0.2.0',
  });
});

test('versioned files are immutable and typed; other names are not served', async () => {
  const page = await get('/app/0.2.0/');
  assert.equal(page.status, 200);
  assert.equal(await page.text(), '<!doctype html>');
  assert.match(
    page.headers.get('Content-Security-Policy'),
    /'wasm-unsafe-eval'/,
  );
  const wasm = await get('/app/0.2.0/index.wasm');
  assert.equal(wasm.headers.get('Content-Type'), 'application/wasm');
  assert.match(wasm.headers.get('Cache-Control'), /immutable/);
  assert.equal((await get('/app/0.2.0')).status, 301);
  for (const path of [
    '/app/0.2.0/current.json',
    '/app/latest/',
    '/app/0.2.0/../current.json',
    '/app/0.3.0/index.js',
  ]) {
    assert.equal((await get(path)).status, 404, path);
  }
  assert.equal((await get('/app/0.2.0/index.wasm', live, 'POST')).status, 405);
});

test('missing pointer reports the app as unavailable and other paths stay static', async () => {
  assert.equal((await get('/app/', {})).status, 404);
  assert.equal((await get('/app/version.json', {})).status, 404);
  assert.equal(await (await get('/applications/', {})).text(), 'static asset');
});
