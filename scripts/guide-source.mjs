// Hash of everything the guide PDF is built from, so a test can tell when the
// committed PDF no longer matches the chapters.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function guideSourceHash(root = '.') {
  const hash = createHash('sha256');
  const { appVersion, updated } = JSON.parse(
    readFileSync(join(root, 'src/content/guide/guide.json'), 'utf8'),
  );
  hash.update(`${appVersion}\n${updated}\n`);
  const chapters = readdirSync(join(root, 'src/content/guide'))
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => join('src/content/guide', file));
  const images = readdirSync(join(root, 'public/assets/guide'))
    .sort()
    .map((file) => join('public/assets/guide', file));
  for (const file of [...chapters, ...images, 'guide-pdf/template.typ'])
    hash.update(readFileSync(join(root, file)));
  return hash.digest('hex');
}
