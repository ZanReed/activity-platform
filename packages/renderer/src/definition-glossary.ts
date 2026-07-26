// =============================================================================
// definition-glossary.ts — Print appendix for inline vocabulary definitions
// -----------------------------------------------------------------------------
// On screen a definition is a popover a student opens on demand; the print
// stylesheet hides `.definition-popover` outright, so on paper the content
// simply does not exist. That was fine when a definition was a short gloss and
// is a bug now that one can carry a display equation, a list, and a figure
// (docs/design/definition-rich-content.md, D4). This module renders the paper
// surface: a glossary appendix at the END of the worksheet, gated by
// meta.print.printDefinitionGlossary (OFF by default — see the schema comment).
//
// Collection is a STRUCTURAL walk over the document's plain data, not a typed
// per-block-type visitor. That is deliberate. A definition mark can ride any
// text node, and text nodes live in far more places than the block list
// suggests: block prose, list items (at any nesting depth), blank hints and
// per-answer mistake feedback, multiple-choice prompts / choices / feedback /
// solutions, matching and ordering sides, callouts, worked and faded examples,
// math-block solutions, graph prompts, and the reference panel. An exhaustive
// typed walker would be long AND would silently miss the next block type
// somebody adds. The structural walk cannot: it finds a definition wherever it
// is, and a new block type costs nothing. The renderer stays pure — this reads
// the document it was handed and returns a string.
// =============================================================================

import type { ActivityDocument, DefinitionBlock } from '@activity/schema';
import { escape } from './html.js';
import { renderDefinitionBlocks } from './definition-content.js';

export interface GlossaryEntry {
  term: string;
  content: DefinitionBlock[];
}

// A text node carrying a definition mark. Structural, because the walk is not
// type-directed — see the header.
interface MarkedText {
  type?: unknown;
  text?: unknown;
  marks?: unknown;
}

/**
 * Every distinct defined term in the document, in alphabetical order.
 *
 * Dedup is by term, case-insensitively, FIRST OCCURRENCE WINS — the same
 * convention the vocabulary design already commits to for suggestions. Two
 * senses of one word therefore collapse on paper; that is what the reserved
 * `glossaryKey` is for when the Phase 4 glossary lands, and it is a better
 * failure than printing "factor" twice with no way to tell which is which.
 *
 * Alphabetical rather than document order because an appendix is looked up, not
 * read through.
 */
export function collectDefinitions(doc: ActivityDocument): GlossaryEntry[] {
  const byKey = new Map<string, GlossaryEntry>();

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (value === null || typeof value !== 'object') return;

    const node = value as MarkedText;
    if (
      node.type === 'text' &&
      typeof node.text === 'string' &&
      Array.isArray(node.marks)
    ) {
      for (const mark of node.marks) {
        if (
          mark !== null &&
          typeof mark === 'object' &&
          (mark as { type?: unknown }).type === 'definition'
        ) {
          const content = (mark as { content?: unknown }).content;
          const term = node.text.trim();
          // An empty definition is inert on screen (the sidecar makes the term
          // unclickable); keep it out of the appendix for the same reason.
          if (term && Array.isArray(content) && content.length > 0) {
            const key = term.toLowerCase();
            if (!byKey.has(key)) {
              byKey.set(key, { term, content: content as DefinitionBlock[] });
            }
          }
        }
      }
    }

    // Recurse into every own value — the walk is structural, so it needs no
    // knowledge of which fields hold inline content.
    for (const child of Object.values(value as Record<string, unknown>)) {
      visit(child);
    }
  };

  visit(doc.sections);
  if (doc.referencePanel) visit(doc.referencePanel.blocks);

  return [...byKey.values()].sort((a, b) =>
    a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }),
  );
}

/**
 * The appendix itself. Returns '' when there is nothing to print, so callers
 * can concatenate unconditionally.
 *
 * data-block-category="scaffold" matches the reference print box: it is
 * teacher-provided support material, never scored and never walked by the
 * runtime (it sits outside any .activity-section).
 */
export function renderDefinitionGlossary(doc: ActivityDocument): string {
  const entries = collectDefinitions(doc);
  if (entries.length === 0) return '';
  return (
    '<aside class="definition-glossary" data-block-category="scaffold">' +
    '<h2 class="definition-glossary-title">Glossary</h2>' +
    '<dl class="definition-glossary-list">' +
    entries
      .map(
        (entry) =>
          '<dt class="definition-glossary-term">' +
          escape(entry.term) +
          '</dt>' +
          '<dd class="definition-glossary-body">' +
          renderDefinitionBlocks(entry.content) +
          '</dd>',
      )
      .join('') +
    '</dl>' +
    '</aside>'
  );
}
