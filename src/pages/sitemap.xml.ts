import type { APIRoute } from 'astro';
import { pages, legalPages } from '../content/pages';
import { showcases } from '../content/content';

const siteOrigin = 'https://prelimina.com';
const publicPages = [
  '/',
  ...Object.keys(pages)
    .filter((page) => page !== 'confirmed')
    .map((page) => `/${page}/`),
  ...Object.keys(legalPages).map((doc) => `/legal/${doc}/`),
  ...showcases.map((showcase) => `/showcases/${showcase.slug}/`),
];

export const GET: APIRoute = () => {
  const urls = publicPages
    .map((path) => `  <url><loc>${siteOrigin}${path}</loc></url>`)
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
