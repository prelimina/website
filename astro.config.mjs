import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  vite: { build: { assetsInlineLimit: 0 } },
});
