import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
  redirects: {
    '/docs/': '/capabilities/',
    '/pricing/': '/#pricing',
    '/download/': '/#download',
    '/showcases/tank-motion/': '/showcases/rolling-tank-impact/',
    // Policy pages moved under /legal/ on 14 Oct 2026.
    '/terms/': '/legal/terms/',
    '/privacy/': '/legal/privacy/',
    '/refunds/': '/legal/refunds/',
  },
  build: { inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  vite: { build: { assetsInlineLimit: 0 } },
});
