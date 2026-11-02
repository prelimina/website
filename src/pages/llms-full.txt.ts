import type { APIRoute } from 'astro';
import guide from '../content/guide/guide.json';

const origin = 'https://prelimina.com';
const files = import.meta.glob<string>('../content/guide/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// One plain-text copy of the guide for tools, made from the same chapters as the page and PDF.
function chapterText(source: string) {
  const [, frontmatter, body] = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  const title = frontmatter.match(/^title: (.*)$/m)![1];
  const text = body
    .replace(/\n## Next steps\n[\s\S]*$/, '\n')
    .replace(/^!\[([^\]]*)\]\([^)]*\)$/gm, (_, alt) => `Figure: ${alt}`)
    .replace(/\]\(\//g, `](${origin}/`)
    .trim();
  return `# ${title}\n\n${text}`;
}

export const GET: APIRoute = () => {
  const chapters = Object.keys(files)
    .sort()
    .map((path) => chapterText(files[path]));
  const text = [
    '# Prelimina User Guide',
    `> The complete guide for Prelimina ${guide.appVersion}, updated ${guide.updated}. ` +
      `Read online at ${origin}/guide/. ` +
      'Measurements were made on the released application and apply to that version.',
    ...chapters,
  ].join('\n\n');
  return new Response(`${text}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
