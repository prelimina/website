import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalogue } from '../src/data/releases.mjs';

function isPlainEmail(value) {
  return (
    typeof value === 'string' &&
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(
      value,
    )
  );
}

export function validateContent(site, { publication = false, catalogue = null } = {}) {
  if (site.launchState !== 'prelaunch' && !(site.launchState === 'alpha_open' && catalogue?.current))
    throw new Error(
      'This design iteration only supports prelaunch. Integrate the shared release manifest and approved release terms before opening downloads.',
    );
  if (typeof site.publicationApproved !== 'boolean')
    throw new Error(
      'publicationApproved must explicitly record whether the website owner approved publishing this preview.',
    );
  if (site.contactEmail !== null && !isPlainEmail(site.contactEmail))
    throw new Error(
      'contactEmail must be null or a plain valid email address.',
    );
  if (
    site.newsletter?.action != null &&
    !/^https:\/\/[a-z0-9]+\.sibforms\.com\/serve\/[A-Za-z0-9_=-]+$/.test(site.newsletter.action)
  )
    throw new Error('newsletter.action must be null or a Brevo form endpoint.');
  if (!isPlainEmail(site.licence?.email))
    throw new Error('licence.email must be a plain valid licensing address.');
  if (!site.company || !site.name || !site.hero?.descriptor)
    throw new Error('Required product content is missing.');
  if (/\{\{[^}]+\}\}/.test(JSON.stringify(site)))
    throw new Error('Unresolved content tokens found.');
  if (publication && !site.publicationApproved)
    throw new Error(
      'Publication is blocked until the website owner approves publishing this prelaunch preview.',
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const site = JSON.parse(
      readFileSync(
        new URL('../src/content/site.json', import.meta.url),
        'utf8',
      ),
    );
    validateContent(site, {
      publication: process.argv.includes('--publication'),
      catalogue: loadCatalogue(),
    });
    console.log(
      `Content checked: ${loadCatalogue().current ? 'verified release catalogue' : 'prelaunch preview'}, website publication ${site.publicationApproved ? 'approved' : 'not approved'}.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
