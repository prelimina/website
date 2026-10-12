// Serves the browser app from R2 at /app/; every other path is a static asset
// (wrangler.jsonc runs this Worker first only for /app routes).
// SlangSolvers' release-web-app workflow uploads app/index.{wasm,js,html}
// (page last) and then updates app/current.json with the live version.
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
  if (parts.length === 1) return respond(null, 301, { Location: '/app/' });
  if (parts.length !== 2) return notFound();

  if (parts[1] === 'version.json') {
    const object = await env.WEB_APP.get('app/current.json');
    if (!object) return notFound();
    const text = await object.text();
    const pointer = JSON.parse(text);
    if (pointer.schemaVersion !== 1 || !VERSION.test(pointer.version)) {
      throw new Error('Invalid browser app pointer');
    }
    return respond(head ? null : text, 200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
  }

  const name = parts[1] || 'index.html';
  if (!Object.hasOwn(FILES, name)) return notFound();
  const key = `app/${name}`;
  // Revalidate on every visit: a matching ETag answers 304 without a body,
  // so the large wasm downloads again only after a new release.
  const object = head
    ? await env.WEB_APP.head(key)
    : await env.WEB_APP.get(key, { onlyIf: request.headers });
  if (!object) {
    return name === 'index.html'
      ? respond('The browser app is not available yet.', 404, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        })
      : notFound();
  }
  const headers = {
    'Content-Type': FILES[name],
    ETag: object.httpEtag,
    'Cache-Control': 'no-cache',
  };
  if (!head && !('body' in object)) return respond(null, 304, headers);
  return respond(head ? null : object.body, 200, headers);
}

export default { fetch: serveApp };
