// Structured rendering of validated release notes. validateRelease already
// rejects HTML, links, images and code fences, so only this Markdown subset can
// occur: headings, paragraphs, bullet/numbered lists, **bold**, *italic*, `code`.
// The output is plain data rendered through Astro's escaping, never raw HTML.

/** @typedef {{ type: 'text' | 'strong' | 'em' | 'code', text: string }} InlinePart */
/**
 * @typedef {{ type: 'heading', level: number, inline: InlinePart[] }
 *   | { type: 'p', inline: InlinePart[] }
 *   | { type: 'list', ordered: boolean, items: InlinePart[][] }} NoteBlock
 */

/**
 * @param {string} text
 * @returns {InlinePart[]}
 */
export function parseInline(text) {
  /** @type {InlinePart[]} */
  const parts = [];
  const pattern = /\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*|_(.+?)_|`(.+?)`/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ type: 'text', text: text.slice(last, match.index) });
    const [, strong, strong2, em, em2, code] = match;
    if (strong ?? strong2) parts.push({ type: 'strong', text: strong ?? strong2 });
    else if (em ?? em2) parts.push({ type: 'em', text: em ?? em2 });
    else parts.push({ type: 'code', text: code });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

/**
 * @param {string} notes Notes without their leading `# Prelimina x.y.z` title.
 * @returns {NoteBlock[]}
 */
export function parseReleaseNotes(notes) {
  /** @type {NoteBlock[]} */
  const blocks = [];
  /** @type {string[]} */
  let paragraph = [];
  /** @type {{ type: 'list', ordered: boolean, items: InlinePart[][] } | null} */
  let list = null;
  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', inline: parseInline(paragraph.join(' ')) });
    paragraph = [];
    if (list) blocks.push(list);
    list = null;
  };
  for (const raw of notes.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (!line) flush();
    else if (heading) {
      flush();
      blocks.push({ type: 'heading', level: Math.min(heading[1].length + 1, 6), inline: parseInline(heading[2]) });
    } else if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (paragraph.length || (list && list.ordered !== ordered)) flush();
      list ??= { type: 'list', ordered, items: [] };
      list.items.push(parseInline((bullet ?? numbered)[1]));
    } else if (list && /^\s/.test(raw)) {
      list.items.at(-1).push({ type: 'text', text: ' ' }, ...parseInline(line));
    } else {
      if (list) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
