import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateRelease, validateCatalogue, compareVersions, loadCatalogue } from '../src/data/releases.mjs';

import { releaseFixture } from './fixtures/release.mjs';

test('empty catalogue preserves preview and verified alpha catalogue selects real metadata', () => {
  assert.deepEqual(validateCatalogue(null, []), { current: null, releases: [] });
  const { data, notes } = releaseFixture();
  const release = validateRelease(data, notes);
  assert.equal(validateCatalogue(data, [release]).current.version, '0.1.0');
  assert.equal(compareVersions('0.10.0', '0.9.0'), 1);
});

test('wrong hosts, hashes, unsupported platforms and active/private notes are rejected', () => {
  for (const mutation of ['host', 'hash', 'platform', 'html', 'private', 'missing']) {
    const { data, notes } = releaseFixture();
    let changed = notes;
    if (mutation === 'host') data.downloads[0].installerUrl = 'https://example.test/download.exe';
    if (mutation === 'hash') data.notesSha256 = '0'.repeat(64);
    if (mutation === 'platform') data.downloads[0].channel = 'macos';
    if (mutation === 'missing') data.downloads.pop();
    if (mutation === 'html') changed += '<script>alert(1)</script>';
    if (mutation === 'private') changed += 'https://github.com/j8asic/SlangSolvers';
    if (changed !== notes) data.notesSha256 = createHash('sha256').update(changed).digest('hex');
    assert.throws(() => validateRelease(data, changed), undefined, mutation);
  }
});

test('stale current pointers and duplicate versions cannot build', () => {
  const old = releaseFixture('0.1.0'), newer = releaseFixture('0.2.0');
  const releases = [validateRelease(old.data, old.notes), validateRelease(newer.data, newer.notes)];
  assert.throws(() => validateCatalogue(old.data, releases), /stale/);
  assert.throws(() => validateCatalogue(null, releases), /selected/);
  assert.throws(() => validateCatalogue(newer.data, [releases[1], releases[1]]), /Duplicate/);
  assert.equal(validateCatalogue(newer.data, releases).current.version, '0.2.0');
});

test('checked-in catalogue loads through the same validator used by the build', () => {
  assert.doesNotThrow(() => loadCatalogue());
});
