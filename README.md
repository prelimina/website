# Prelimina website — first design iteration

A standalone Astro/TypeScript static site for the native Prelimina desktop product. It does not build, import, or run SlangSolvers. The visual direction combines the supplied black header/logo, locally hosted Bacasime Antique, system sans-serif text, and AmbientCSS lighting, material surfaces, raised controls, and recessed panels.

The homepage workbench is an interactive **workflow schematic**, not an application screenshot or CFD result. Its four buttons change the illustrated workflow stage. Candidate showcases have their own scope pages. The mobile menu, FAQ disclosures, navigation, and case-outline copy control work.

## Run locally

Use Node.js 22.12+ (Node 24 recommended) and npm:

```sh
npm ci
npm run dev
```

Open `http://localhost:4321`. For the static output:

```sh
npm run check
npm run build
npm run preview
```

The portable output is `dist/`. Astro 7 can run preview servers in the background when an agent is detected; `npx astro preview stop` stops that instance. Add `-- --ignore-lock` to `npm run preview` to force a foreground server for a tool-managed process.

## Focused checks

```sh
npm run check
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

To use an already installed Chrome instead of downloading Playwright's browser:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/google/chrome/chrome npm run test:browser
```

The tests cover content boundaries, rejected email injection, prelaunch-only behavior, publication blocking, generated routes and local asset links, desktop/tablet/mobile overflow, keyboard navigation, schematic controls, FAQ, clipboard success/failure, reduced motion, and automated axe WCAG A/AA checks. Screenshots go to ignored `test-results/`. Automated accessibility checks are not a complete manual accessibility certification. The 640px layout is a reflow proxy for a 1280px viewport at 200% zoom.

To check the actual Cloudflare static-asset headers locally:

```sh
npx wrangler dev --port 8787
# In another terminal:
TEST_BASE_URL=http://127.0.0.1:8787 npm run test:browser
```

The GitHub Actions check workflow installs from the lockfile, builds, and runs the tests. It does not deploy.

## Edit content

| File                     | Purpose                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `src/content/site.json`  | Product/company name, launch state, public contact email, review date, homepage introduction. |
| `src/content/content.ts` | Typed workflow copy, navigation, FAQs, and candidate showcase records.                        |
| `src/content/pages.ts`   | Supporting-page titles and introductions.                                                     |
| `src/pages/index.astro`  | Homepage section copy and composition.                                                        |
| `src/pages/[page].astro` | Supporting-page body copy and contact controls.                                               |
| `src/styles/global.css`  | Palette, type, layout, AmbientCSS materials, responsive rules.                                |
| `public/assets/`         | Supplied logo and original font.                                                              |

Hero title and its line breaks are composed in `index.astro`; its descriptor and supporting paragraph come from `site.json`. No remote font or asset request is required. Font and AmbientCSS licenses are included in `public/licenses/`.

Set `contactEmail` to an approved public address to enable the email-draft action. The visitor must send the email in their own application. Until configured, the support page explicitly says inquiries are not open, and users can only prepare/copy an outline. No outline is submitted, persisted, or sent to analytics.

When replacing a concept schematic with a real capture, record the product version, model assumptions, case status, and any limits. Use explicit dimensions, compressed local media, meaningful alt text, and click-to-play for optional videos. Never present these SVG illustrations as simulation evidence.

## Publication and release scope

The owner approved publishing this **prelaunch design preview** on 2026-09-22. `src/content/site.json` records that website approval as `publicationApproved: true`. It does not approve software releases, prices, legal terms, or a contact service. The site still labels its candidate illustrations and unavailable downloads explicitly.

`robots.txt`, page metadata, and `_headers` request no indexing. Noindex is not access control: the approved preview may be public, and nothing in this repository should depend on it being private.

The existing **Cloudflare Workers Static Assets** target is `prelimina-website`. Wrangler builds the Astro site before uploading `dist/`, so both a direct deployment and an existing Cloudflare Git integration receive current static output. The 404 page and security headers are included.

For direct deployment with an authorized Cloudflare account:

```sh
npx wrangler login
npm run deploy
```

Use an approved `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in an automated environment instead of interactive login. Never commit credentials. The deploy script verifies preview publication approval; switching to a released product state remains unsupported and fails the content check.

If the repo is already connected through Cloudflare Workers Builds, use the repository root and the deployment command `npm run deploy`. Wrangler's custom build command runs `npm run build`; a separate dashboard build command is optional. GitHub Actions checks the source independently and does not deploy. No DNS changes or new Cloudflare account are part of this iteration.

Before a public product launch:

1. Publish confirmed company/contact details and approved legal and hosting disclosures.
2. Add the final domain, canonical URLs, sitemap, and an intentional indexing policy.
3. Integrate the **existing shared schemaVersion 2 release manifest**, owned at `SlangSolvers/schemas/release-manifest.schema.json`, when real approved releases exist. No competing release schema or fake manifest is created here. Add schema/approved-host validation, actual platform eligibility, hashes/sizes, freshness, and failure-state tests before enabling downloads or `alpha_open`.
4. Configure the agreed release/deployment process. Keep installers on their separate release host.

No advertising, cookies, analytics, session replay, remote fonts, third-party embeds, or backend have been added. Hosting providers may process request logs; the full hosting-specific privacy notice remains product-launch work.

## Design references

- [AmbientCSS](https://github.com/kikkupico/ambientcss): the CSS-only package is pinned; no React runtime is included.
- [Astro static pages](https://docs.astro.build/en/basics/astro-pages/).
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/): matches the starter repository's provider setup.

This iteration uses the supplied initial website brief as product context, with the requested skeuomorphic design taking precedence over its general visual suggestions.
