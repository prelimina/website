import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import site from './site.json' with { type: 'json' };

// Turns the published plain-text agreement into blocks rendered as escaped text,
// so the web page and the .txt copy can never diverge.
/**
 * @typedef {{ type: 'h2', id: string, text: string }
 *   | { type: 'ul', items: string[] }
 *   | { type: 'p', lines: string[] }} AgreementBlock
 */
/** @param {string} text @returns {AgreementBlock[]} */
export function parseAgreement(text) {
  /** @type {AgreementBlock[]} */
  const blocks = [];
  // Skip the title and the version line; the page shows both itself.
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .slice(2);
  for (const paragraph of paragraphs) {
    const lines = paragraph.split('\n');
    const heading = lines[0].match(/^## ((\d+)\..*)$/);
    if (heading) {
      blocks.push({
        type: 'h2',
        id: `section-${heading[2]}`,
        text: heading[1],
      });
    } else if (lines[0].startsWith('- ')) {
      /** @type {string[]} */
      const items = [];
      for (const line of lines) {
        if (line.startsWith('- ')) items.push(line.slice(2));
        else items[items.length - 1] += ` ${line.trim()}`;
      }
      blocks.push({ type: 'ul', items });
    } else if (lines.every((line) => line.length < 60)) {
      // Address-style blocks keep their line breaks.
      blocks.push({ type: 'p', lines });
    } else {
      blocks.push({ type: 'p', lines: [lines.join(' ')] });
    }
  }
  return blocks;
}

export const licenceAgreement = parseAgreement(
  readFileSync(join(process.cwd(), 'public', site.licence.textHref), 'utf8'),
);
