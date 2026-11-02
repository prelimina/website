// Turns a paragraph holding only an image into <figure> with the alt text as its
// caption, so guide chapters stay plain Markdown that pandoc reads the same way.
import { closeSync, openSync, readSync } from 'node:fs';
import { join } from 'node:path';

// Lossy and extended WebP headers carry the pixel size; it reserves the layout.
export function webpSize(path) {
  const header = Buffer.alloc(30);
  const file = openSync(path, 'r');
  try {
    readSync(file, header, 0, 30, 0);
  } finally {
    closeSync(file);
  }
  const chunk = header.toString('latin1', 12, 16);
  if (chunk === 'VP8X')
    return {
      width: header.readUIntLE(24, 3) + 1,
      height: header.readUIntLE(27, 3) + 1,
    };
  if (chunk === 'VP8 ')
    return {
      width: header.readUInt16LE(26) & 0x3fff,
      height: header.readUInt16LE(28) & 0x3fff,
    };
  throw new Error(`${path}: unsupported WebP chunk ${chunk}`);
}

export function guideFigures(html) {
  return html.replace(/<p>\s*<img\s+[^>]*>\s*<\/p>/g, (paragraph) => {
    const src = paragraph.match(/\ssrc="([^"]+)"/)?.[1];
    const alt = paragraph.match(/\salt="([^"]*)"/)?.[1];
    if (!src || !alt)
      throw new Error(`Guide figure needs an image and alt text: ${paragraph}`);
    const { width, height } = webpSize(join('public', src));
    return (
      `<figure><img src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async">` +
      `<figcaption>${alt}</figcaption></figure>`
    );
  });
}

// All chapters share one page under its h1, so each heading drops one level. The PDF keeps
// "Next steps", which only points at the following chapter and repeats on a continuous page.
export function guidePageHtml(html) {
  return guideFigures(html)
    .replace(/<h2 id="next-steps">[\s\S]*$/, '')
    .replace(/<(\/?)h3(?=[\s>])/g, (_, slash) => `<${slash}h4`)
    .replace(/<(\/?)h2(?=[\s>])/g, (_, slash) => `<${slash}h3`);
}
