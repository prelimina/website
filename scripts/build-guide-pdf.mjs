// Builds the guide PDF from the same Markdown chapters the website renders:
// chapter Markdown -> pandoc -> Typst -> PDF. Needs pandoc, typst, magick and
// woff2_decompress locally. The finished PDF is committed, so the site build
// does not need these tools.
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { guideSourceHash } from './guide-source.mjs';

const guidePath = 'src/content/guide/guide.json';
const guide = JSON.parse(readFileSync(guidePath, 'utf8'));
const chaptersDir = 'src/content/guide';
const build = '.guide-build';
rmSync(build, { recursive: true, force: true });
mkdirSync(join(build, 'fonts'), { recursive: true });

// Typst cannot read WOFF2; the site serves the same fonts decompressed here.
for (const font of ['Fraunces-Soft.woff2', 'Fraunces-Soft-Italic.woff2']) {
  writeFileSync(
    join(build, 'fonts', font),
    readFileSync(join('public/assets', font)),
  );
  execFileSync('woff2_decompress', [join(build, 'fonts', font)]);
  rmSync(join(build, 'fonts', font));
}
writeFileSync(
  join(build, 'fonts', 'Quicksand-Variable.ttf'),
  readFileSync('public/assets/Quicksand-Variable.ttf'),
);

// Typst stores WebP uncompressed but embeds JPEG as it is, which keeps the PDF small.
mkdirSync(join(build, 'images'));
for (const file of readdirSync('public/assets/guide'))
  execFileSync('magick', [
    join('public/assets/guide', file),
    '-quality',
    '90',
    join(build, 'images', file.replace(/\.webp$/, '.jpg')),
  ]);

function chapterTypst(file, index) {
  const source = readFileSync(join(chaptersDir, file), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  const title = match[1].match(/^title: (.+)$/m)?.[1];
  if (!title) throw new Error(`${file}: missing title`);
  const body = match[2]
    .replaceAll('](/guide/', '](https://prelimina.com/guide/')
    .replace(/\]\(\/(?!assets\/guide\/)/g, '](https://prelimina.com/');
  const typst = execFileSync(
    'pandoc',
    ['-f', 'gfm+implicit_figures', '-t', 'typst', '--wrap=none'],
    { input: `# ${title}\n\n${body}`, encoding: 'utf8' },
  )
    .replace(
      /"\/assets\/guide\/([^"]+)\.webp"/g,
      '"/.guide-build/images/$1.jpg"',
    )
    .replaceAll('align(center)[#table(', 'align(left)[#table(')
    // Pandoc escapes backslashes in inline code, but Typst shows raw text as is.
    .replace(/`[^`\n]*`/g, (raw) => raw.replaceAll('\\\\', '\\'));
  const name = `chapter-${index + 1}.typ`;
  writeFileSync(join(build, name), typst);
  return name;
}

const chapters = readdirSync(chaptersDir)
  .filter((file) => file.endsWith('.md'))
  .sort()
  .map(chapterTypst);

const updated = new Date(guide.updated).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
writeFileSync(
  join(build, 'main.typ'),
  `#import "/guide-pdf/template.typ": guide\n` +
    `#show: guide.with(version: "${guide.appVersion}", updated: "${updated}")\n` +
    chapters.map((name) => `#include "${name}"\n`).join(''),
);

mkdirSync('public/downloads', { recursive: true });
for (const file of readdirSync('public/downloads'))
  if (file.startsWith('prelimina-user-guide-'))
    rmSync(join('public/downloads', file));
const output = `public/downloads/prelimina-user-guide-${guide.appVersion}.pdf`;
execFileSync(
  'typst',
  [
    'compile',
    '--root',
    '.',
    '--font-path',
    join(build, 'fonts'),
    '--ignore-system-fonts',
    join(build, 'main.typ'),
    output,
  ],
  { stdio: 'inherit' },
);
writeFileSync(
  guidePath,
  `${JSON.stringify({ ...guide, sourceSha256: guideSourceHash() }, null, 2)}\n`,
);
console.log(`Built ${output}`);
