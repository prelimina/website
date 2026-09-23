import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { validateContent } from '../scripts/check-content.mjs';
import {
  getInquiryState,
  inquiryHref,
  inquiryOutline,
} from '../src/content/inquiry.mjs';

const site = JSON.parse(
  readFileSync(new URL('../src/content/site.json', import.meta.url), 'utf8'),
);
test('prelaunch accepts an unconfigured contact without creating a fake endpoint', () => {
  assert.doesNotThrow(() => validateContent({ ...site, contactEmail: null }));
});
test('only a plain email address can become a contact link', () => {
  assert.doesNotThrow(() =>
    validateContent({ ...site, contactEmail: 'hello@example.com' }),
  );
  for (const contactEmail of [
    'javascript:alert(1)',
    'hi@example.com?bcc=someone@example.com',
    'hello@example.com\nBcc: x@y.com',
    '',
    123,
  ]) {
    assert.throws(
      () => validateContent({ ...site, contactEmail }),
      /contactEmail/,
    );
  }
});
test('the licensing contact cannot inject mail headers or open general inquiries', () => {
  for (const email of [
    '',
    null,
    'legal@example.test?bcc=other@example.test',
    'legal@example.test\nBcc: other@example.test',
  ]) {
    assert.throws(
      () => validateContent({ ...site, licence: { ...site.licence, email } }),
      /licence.email/,
    );
  }
  assert.equal(site.contactEmail, null);
  assert.equal(getInquiryState(site.contactEmail).open, false);
});
test('downloads cannot silently activate with an unsupported launch state', () => {
  for (const launchState of ['alpha_open', 'released', '', undefined])
    assert.throws(
      () => validateContent({ ...site, launchState }),
      /only supports prelaunch/,
    );
});
test('publication requires explicit owner approval while local drafts remain buildable', () => {
  assert.doesNotThrow(() =>
    validateContent({ ...site, publicationApproved: false }),
  );
  assert.throws(
    () =>
      validateContent(
        { ...site, publicationApproved: false },
        { publication: true },
      ),
    /Publication is blocked/,
  );
  assert.doesNotThrow(() =>
    validateContent(
      { ...site, publicationApproved: true },
      { publication: true },
    ),
  );
});
test('publication approval must be an explicit boolean', () => {
  assert.throws(
    () => validateContent({ ...site, publicationApproved: 'true' }),
    /publicationApproved/,
  );
});
test('unfinished content tokens are rejected', () => {
  assert.throws(
    () => validateContent({ ...site, company: '{{COMPANY}}' }),
    /Unresolved/,
  );
});

test('the primary action and status follow inquiry availability', () => {
  const closed = getInquiryState(null);
  assert.equal(closed.open, false);
  assert.deepEqual(closed.primary, {
    label: 'Explore applications',
    href: '/showcases/',
  });
  assert.match(closed.status, /In development\. Explore/);
  const open = getInquiryState('inquiries@example.test');
  assert.equal(open.open, true);
  assert.deepEqual(open.primary, {
    label: 'Discuss your case',
    href: '/support/#early-access',
  });
  assert.match(open.status, /Discuss suitability/);
});

test('email drafts preserve the complete edited outline without creating extra headers', () => {
  const outline =
    'Tank A & B? #fill = 50%\nΔ motion: ±2\nBcc: stays in the body\n\n';
  const address = 'case+team?tag#one@example.test';
  assert.doesNotThrow(() =>
    validateContent({ ...site, contactEmail: address }),
  );
  const url = new URL(inquiryHref(address, outline));
  assert.equal(url.protocol, 'mailto:');
  assert.equal(decodeURIComponent(url.pathname), address);
  assert.equal(url.hash, '');
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
  assert.equal(url.searchParams.get('subject'), 'Prelimina — discuss my case');
  assert.equal(url.searchParams.get('body'), outline);
  assert.equal(new URL(inquiryHref(address, '')).searchParams.get('body'), '');
  assert.match(inquiryOutline, /design question/);
  assert.match(inquiryOutline, /compare/);
  assert.match(inquiryOutline, /decision/);
  assert.match(inquiryOutline, /optional/);
});

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
}
test('all built local links, anchors, and assets exist, and every page stays noindex', () => {
  const root = resolve('dist');
  assert.ok(existsSync(root), 'Run npm run build before npm test.');
  const htmlFiles = files(root).filter((path) => path.endsWith('.html'));
  assert.equal(htmlFiles.length, 12);
  for (const path of htmlFiles) {
    const html = readFileSync(path, 'utf8');
    if (
      ['pricing', 'download'].some(
        (route) => path === join(root, route, 'index.html'),
      )
    ) {
      assert.match(html, /name="robots" content="noindex"/);
      assert.match(html, /http-equiv="refresh" content="0;url=\/#download"/);
    } else {
      assert.match(html, /name="robots" content="noindex, nofollow"/);
      assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
    }
    assert.doesNotMatch(
      html,
      /<iframe|action="https?:|src="https?:|href="javascript:/,
    );
    for (const match of html.matchAll(
      /(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g,
    )) {
      const url = match[1];
      const target = join(root, url.endsWith('/') ? `${url}index.html` : url);
      assert.ok(existsSync(target), `${path}: missing ${url}`);
    }
    for (const [, route, fragment] of html.matchAll(
      /href="(\/[^"#?]*)?#([^"?]+)"/g,
    )) {
      const target = route
        ? join(root, route.endsWith('/') ? `${route}index.html` : route)
        : path;
      assert.ok(
        readFileSync(target, 'utf8').includes(
          `id="${decodeURIComponent(fragment)}"`,
        ),
        `${path}: missing anchor ${route || ''}#${fragment}`,
      );
    }
  }
  const download = readFileSync(join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(download, /href="[^"]+\.(exe|msi|dmg|zip|AppImage)/);
  assert.match(download, /Downloads will be published on GitHub Releases/);
});

test('active pages remain available and retired pages are removed or redirected', () => {
  for (const route of [
    'showcases',
    'docs',
    'support',
    'pricing',
    'legal',
    'download',
    'changelog',
    'showcases/baffle-design',
    'showcases/tank-motion',
    'showcases/liquid-handling',
  ]) {
    assert.ok(existsSync(join('dist', route, 'index.html')), route);
  }
  assert.equal(existsSync('dist/validation/index.html'), false);
  for (const route of ['pricing', 'download']) {
    assert.match(
      readFileSync(`dist/${route}/index.html`, 'utf8'),
      /http-equiv="refresh" content="0;url=\/#download"/,
    );
  }
});

test('licensing summaries link the supplied agreement and preserve its core permissions', () => {
  const agreement = readFileSync(join('public', site.licence.href), 'utf8');
  assert.equal(
    readFileSync(join('dist', site.licence.href), 'utf8'),
    agreement,
  );
  assert.match(
    agreement,
    /^# Prelimina Licence Agreement\n\nVersion 1\.0 \| 23 September 2026/,
  );
  assert.ok(agreement.includes(site.licence.email));
  assert.ok(agreement.includes(site.licence.address));
  assert.ok(agreement.includes(site.licence.vatId));
  assert.equal(site.licence.version, '1.0');
  assert.equal(site.licence.date, '2026-09-23');
  for (const section of [
    '2. Free noncommercial licence',
    '3. Commercial use requires a paid entitlement',
    '5. Your data and results',
    '6. You must independently verify results',
    '8. Exclusion of liability and mandatory exceptions',
    '10. Governing law and other terms',
  ]) {
    assert.ok(agreement.includes(`## ${section}`), section);
  }
  const licensing = readFileSync('dist/index.html', 'utf8')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ');
  assert.match(licensing, /Is Prelimina free\?/);
  assert.match(
    licensing,
    /No purchase, subscription, academic affiliation, or separate permission is required/,
  );
  assert.match(
    licensing,
    /paid commercial licence or subscription before the work begins\. This includes business evaluation/,
  );
  assert.match(
    licensing,
    /no limits on users, installations, computing capacity, simulation size, or duration of noncommercial use/,
  );
  assert.match(licensing, /Do I keep my data and results\?/);
  for (const path of ['dist/index.html', 'dist/legal/index.html']) {
    const html = readFileSync(path, 'utf8');
    assert.ok(html.includes(`href="${site.licence.href}"`));
    assert.doesNotMatch(
      html,
      /Access terms to be published|terms are not yet approved|terms are not yet published|eligibility will be stated/i,
    );
    assert.ok(html.includes(`mailto:${site.licence.email}`));
  }
});

test('prelaunch pages do not invent downloads, offers, evidence, or private source links', () => {
  for (const path of files(resolve('dist')).filter((file) =>
    file.endsWith('.html'),
  )) {
    const html = readFileSync(path, 'utf8');
    assert.doesNotMatch(
      html,
      /href="[^"]+\.(?:exe|msi|dmg|zip|AppImage)(?:[?#"][^>]*)?/i,
    );
    assert.doesNotMatch(
      html,
      /schema\.org\/Offer|"@type"\s*:\s*"Offer"|[€£$]\s*\d|\b\d+\s*(?:EUR|USD)\b|checkout|\bfree trial\b|\bearly.adopter offer\b/i,
    );
    assert.doesNotMatch(
      html,
      /https?:[^"\s<>]*SlangSolvers|github\.com\/[^"\s<>]*SlangSolvers/i,
    );
    assert.doesNotMatch(html, /href="\/(?:validation|pricing|download)\//);
    if (path !== resolve('dist/index.html')) {
      assert.doesNotMatch(
        html,
        /<[^>]+(?:disabled|aria-disabled="true")[^>]*>/,
      );
    }
  }
  for (const path of files(resolve('src'))) {
    assert.doesNotMatch(
      readFileSync(path, 'utf8'),
      /[€£$]\s*\d|\b\d+\s*(?:EUR|USD)\b/,
      path,
    );
  }
  const home = readFileSync('dist/index.html', 'utf8');
  const navigation = home.match(/<nav\b[^>]*>(.*?)<\/nav>/s)?.[1];
  assert.ok(navigation);
  assert.match(navigation, /Applications/);
  assert.match(navigation, /href="\/#download"[^>]*>\s*Download\s*</);
  assert.doesNotMatch(navigation, /Showcases|\/download\/|\/changelog\//);
  assert.doesNotMatch(navigation, /Evidence|Access &amp; licensing/);
  assert.ok(home.includes(`href="${site.downloadPreview.releasesUrl}"`));
  assert.ok(home.includes(`v${site.downloadPreview.version}`));
  assert.ok(home.includes(`datetime="${site.downloadPreview.date}"`));
  for (const slug of ['baffle-design', 'tank-motion', 'liquid-handling']) {
    const application = readFileSync(
      `dist/showcases/${slug}/index.html`,
      'utf8',
    );
    assert.match(application, /Candidate application/);
    assert.match(application, /Evidence: Illustration/);
    assert.match(
      application,
      slug === 'liquid-handling'
        ? /Availability: Planned/
        : /Availability: In development/,
    );
    assert.match(application, /Candidate comparison quantities/);
    assert.match(application, /Physical assumptions/);
    assert.match(application, /Numerical limitations/);
  }
});
