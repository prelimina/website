import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

// Exercise the real Astro templates with a reserved test address. The working
// site's configuration, build output, and running preview are never changed.
export function buildContactFixture() {
  const root = mkdtempSync(join(tmpdir(), 'prelimina-contact-'));
  try {
    for (const path of [
      'src',
      'public',
      'astro.config.mjs',
      'tsconfig.json',
      'package.json',
    ]) {
      cpSync(resolve(path), join(root, path), { recursive: true });
    }
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    const configPath = join(root, 'src/content/site.json');
    const site = JSON.parse(readFileSync(configPath, 'utf8'));
    site.contactEmail = 'inquiries@example.test';
    writeFileSync(configPath, JSON.stringify(site));
    execFileSync(
      process.execPath,
      [resolve('node_modules/astro/bin/astro.mjs'), 'build', '--root', root],
      {
        cwd: root,
        stdio: 'pipe',
        timeout: 30_000,
      },
    );
    return {
      output: join(root, 'dist'),
      remove: () => rmSync(root, { recursive: true, force: true }),
    };
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}
