import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  for (const width of [360, 768, 1440]) {
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
}) => {
  await page.goto('/');
  const compare = page.getByRole('button', { name: '03 Compare' });
  await compare.focus();
  await page.keyboard.press('Enter');
  await expect(compare).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.bench-screen')).toHaveAttribute('data-step', '2');
  await expect(page.locator('#study-caption')).toHaveText(
    'Put your next design choice in perspective.',
  );
  await expect(
    page.locator('[data-step-button][aria-pressed="true"]'),
  ).toHaveCount(1);
  await page.getByRole('button', { name: '04 Refine' }).click();
  await expect(page.locator('#study-caption')).toHaveText(
    'Take a more informed next step.',
  );
  await page.getByRole('button', { name: '01 Define' }).click();
  await expect(page.locator('.bench-screen')).toHaveAttribute('data-step', '0');
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
    .getByRole('link', { name: 'Showcases' })
    .click();
  await expect(page).toHaveURL(/\/showcases\//);
  await page.getByRole('link', { name: /STUDY \/ 01/ }).click();
  await expect(page).toHaveURL(/\/showcases\/baffle-design\//);
  await page.goto('/');
  await page.getByText('Are these validated results?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText(
    'workflow schematics',
  );
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
    '/support/',
    '/download/',
    '/docs/',
    '/showcases/baffle-design/',
    '/pricing/',
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
});
