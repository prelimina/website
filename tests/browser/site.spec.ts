import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { join } from 'node:path';
import { buildContactFixture } from './contact-fixture';

const routes = [
  '/',
  '/showcases/',
  '/download/',
  '/docs/',
  '/support/',
  '/validation/',
  '/pricing/',
  '/legal/',
  '/changelog/',
  '/showcases/baffle-design/',
  '/showcases/tank-motion/',
  '/showcases/liquid-handling/',
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
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
      await expect(page.locator('main')).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test('schematic controls update selected state, drawing, and caption with keyboard support', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  const controls = page.getByRole('group', {
    name: 'Explore the workflow illustration',
  });
  await expect(controls.getByRole('button')).toHaveText(
    ['01 Setup', '02 Simulate', '03 Optimize'],
    { useInnerText: true },
  );
  await expect(page.locator('.workflow-rail h3')).toHaveText([
    'Scene',
    'Prepare',
    'Simulate',
  ]);
  await expect(page.locator('.workflow-arrow')).toHaveCount(2);
  const setup = controls.getByRole('button', { name: '01 Setup' });
  await setup.focus();
  await page.keyboard.press('Enter');
  await expect(setup).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'setup',
  );
  await expect(page.locator('[data-study-label]')).toHaveText('01 / Setup');
  await expect(page.locator('.probe-marker')).toBeHidden();
  await page.keyboard.press('Tab');
  await expect(
    controls.getByRole('button', { name: '02 Simulate' }),
  ).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'simulate',
  );
  await expect(page.locator('.probe-marker')).toBeVisible();
  await expect(page.locator('#study-caption')).toHaveText(
    'Inspect liquid motion and choose where to sample the response.',
  );
  await page.keyboard.press('Tab');
  const optimize = controls.getByRole('button', { name: '03 Optimize' });
  await expect(optimize).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(optimize).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'optimize',
  );
  await expect(page.locator('[data-study-label]')).toHaveText('03 / Optimize');
  await expect(page.locator('#study-caption')).toHaveText(
    'Refine the baffle layout in your geometry tools, then rerun and compare.',
  );
  await expect(page.locator('.bench-screen .baffles')).toHaveCSS(
    'transform',
    'matrix(1, 0, 0, 1, 22, 0)',
  );
  await expect(
    page.locator('[data-step-button][aria-pressed="true"]'),
  ).toHaveCount(1);
  await expect(page.locator('.probe-marker')).toBeHidden();
  await page
    .locator('[data-workbench]')
    .screenshot({ path: testInfo.outputPath('workflow-optimize-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator('[data-workbench]')
    .screenshot({ path: testInfo.outputPath('workflow-optimize-mobile.png') });
  await setup.click();
  await expect(page.locator('.bench-screen')).toHaveAttribute(
    'data-stage',
    'setup',
  );
  await expect(page.locator('[data-study-label]')).toHaveText('01 / Setup');
  await expect(page.locator('.bench-screen .baffles')).toHaveCSS(
    'transform',
    'none',
  );
  await expect(page.locator('#study-caption')).toHaveText(
    'Define a tank, its fill level, and the baffle geometry.',
  );
  await expect(page.locator('.probe-marker')).toBeHidden();
  await expect(page.locator('.screen-bottom')).toContainText(
    'Workflow illustration — not simulation results',
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
  await expect(page).toHaveURL(/\/showcases\//);
  await page.getByRole('link', { name: /APPLICATION \/ 01/ }).click();
  await expect(page).toHaveURL(/\/showcases\/baffle-design\//);
  await page.goto('/');
  await page.getByText('Are these validated results?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText(
    'workflow illustrations',
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
    'workflow',
    'product',
    'evidence',
    'faq',
    'container cta-wrap',
  ]);
  await expect(page.locator('.hero-actions .button-primary')).toHaveText(
    'Explore applications',
  );
  await expect(page.locator('.hero-actions .button-primary')).toHaveAttribute(
    'href',
    '/showcases/',
  );
  await expect(page.locator('.hero-note')).toContainText(
    'In development. Explore the initial application focus below.',
  );
  await expect(page.locator('.cta-panel .button')).toHaveText(
    'Explore applications',
  );
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(
    page.locator('a').filter({ hasText: 'Discuss your case' }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation')
      .getByRole('link', { name: 'Evidence', exact: true }),
  ).toHaveAttribute('href', '/validation/');
  await expect(page.locator('.application-status')).toHaveCount(3);
  for (const slug of ['baffle-design', 'tank-motion', 'liquid-handling']) {
    await page.goto(`/showcases/${slug}/`);
    await expect(page.locator('.application-status')).toContainText(
      slug === 'liquid-handling'
        ? 'Availability: Planned'
        : 'Availability: In development',
    );
    await expect(page.locator('.application-status')).toContainText(
      'Evidence: Illustration',
    );
    await expect(page.locator('.page-container > .button')).toHaveAttribute(
      'href',
      /\/docs\/#/,
    );
  }
  await page.goto('/support/#early-access');
  await expect(page.locator('main')).toContainText(
    'Application inquiries are not open',
  );
  await expect(
    page.getByRole('link', { name: 'Open an email draft' }),
  ).toHaveCount(0);
  await page.goto('/pricing/');
  await expect(
    page.getByRole('link', { name: 'Ask about licensing' }),
  ).toHaveAttribute('href', /^mailto:licensing@prelimina\.com\?/);
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
      'Discuss your case',
    );
    await expect(page.locator('.hero-note')).toContainText(
      'In development. Discuss suitability for your application.',
    );
    await expect(page.locator('.header-cta')).toHaveText('Discuss your case');
    await expect(page.locator('.cta-panel .button')).toHaveText(
      'Discuss your case',
    );
    await page.locator('.hero-actions .button-primary').click();
    await expect(page).toHaveURL(/\/support\/#early-access$/);
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
    await page.goto('/pricing/');
    await expect(page.locator('main .button')).toHaveAttribute(
      'href',
      /^mailto:licensing@prelimina\.com\?/,
    );
    await expect(page.locator('main')).not.toContainText(
      'inquiries are not open',
    );
    await page.goto('/showcases/baffle-design/');
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

test('the supplied licence is readable while software downloads remain unavailable', async ({
  page,
}) => {
  await page.goto('/pricing/');
  await expect(
    page.getByRole('heading', { name: 'Free noncommercial use', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Commercial use', exact: true }),
  ).toBeVisible();
  await expect(page.locator('main')).toContainText(
    'Commercial evaluation requires a paid entitlement before it starts',
  );
  await expect(page.locator('main')).toContainText(
    'no public installer is available here yet',
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
  expect(
    await page
      .locator('.bench-screen .baffles')
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe('0s');
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
    '/download/',
    '/docs/',
    '/showcases/baffle-design/',
    '/pricing/',
    '/validation/',
    '/showcases/liquid-handling/',
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
  for (const [route, width] of [
    ['/showcases/', 1440],
    ['/showcases/baffle-design/', 1440],
    ['/docs/', 1440],
    ['/validation/', 390],
    ['/pricing/', 1440],
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
