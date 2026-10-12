// Serves the browser app from R2 below /app/; every other path is a static
// asset (wrangler.jsonc runs this Worker first only for /app routes).
// SlangSolvers' release-web-app workflow uploads app/<version>/<file> and then
// switches app/current.json to that version.
const VERSION = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
const FILES = {
  'index.html': 'text/html; charset=utf-8',
  'index.js': 'text/javascript; charset=utf-8',
  'index.wasm': 'application/wasm',
};
// The app page needs its inline bootstrap script and WebAssembly compilation.
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'",
};

function respond(body, status, headers) {
  return new Response(body, { status, headers: { ...SECURITY, ...headers } });
}

async function currentPointer(env) {
  const object = await env.WEB_APP.get('app/current.json');
  if (!object) return null;
  const text = await object.text();
  const pointer = JSON.parse(text);
  if (pointer.schemaVersion !== 1 || !VERSION.test(pointer.version)) {
    throw new Error('Invalid browser app pointer');
  }
  return { text, version: pointer.version };
}

export async function serveApp(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').slice(1);
  if (parts[0] !== 'app') return env.ASSETS.fetch(request);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return respond('Method not allowed', 405, { Allow: 'GET, HEAD' });
  }
  const head = request.method === 'HEAD';
  const notFound = () =>
    respond('Not found', 404, { 'Content-Type': 'text/plain; charset=utf-8' });

  // /app, /app/ and /app/version.json follow the live pointer and are never cached.
  if (
    parts.length === 1 ||
    (parts.length === 2 && ['', 'version.json'].includes(parts[1]))
  ) {
    const pointer = await currentPointer(env);
    if (parts[1] === 'version.json') {
      if (!pointer) return notFound();
      return respond(head ? null : pointer.text, 200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      });
    }
    if (!pointer) {
      return respond('The browser app is not available yet.', 404, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      });
    }
    return respond(null, 302, {
      Location: `/app/${pointer.version}/`,
      'Cache-Control': 'no-store',
    });
  }

  if (!VERSION.test(parts[1])) return notFound();
  if (parts.length === 2) {
    return respond(null, 301, { Location: `/app/${parts[1]}/` });
  }
  const name = parts.length === 3 ? parts[2] || 'index.html' : '';
  if (!Object.hasOwn(FILES, name)) return notFound();
  const object = await (head ? env.WEB_APP.head : env.WEB_APP.get).call(
    env.WEB_APP,
    `app/${parts[1]}/${name}`,
  );
  if (!object) return notFound();
  // Published versions are immutable; a new release gets a new path.
  return respond(head ? null : object.body, 200, {
    'Content-Type': FILES[name],
    ETag: object.httpEtag,
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
}

export default { fetch: serveApp };
