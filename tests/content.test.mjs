import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { validateContent } from '../scripts/check-content.mjs';

const site = JSON.parse(
  readFileSync(new URL('../src/content/site.json', import.meta.url), 'utf8'),
);
test('prelaunch accepts an unconfigured contact without creating a fake endpoint', () => {
  assert.doesNotThrow(() => validateContent({ ...site, contactEmail: null }));
});
test('only a plain email address can become a contact link', () => {
  assert.doesNotThrow(() =>
    validateContent({ ...site, contactEmail: 'hello@example.com' }),
  );
  for (const contactEmail of [
    'javascript:alert(1)',
    'hi@example.com?bcc=someone@example.com',
    'hello@example.com\nBcc: x@y.com',
    '',
    123,
  ]) {
    assert.throws(
      () => validateContent({ ...site, contactEmail }),
      /contactEmail/,
    );
  }
});
test('downloads cannot silently activate with an unsupported launch state', () => {
  for (const launchState of ['alpha_open', 'released', '', undefined])
    assert.throws(
      () => validateContent({ ...site, launchState }),
      /only supports prelaunch/,
    );
});
test('publication requires explicit owner approval while local drafts remain buildable', () => {
  assert.doesNotThrow(() =>
    validateContent({ ...site, publicationApproved: false }),
  );
  assert.throws(
    () =>
      validateContent(
        { ...site, publicationApproved: false },
        { publication: true },
      ),
    /Publication is blocked/,
  );
  assert.doesNotThrow(() =>
    validateContent(
      { ...site, publicationApproved: true },
      { publication: true },
    ),
  );
});
test('publication approval must be an explicit boolean', () => {
  assert.throws(
    () => validateContent({ ...site, publicationApproved: 'true' }),
    /publicationApproved/,
  );
});
test('unfinished content tokens are rejected', () => {
  assert.throws(
    () => validateContent({ ...site, company: '{{COMPANY}}' }),
    /Unresolved/,
  );
});

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
}
test('all built local links and assets exist, and every page stays noindex', () => {
  const root = resolve('dist');
  assert.ok(existsSync(root), 'Run npm run build before npm test.');
  const htmlFiles = files(root).filter((path) => path.endsWith('.html'));
  assert.equal(htmlFiles.length, 13);
  for (const path of htmlFiles) {
    const html = readFileSync(path, 'utf8');
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
    assert.doesNotMatch(
      html,
      /<iframe|action="https?:|src="https?:|href="javascript:/,
    );
    for (const match of html.matchAll(
      /(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g,
    )) {
      const url = match[1];
      const target = join(root, url.endsWith('/') ? `${url}index.html` : url);
      assert.ok(existsSync(target), `${path}: missing ${url}`);
    }
  }
  const download = readFileSync(join(root, 'download/index.html'), 'utf8');
  assert.doesNotMatch(download, /href="[^"]+\.(exe|msi|dmg|zip|AppImage)/);
  assert.match(download, /No public build has been approved/);
});
