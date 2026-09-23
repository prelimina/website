import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function isPlainEmail(value) {
  return (
    typeof value === 'string' &&
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(
      value,
    )
  );
}

export function validateContent(site, { publication = false } = {}) {
  if (site.launchState !== 'prelaunch')
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
    });
    console.log(
      `Content checked: prelaunch preview, no active installers, publication ${site.publicationApproved ? 'approved' : 'not approved'}.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
