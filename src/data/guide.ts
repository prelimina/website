import guide from '../content/guide/guide.json';
import { guidePageHtml } from './guide-figures.mjs';

interface ChapterModule {
  frontmatter: { title: string; summary: string };
  compiledContent: () => string | Promise<string>;
  getHeadings: () => { depth: number; slug: string; text: string }[];
}

const modules = import.meta.glob<ChapterModule>('../content/guide/*.md', {
  eager: true,
});

// Chapter files are named NN-slug.md, so the file name sets the order.
export const chapters = await Promise.all(
  Object.keys(modules)
    .sort()
    .map(async (path, index) => ({
      number: index + 1,
      slug: path.match(/\d+-([a-z0-9-]+)\.md$/)![1],
      title: modules[path].frontmatter.title,
      summary: modules[path].frontmatter.summary,
      html: guidePageHtml(await modules[path].compiledContent()),
      headings: modules[path]
        .getHeadings()
        .filter((h) => h.depth === 2 && h.slug !== 'next-steps'),
    })),
);

export const guidePdf = {
  href: `/downloads/prelimina-user-guide-${guide.appVersion}.pdf`,
  version: guide.appVersion,
  updatedLabel: new Date(guide.updated).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }),
};
