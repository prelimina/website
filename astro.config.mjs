import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
  redirects: {
    '/pricing/': '/#download',
    '/download/': '/#download',
  },
  build: { inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  vite: { build: { assetsInlineLimit: 0 } },
});
