# Prelimina website

A standalone Astro/TypeScript static site for the native Prelimina desktop product. It does not build, import, or run SlangSolvers. The visual direction combines the supplied black header/logo, locally hosted Bacasime Antique headings and Quicksand sans-serif text, and AmbientCSS lighting, raised convex controls, and raised panels with concave faces.

The site positions Prelimina as GPU-native desktop CFD for moving liquids and early-stage design. The homepage moves from initial applications to six capability panels, fit with existing tools, Download, a combined product and licensing FAQ, and a next action. The browser version is currently in development and coming soon; it will run natively in the browser. The panels link to feature groups on `/capabilities/`, where each feature has a maturity label. The interactive **workflow illustration** in the hero retains Setup, Simulate, and Optimize. Optimize illustrates manual design iteration in the user's geometry tools followed by another run and comparison. It is not an application screenshot, CFD result, or automatic optimisation feature.

Candidate applications retain `/showcases/` and their existing detail URLs. Applications, Capabilities, and Download in the main menu link to homepage sections. The former workflow guide at `/docs/` redirects to `/capabilities/`. The Evidence page and section are removed; `/pricing/` and `/download/` redirect to `/#download`.

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

The tests cover content boundaries, rejected email injection, prelaunch-only behavior, publication blocking, preserved routes and anchors, availability/evidence labels, and absence of invented downloads or commercial offers. Browser checks cover desktop/tablet/mobile overflow, the Setup / Simulate / Optimize illustration, capability panels and group links, per-feature maturity labels, the retired guide redirect, keyboard navigation, FAQ, clipboard success/failure, reduced motion, and automated axe WCAG A/AA checks. A temporary build with a reserved test email checks the configured inquiry route and encoding of edited outlines without changing the real site's configuration or build. Screenshots go to ignored `test-results/`. Automated accessibility checks are not a complete manual accessibility certification. The 640px layout is a reflow proxy for a 1280px viewport at 200% zoom.

To check the actual Cloudflare static-asset headers locally:

```sh
npx wrangler dev --port 8787
# In another terminal:
TEST_BASE_URL=http://127.0.0.1:8787 npm run test:browser
```

The GitHub Actions check workflow installs from the lockfile, builds, and runs the tests. It does not deploy.

## Edit content

| File                                     | Purpose                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/site.json`                  | Product/company name, launch state, application contact, licence metadata/contact, temporary download preview, review date, homepage introduction. |
| `src/content/content.ts`                 | Workflow illustration copy, navigation, platform targets, FAQs, and candidate application records.                                                 |
| `src/content/capabilities.ts`            | Feature groups, maturity definitions, and homepage capability summaries.                                                                           |
| `src/components/CapabilitySummary.astro` | Homepage feature panels and links to the full catalogue.                                                                                           |
| `src/components/CapabilityCatalog.astro` | Grouped Capabilities page, maturity legend, and group navigation.                                                                                  |
| `src/components/DownloadSection.astro`   | Homepage download panels, release preview, and licensing FAQ.                                                                                      |
| `src/content/inquiry.mjs`                | Shared contact/status decisions, inquiry outline, and safe email-draft URL construction.                                                           |
| `src/content/pages.ts`                   | Supporting-page titles and introductions.                                                                                                          |
| `src/pages/index.astro`                  | Homepage section copy and composition.                                                                                                             |
| `src/pages/[page].astro`                 | Supporting-page body copy and contact controls.                                                                                                    |
| `src/styles/global.css`                  | Palette, type, layout, AmbientCSS materials, responsive rules.                                                                                     |
| `public/assets/`                         | Supplied logo and locally hosted Bacasime Antique and Quicksand fonts.                                                                             |

Hero title and its line breaks are composed in `index.astro`; its descriptor and supporting paragraph come from `site.json`. No remote font or asset request is required. Font and AmbientCSS licenses are included in `public/licenses/`.

Quicksand is the default sans-serif family for body text, navigation, controls, and labels. `public/assets/Quicksand-Variable.ttf` is the unmodified variable font from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/quicksand), supporting weights 300–700. Its SIL Open Font License is included as `public/licenses/Quicksand-OFL.txt`.

Set `contactEmail` only when an address is approved for application inquiries and inquiries are open. That enables “Discuss your case” and the email-draft action. The edited outline is encoded into the draft; the visitor reviews and sends it in their own email application. A visible address provides a fallback. Until configured, the primary action is “Explore applications”, the support page explicitly says application inquiries are not open, and users can prepare/copy an outline. Copying never implies submission. No outline is submitted, persisted, or sent to analytics.

The owner directed the licensing content to follow the supplied Prelimina Licence Agreement, version 1.0, dated 23 September 2026. Its complete, unchanged text is published at `public/licenses/Prelimina-Licence-Agreement.txt`; the short homepage licensing FAQ and legal copy summarise that agreement. When updating it, replace the complete text from the authoritative product licence and review the summaries and `site.json` metadata together. The tests check the version, contact, core permissions, and built copy. The agreement grants free noncommercial use and requires a paid entitlement before commercial use, including business evaluation. It does not itself make a public installer available.

`site.json` contains owner-requested temporary download display values in `downloadPreview`: version **0.1**, date **2026-09-23**, and the destination **https://github.com/prelimina/desktop/releases**. The date is sample content, not a verified release date. Windows and Linux download buttons open that releases page; no installer filename or release asset URL is assumed. macOS remains a disabled coming-soon panel. Replace the preview details when publishing the actual release, using the shared release manifest for installer metadata rather than expanding this display configuration into another manifest.

Platform cards describe the current native packaging targets, checked against `SlangSolvers/docs/development/deployment.md` and `scripts/release_artifacts.py`: Windows/Linux x64, a Vulkan-capable GPU and vendor driver, and a Linux glibc 2.28 target with FUSE 2 for AppImage mounting. Supported Windows versions, GPU models, minimum RAM/VRAM, and macOS compatibility are not established by those files, so the panels mark them as unconfirmed. Do not infer a minimum GPU year from the presence of a backend.

`licence.email` is the agreement's licensing/legal contact, used to obtain commercial entitlement or clarify intended use. It does not enable the general application-inquiry CTA or change `contactEmail`. Prices, commercial packages, and purchased support commitments require their own approved terms.

Application availability (`released`, `in_development`, `planned`) and evidence (`illustration`, `software_demonstration`, `numerical_verification`, `physical_validation`) are independent fields. The current records are illustrative candidates: baffle arrangements and tank motion are in development; filling and overflow are planned and retain explicit boundary/measurement gaps. Their status labels remain on the application pages.

The feature catalogue in `src/content/capabilities.ts` was checked against current product contracts and implementation on 2026-09-23. It contains six groups and uses four maturity labels: **Implemented** for working functionality in the development build, **Experimental** for functionality needing broader testing and qualification, **In development** for partial implementation, and **Planned** for roadmap work. These describe development maturity; they do not establish a released package or physical validation. Feature descriptions identify relevant method or configuration scope. The RHOXYZ reference supplied for the design is presentation inspiration, not a source of Prelimina feature claims.

For maintainers, the local product sources used for this review are listed below. Paths are relative to the sibling `SlangSolvers` repository; they are not published as links on the website.

| Group                 | Current product sources                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fluid flow            | `docs/solvers/capability-matrix.md`, `docs/solvers/{flip,fvm,firm}/README.md`, `solvers/cfd_core/config_common.hpp`, `docs/solvers/fvm/features/turbulence-and-wall-treatment.md` |
| Geometry & boundaries | `libs/loaders/loader_factory.cpp`, `docs/features/native-scene-authoring.md`, `docs/features/physical-inlets.md`, `docs/solvers/capability-matrix.md`                             |
| Motion & coupling     | `docs/features/scene-motion-core.md`, `docs/features/rigid-body-motion.md`, `docs/features/coupling/README.md`, `docs/features/waves.md`                                          |
| GPU computing         | `docs/solvers/flip/README.md`, `docs/development/deployment.md`, `scripts/release_artifacts.py`, `docs/solvers/capability-matrix.md`                                              |
| Desktop workspace     | `docs/features/native-scene-authoring.md`, `docs/features/scene-motion-core.md`, `apps/libs/viewer/slice_plane.hpp`, `apps/libs/viewer/engine.cpp`                                |
| Measurements & output | `docs/reference/simulation-results.md`, `docs/reference/study-runner.md`, `docs/solvers/capability-matrix.md`                                                                     |

Keep the catalogue and its homepage summaries together when revising scope or maturity. No private source, repository links, internal benchmarks, or partner media are published on the rendered site.

When replacing a concept schematic with a real capture, record the product version, model assumptions, case status, and any limits. Use explicit dimensions, compressed local media, meaningful alt text, and click-to-play for optional videos. Never present these SVG illustrations as simulation evidence.

## Publication and release scope

The owner approved publishing this **prelaunch design preview** on 2026-09-22. `src/content/site.json` records that website approval as `publicationApproved: true`. That website approval does not approve software releases, prices, or a general application contact service. The later instruction to publish the supplied Licence Agreement is recorded above. The site still labels its candidate illustrations and unavailable downloads explicitly.

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

1. Complete hosting-specific privacy and website disclosures. Company details and the software licence are published from the supplied agreement; the general application contact still needs configuration.
2. Add the final domain, canonical URLs, sitemap, and an intentional indexing policy.
3. Integrate the **existing shared schemaVersion 2 release manifest**, owned at `SlangSolvers/schemas/release-manifest.schema.json`, when real approved releases exist. No competing release schema or fake manifest is created here. Add schema/approved-host validation, actual platform eligibility, hashes/sizes, freshness, and failure-state tests before enabling downloads or `alpha_open`.
4. Configure the agreed release/deployment process. Keep installers on their separate release host.

Outstanding publication inputs are an approved public application-inquiry address, approved genuine product media with version/case/evidence context, approved public verification/validation records, qualified release/platform information, and approved commercial offers, pricing, and support schedules. Any later indexing change requires its own decision. Website publication approval does not supply any of those approvals. No commercial price proposals or draft licence promises belong in this public repository.

No advertising, cookies, analytics, session replay, remote fonts, third-party embeds, or backend have been added. Hosting providers may process request logs; the full hosting-specific privacy notice remains product-launch work.

## Design references

- [AmbientCSS](https://github.com/kikkupico/ambientcss): the CSS-only package is pinned; no React runtime is included.
- [Astro static pages](https://docs.astro.build/en/basics/astro-pages/).
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/): matches the starter repository's provider setup.

This iteration uses the supplied initial website brief as product context, with the requested skeuomorphic design taking precedence over its general visual suggestions.
