// =============================================================================
// print/definitions.ts — collecting inline definitions for the paper glossary
// -----------------------------------------------------------------------------
// On screen a definition is a disclosure a student opens on demand. On paper
// there is nothing to open, so the print stylesheet hides the disclosure and
// the content would simply not exist — fine when a definition was a short
// gloss, a real loss now that one can carry a display equation, a list, and a
// figure. This collects them for the appendix that replaces the popover.
//
// THE WALK IS STRUCTURAL, NOT TYPE-DIRECTED, and that is the whole design.
// A definition mark can ride any text node, and text nodes live in far more
// places than the block list suggests: block prose, list items at any nesting
// depth, blank hints, per-answer mistake feedback, choice content, matching and
// ordering sides, callouts, worked and faded examples, graph prompts, and the
// reference panel. An exhaustive typed visitor would be long AND would silently
// miss the next block type somebody adds. This cannot: it finds a definition
// wherever it is, and a new block type costs nothing.
//
// PORTED, deliberately, from packages/renderer/src/definition-glossary.ts
// rather than imported from it. The viewer must not take a dependency on the
// renderer it is replacing — the renderer dies at S9 (publish-activity is its
// one remaining consumer) and this would become a dangling import. Two copies
// exist until then, held equal by the bond test in the RENDERER's suite
// (packages/renderer/tests/definition-glossary.test.ts — placed there so the
// bond dies with the renderer, in the same breath as the copy-delete on the
// S9 cutover checklist, C8). The original containment plan named the
// cross-surface parity gate, which retired in S5.5 before the renderer did —
// the lesson that became policy P5 (a comment citing a guard rots when the
// guard retires). Same posture as S4-6 (scorer duplication contained by one
// shared corpus, not by refactoring code that is about to be deleted).
// =============================================================================

import type { DefinitionBlock } from '@activity/schema';

export interface GlossaryEntry {
  readonly term: string;
  readonly content: DefinitionBlock[];
}

/** A text node carrying marks. Structural, because the walk is not
 * type-directed — anything shaped like this is a candidate. */
interface MarkedText {
  type?: unknown;
  text?: unknown;
  marks?: unknown;
}

/**
 * Every distinct defined term in the document, alphabetically.
 *
 * Dedup is by term, case-insensitively, FIRST OCCURRENCE WINS — the convention
 * the vocabulary design already commits to. Two senses of one word therefore
 * collapse on paper. That is a known limitation with a known owner (the
 * reserved `glossaryKey` field, when the Phase 4 activity-level glossary
 * lands), and it is a better failure than printing "factor" twice with no way
 * to tell which entry belongs to which use.
 *
 * Alphabetical rather than document order because an appendix is looked up,
 * not read through.
 */
export function collectDefinitions(doc: unknown): GlossaryEntry[] {
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
          // An empty definition is inert on screen (the term is not even
          // clickable); keep it out of the appendix for the same reason —
          // a glossary entry with no definition is worse than no entry.
          if (term && Array.isArray(content) && content.length > 0) {
            const key = term.toLowerCase();
            if (!byKey.has(key)) {
              byKey.set(key, { term, content: content as DefinitionBlock[] });
            }
          }
        }
      }
    }

    for (const child of Object.values(value as Record<string, unknown>)) {
      visit(child);
    }
  };

  const document = doc as { sections?: unknown; referencePanel?: { blocks?: unknown } };
  visit(document.sections);
  if (document.referencePanel) visit(document.referencePanel.blocks);

  return [...byKey.values()].sort((a, b) =>
    a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }),
  );
}
