// A disposable build exercises approved downloads without changing the real catalogue.
import { mkdtempSync, cpSync, symlinkSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { releaseFixture } from '../tests/fixtures/release.mjs';

const root = resolve('.');
const fixture = mkdtempSync(join(tmpdir(), 'prelimina-verified-site-'));
try {
  for (const file of ['src', 'public', 'scripts', 'tests', 'package.json', 'package-lock.json', 'astro.config.mjs', 'tsconfig.json'])
    cpSync(join(root, file), join(fixture, file), { recursive: true });
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  const { data, notes } = releaseFixture();
  const text = notes + '\nCorrects A & B.\n';
  data.notesSha256 = createHash('sha256').update(text).digest('hex');
  // Start from an empty catalogue: synchronized real releases would outrank the fixture version.
  for (const dir of ['src/data/releases', 'src/content/releases']) {
    rmSync(join(fixture, dir), { recursive: true, force: true });
    mkdirSync(join(fixture, dir), { recursive: true });
  }
  writeFileSync(join(fixture, `src/data/releases/${data.version}.json`), JSON.stringify(data));
  writeFileSync(join(fixture, `src/content/releases/${data.version}.md`), text);
  const current = { version: data.version, releaseId: data.releaseId, notesSha256: data.notesSha256 };
  writeFileSync(join(fixture, 'src/data/current-release.json'), JSON.stringify(current));
  const result = spawnSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', fixture],
    { cwd: fixture, encoding: 'utf8', timeout: 120000 });
  if (result.status !== 0) throw new Error(result.stdout + result.stderr);
  const home = readFileSync(join(fixture, 'dist/index.html'), 'utf8');
  for (const download of data.downloads) assert.ok(home.includes(`href="${download.installerUrl}"`));
  assert.ok(home.includes('v0.1.0'));
  assert.ok(home.includes('Coming soon'));
  assert.ok(home.includes('noindex'));
  const changelog = readFileSync(join(fixture, 'dist/changelog/index.html'), 'utf8');
  assert.ok(changelog.includes('Corrects A &amp; B.'));
  assert.ok(!changelog.includes('No public product version'));
  assert.deepEqual(JSON.parse(readFileSync(join(fixture, 'dist/release-status.json'), 'utf8')), { schemaVersion: 1, release: current });
  const tests = spawnSync(process.execPath, ['--test', 'tests/content.test.mjs', 'tests/releases.test.mjs'],
    { cwd: fixture, encoding: 'utf8', timeout: 60000 });
  if (tests.status !== 0) throw new Error(tests.stdout + tests.stderr);
  console.log('PASS: verified alpha fixture builds with exact downloads, escaped notes, noindex, current identity and content tests.');
} finally {
  // This exact directory was allocated by mkdtemp above; no user checkout is removed.
  rmSync(fixture, { recursive: true, force: true });
}
