import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { join } from 'node:path';
import { buildContactFixture } from './contact-fixture';

const routes = [
  '/',
  '/showcases/',
  '/capabilities/',
  '/support/',
  '/legal/',
  '/changelog/',
  '/showcases/liquid-handling/',
  '/showcases/spillway-gates/',
];

test('all pages render without script errors, missing assets, or horizontal overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  for (const width of [360, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
      const crowdedPlatformHeadings = await page
        .locator('.platform-heading')
        .evaluateAll((headings) =>
          headings
            .filter((heading) => heading.scrollWidth > heading.clientWidth)
            .map((heading) => heading.textContent),
        );
      expect(
        crowdedPlatformHeadings,
        `${route} platform headings at ${width}px`,
      ).toEqual([]);
      await expect(page.locator('main')).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test('schematic controls update selected state, drawing, and description with keyboard support', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const controls = page.getByRole('group', {
    name: 'Select a workflow stage',
  });
  await expect(controls.getByRole('button')).toHaveText(
    ['01 Set up', '02 Simulate', '03 Iterate'],
    { useInnerText: true },
  );
  const setup = controls.getByRole('button', { name: '01 Set up' });
  await setup.focus();
  await page.keyboard.press('Enter');
  await expect(setup).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'set-up',
  );
  await expect(page.locator('[data-study-label]')).toHaveText('01 / Set up');
  await expect(page.locator('[data-frame="set-up"]')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    controls.getByRole('button', { name: '02 Simulate' }),
  ).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'simulate',
  );
  await expect(page.locator('[data-frame="simulate"]')).toBeVisible();
  await expect(page.locator('[data-frame="set-up"]')).toBeHidden();
  await expect(page.locator('[data-workflow-label]')).toHaveText(
    'Inspect fluid motion.',
  );
  await page.keyboard.press('Tab');
  const iterate = controls.getByRole('button', { name: '03 Iterate' });
  await expect(iterate).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(iterate).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'iterate',
  );
  await expect(page.locator('[data-study-label]')).toHaveText('03 / Iterate');
  await expect(page.locator('[data-workflow-label]')).toHaveText(
    'Add a baffle, rerun, and compare.',
  );
  await expect(page.locator('[data-frame="iterate"]')).toBeVisible();
  await expect(page.locator('[data-frame="iterate"] img')).toHaveJSProperty(
    'complete',
    true,
  );
  await expect(
    page.locator('[data-step-button][aria-pressed="true"]'),
  ).toHaveCount(1);
  await expect(page.locator('[data-frame="simulate"]')).toBeHidden();
  await page
    .locator('[data-workbench]')
    .screenshot({ path: testInfo.outputPath('workflow-iterate-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator('[data-workbench]')
    .screenshot({ path: testInfo.outputPath('workflow-iterate-mobile.png') });
  await setup.click();
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'set-up',
  );
  await expect(page.locator('[data-study-label]')).toHaveText('01 / Set up');
  await expect(page.locator('[data-workflow-label]')).toHaveText(
    'Define a tank, its fill level, and the motion.',
  );
  await expect(page.locator('[data-frame="set-up"]')).toBeVisible();
  await expect(page.locator('[data-frame="iterate"]')).toBeHidden();
});

test('workflow stages advance automatically every two seconds', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /Run simulation|Add baffle and rerun/ }),
  ).toHaveCount(0);
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'simulate',
    { timeout: 3000 },
  );
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'iterate',
    { timeout: 3000 },
  );
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'set-up',
    { timeout: 3000 },
  );
});

test('mobile menu, page navigation, FAQ, and skip link work', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Applications' })
    .click();
  await expect(page).toHaveURL(/\/showcases\/$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page
    .getByRole('link', { name: /Follow water through two outlets/ })
    .click();
  await expect(page).toHaveURL(/\/showcases\/liquid-handling\//);
  await menu.click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Applications' })
    .click();
  await expect(page).toHaveURL(/\/showcases\/$/);
  await page.goto('/');
  await page.getByText('Is Prelimina free?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText(
    'lawful noncommercial use',
  );
});

test('homepage order, primary actions, and application status communicate the prelaunch scope', async ({
  page,
}) => {
  await page.goto('/');
  const sections = await page
    .locator('main > section')
    .evaluateAll((sections) =>
      sections.map((section) => section.id || section.className),
    );
  expect(sections).toEqual([
    'hero container',
    'applications',
    'capabilities',
    'download',
    'faq',
    'container cta-wrap',
  ]);
  await expect(page.locator('.hero-actions .button-primary')).toHaveText(
    'Download now',
  );
  await expect(page.locator('.hero-actions .button-primary')).toHaveAttribute(
    'href',
    '/#download',
  );
  await expect(page.locator('.hero-actions .button-quiet')).toHaveAttribute(
    'href',
    '#applications',
  );
  await expect(page.locator('.cta-panel .button')).toHaveText('Download now');
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(
    page.locator('a').filter({ hasText: 'Discuss your case' }),
  ).toHaveCount(0);
  await expect(page.locator('.header-cta')).toHaveAttribute(
    'href',
    '/#download',
  );
  await expect(
    page
      .getByRole('navigation')
      .getByRole('link', { name: 'Evidence', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.showcase-card')).toHaveCount(2);
  const evidence: Record<string, string> = {
    'liquid-handling': 'Software demonstration',
    'spillway-gates': 'Software demonstration',
  };
  for (const slug of Object.keys(evidence)) {
    await page.goto(`/showcases/${slug}/`);
    await expect(page.locator('.application-status')).toContainText(
      'Availability: In development',
    );
    await expect(page.locator('.application-status')).toContainText(
      `Evidence: ${evidence[slug]}`,
    );
    await expect(page.locator('.page-container > .button')).toHaveAttribute(
      'href',
      /\/capabilities\/#/,
    );
  }
  await page.goto('/support/#early-access');
  await expect(page.locator('main')).toContainText(
    'Application inquiries are not open',
  );
  await expect(
    page.getByRole('link', { name: 'Open an email draft' }),
  ).toHaveCount(0);
  await page.goto('/#licensing');
  await expect(
    page.getByRole('link', { name: 'Ask about licensing' }),
  ).toHaveAttribute('href', /^mailto:licensing@prelimina\.com\?/);
});

test('capability panels lead to grouped features with a maturity label on every feature', async ({
  page,
}) => {
  await page.goto('/');
  const cards = page.locator('.capability-card');
  await expect(cards).toHaveCount(6);
  const destinations = await cards.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );
  await page.getByRole('link', { name: 'Explore all capabilities' }).click();
  await expect(page).toHaveURL(/\/capabilities\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Capabilities',
  );
  const labels = ['Implemented', 'Experimental', 'In development', 'Planned'];
  await expect(page.locator('.maturity-guide dt')).toHaveText(labels);
  await expect(page.locator('.capability-group h2')).toHaveText([
    'Fluid flow',
    'Geometry & boundaries',
    'Motion & coupling',
    'GPU computing',
    'Desktop workspace',
    'Measurements & output',
  ]);
  const featureGroups = await page
    .locator('.capability-group')
    .evaluateAll((groups) =>
      groups.map((group) => ({
        destination: `/capabilities/#${group.id}`,
        features: [
          ...group.querySelectorAll('.capability-feature-list li'),
        ].map((feature) => ({
          name: feature.querySelector('h3')?.textContent?.trim(),
          labels: [...feature.querySelectorAll('.maturity-badge')].map(
            (badge) => badge.textContent?.trim(),
          ),
        })),
      })),
    );
  expect(destinations).toEqual(featureGroups.map((group) => group.destination));
  for (const group of featureGroups) {
    expect(group.features.length).toBeGreaterThan(0);
    for (const feature of group.features) {
      expect(feature.name).toBeTruthy();
      expect(feature.labels).toHaveLength(1);
      expect(labels).toContain(feature.labels[0]);
    }
  }
  await page.goto('/capabilities/#measurements');
  await expect(page.locator('#measurements h2')).toBeInViewport();
  await page.goto('/');
  await page.getByRole('link', { name: /Start with your geometry/ }).click();
  await expect(page).toHaveURL(/\/capabilities\/#geometry$/);
  await expect(page.locator('#geometry h2')).toBeInViewport();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Capabilities', exact: true })
    .click();
  await expect(page).toHaveURL(/\/capabilities\/$/);
  await page.goto('/docs/');
  await expect(page).toHaveURL(/\/capabilities\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Capabilities',
  );
});

test('an approved configured contact enables real draft links with the edited outline', async ({
  page,
}, testInfo) => {
  const fixture = buildContactFixture();
  try {
    await page.route('**/*', async (route) => {
      const path = new URL(route.request().url()).pathname;
      await route.fulfill({
        path: join(
          fixture.output,
          path.endsWith('/') ? `${path}index.html` : path,
        ),
      });
    });
    await page.goto('/');
    await expect(page.locator('.hero-actions .button-primary')).toHaveText(
      'Download now',
    );
    await expect(page.locator('.header-cta')).toHaveText('Download now');
    await page
      .locator('.footer-links')
      .getByRole('link', { name: 'Discuss your case' })
      .click();
    await expect(page).toHaveURL(/\/support\/$/);
    await expect(page.locator('.contact-email')).toHaveText(
      'Email: inquiries@example.test',
    );
    await expect(page.locator('main')).not.toContainText(
      'inquiries are not open',
    );
    const draft = page.getByRole('link', { name: 'Open an email draft' });
    const outline =
      'Sloshing A & B? #fill = 50%\nΔ motion / μ liquid\n\nBcc: text stays in the body';
    await page.getByLabel('Your case outline').fill(outline);
    const href = await draft.getAttribute('href');
    expect(href).not.toBeNull();
    const url = new URL(href!);
    expect(url.pathname).toBe('inquiries@example.test');
    expect([...url.searchParams.keys()]).toEqual(['subject', 'body']);
    expect(url.searchParams.get('body')).toBe(outline);
    expect(url.hash).toBe('');
    // Prevent launching a mail client; check the destination at activation.
    await draft.evaluate((element) =>
      element.addEventListener('click', (event) => event.preventDefault()),
    );
    await draft.focus();
    await page.keyboard.press('Enter');
    expect(
      new URL((await draft.getAttribute('href'))!).searchParams.get('body'),
    ).toBe(outline);
    await expect(page.getByRole('status')).toBeEmpty();
    await page.getByLabel('Your case outline').fill('');
    expect(
      new URL((await draft.getAttribute('href'))!).searchParams.get('body'),
    ).toBe('');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: testInfo.outputPath('configured-contact-mobile.png'),
      fullPage: true,
    });
    const a11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(a11y.violations).toEqual([]);
    await page.goto('/#licensing');
    await expect(
      page.getByRole('link', { name: 'Ask about licensing' }),
    ).toHaveAttribute('href', /^mailto:licensing@prelimina\.com\?/);
    await expect(page.locator('main')).not.toContainText(
      'inquiries are not open',
    );
    await page.goto('/showcases/liquid-handling/');
    await expect(page.locator('.page-container > .button')).toHaveText(
      'Discuss your case',
    );
  } finally {
    await page.unrouteAll({ behavior: 'wait' });
    fixture.remove();
  }
});

test('contact copying is honest and the unavailable clipboard has a usable fallback', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/support/');
  await page
    .getByLabel('Your case outline')
    .fill('Compare two baffle arrangements.');
  await page.getByRole('button', { name: 'Copy your outline' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Outline copied. Nothing has been sent.',
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'Compare two baffle arrangements.',
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: () => Promise.reject(new Error('Unavailable')),
    });
  });
  await page.getByRole('button', { name: 'Copy your outline' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Your outline is selected',
  );
  await expect(page.getByLabel('Your case outline')).toBeFocused();
});

test('homepage downloads, combined FAQ, and retired routes work', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Download now' })
    .click();
  await expect(page).toHaveURL(/\/#download$/);
  await expect(page.locator('#download h2')).toBeInViewport();
  await expect(page.locator('.platform-card h3')).toHaveText([
    'Windows',
    'Linux',
    'macOS',
  ]);
  await expect(page.locator('.release-summary')).toContainText('v0.1');
  await expect(page.locator('.release-summary time')).toHaveAttribute(
    'datetime',
    /^\d{4}-\d{2}-\d{2}$/,
  );
  for (const platform of ['Windows', 'Linux']) {
    await expect(
      page.getByRole('link', { name: `Download for ${platform}`, exact: true }),
    ).toHaveAttribute(
      'href',
      /^https:\/\/github\.com\/prelimina\/desktop\/releases\/download\/v[\d.]+\//,
    );
  }
  await expect(
    page.getByRole('button', { name: 'Coming soon' }),
  ).toBeDisabled();
  await expect(page.locator('.platform-requirements').nth(1)).toContainText(
    'glibc 2.28',
  );
  await page.getByText('Is Prelimina free?', { exact: true }).click();
  await expect(page.locator('#faq details[open]')).toContainText(
    'lawful noncommercial use',
  );
  const commercial = page.getByText('Can I use it for commercial work?', {
    exact: true,
  });
  await commercial.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#faq details').nth(1)).toHaveAttribute('open', '');
  await expect(page.locator('#faq details').nth(1)).toContainText(
    'before the work begins',
  );
  await expect(page.locator('#faq details').nth(1)).toContainText(
    'business evaluation',
  );
  await page.getByRole('link', { name: 'Read the full agreement' }).click();
  await expect(page).toHaveURL(/\/licenses\/Prelimina-Licence-Agreement\.txt$/);
  await expect(page.locator('body')).toContainText(
    'Version 1.0 | 23 September 2026',
  );
  await expect(page.locator('body')).toContainText(
    'Free noncommercial licence',
  );
  await expect(page.locator('body')).toContainText(
    'Commercial use requires a paid entitlement',
  );
  await page.goto('/legal/');
  await expect(page.locator('main')).toContainText(
    'R. Boškovića 32, 21000 Split, Croatia',
  );
  await expect(page.locator('main')).toContainText('HR57846556748');
  await expect(
    page.getByRole('link', { name: 'licensing@prelimina.com', exact: true }),
  ).toHaveAttribute('href', /^mailto:licensing@prelimina\.com\?/);
  for (const route of ['/pricing/', '/download/']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/#download$/);
    await expect(page.locator('#download h2')).toBeInViewport();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/capabilities/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Download now' })
    .click();
  await expect(page).toHaveURL(/\/#download$/);
  await expect(page.locator('#download h2')).toBeInViewport();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  const removed = await page.goto('/validation/');
  expect(removed?.status()).toBe(404);
});

test('reduced motion and compact zoom layout remain readable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto('/');
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto');
  await page.locator('[data-step-button]').nth(1).click();
  await expect
    .poll(() =>
      page
        .locator('[data-frame="simulate"] img')
        .evaluate((image: HTMLImageElement) => image.currentSrc),
    )
    .toMatch(/\/assets\/workflow\/simulate-still\.webp$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('pages pass automated WCAG A and AA checks', async ({ page }) => {
  for (const route of [
    '/',
    '/showcases/',
    '/support/',
    '/capabilities/',
    '/showcases/liquid-handling/',
    '/showcases/spillway-gates/',
    '/legal/',
  ]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
      route,
    ).toEqual([]);
  }
});

test('capture desktop and mobile views and measure initial local resource weight', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: testInfo.outputPath('prelimina-desktop.png'),
    fullPage: true,
  });
  await page.screenshot({
    path: testInfo.outputPath('prelimina-hero-desktop.png'),
  });
  await page.locator('#download').screenshot({
    path: testInfo.outputPath('download-desktop.png'),
  });
  await page.locator('#capabilities').screenshot({
    path: testInfo.outputPath('capability-summary-desktop.png'),
  });
  const resources = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => ({
      name: new URL(entry.name).pathname,
      bytes: (entry as PerformanceResourceTiming).encodedBodySize,
    })),
  );
  console.log(
    'Homepage encoded resource bytes (local preview):',
    JSON.stringify(resources),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.screenshot({
    path: testInfo.outputPath('prelimina-mobile.png'),
    fullPage: true,
  });
  await page.locator('#download').screenshot({
    path: testInfo.outputPath('download-mobile.png'),
  });
  await page.locator('#capabilities').screenshot({
    path: testInfo.outputPath('capability-summary-mobile.png'),
  });
  for (const [route, width] of [
    ['/showcases/', 1440],
    ['/showcases/liquid-handling/', 1440],
    ['/capabilities/', 1440],
    ['/capabilities/', 390],
    ['/legal/', 390],
    ['/support/', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(route);
    await page.screenshot({
      path: testInfo.outputPath(
        `${route.replaceAll('/', '-').slice(1, -1)}-${width}.png`,
      ),
      fullPage: true,
    });
  }
});
