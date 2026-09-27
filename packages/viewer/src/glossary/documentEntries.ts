// =============================================================================
// glossary/documentEntries.ts — what the served document itself defines
// -----------------------------------------------------------------------------
// Two kinds of definition mark reach a student (docs/design/glossary.md R9):
//
//   LOCAL   — `[[term :: …]]` or a ```definitions fence entry. No glossaryKey.
//             The activity's own words; it wins over the course glossary.
//   KEYED   — a `[[term]]` the importer resolved against the course glossary.
//             Carries `glossaryKey` and a BAKED copy of the entry's body (L3),
//             so print and an offline first tap still have something to show.
//             The live store row replaces the baked copy once it loads (EN-4).
//
// The walk is structural, like print/definitions.ts's: a mark can ride any
// text node anywhere, and a typed visitor would silently miss the next block
// type somebody adds. The paper appendix keeps its own walk on purpose — print
// is untouched by this arc (author ruling) and must stay byte-identical.
// =============================================================================

import {
  localEntryId,
  termKey,
  type DefinitionBlock,
  type GlossarySourceEntry,
} from '@activity/schema';

export interface DocumentGlossary {
  /** Local definitions, first per term. */
  readonly local: readonly GlossarySourceEntry[];
  /** Baked bodies of keyed marks, first per key — the store's stand-in until
   * (or unless) the live read lands. */
  readonly baked: readonly GlossarySourceEntry[];
  /** Every entry id a mark in this activity points at, in document order —
   * the "In this activity" group (T2). */
  readonly referencedIds: readonly string[];
}

interface MarkedText {
  type?: unknown;
  text?: unknown;
  marks?: unknown;
}

interface DefinitionMarkLike {
  type?: unknown;
  content?: unknown;
  definition?: unknown;
  glossaryKey?: unknown;
}

function bodyOf(mark: DefinitionMarkLike): DefinitionBlock[] {
  if (Array.isArray(mark.content)) return mark.content as DefinitionBlock[];
  if (typeof mark.definition === 'string' && mark.definition) {
    return [
      { type: 'paragraph', content: [{ type: 'text', text: mark.definition, marks: [] }] },
    ];
  }
  return [];
}

export function collectDocumentGlossary(doc: unknown): DocumentGlossary {
  const local = new Map<string, GlossarySourceEntry>();
  const baked = new Map<string, GlossarySourceEntry>();
  const referenced: string[] = [];
  const seen = new Set<string>();

  const note = (id: string): void => {
    if (seen.has(id)) return;
    seen.add(id);
    referenced.push(id);
  };

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (value === null || typeof value !== 'object') return;
    const node = value as MarkedText;
    if (node.type === 'text' && typeof node.text === 'string' && Array.isArray(node.marks)) {
      for (const raw of node.marks) {
        const mark = raw as DefinitionMarkLike;
        if (mark === null || typeof mark !== 'object' || mark.type !== 'definition') continue;
        const text = node.text.trim();
        if (!text) continue;
        const body = bodyOf(mark);
        if (typeof mark.glossaryKey === 'string' && mark.glossaryKey) {
          const id = mark.glossaryKey;
          note(id);
          if (!baked.has(id)) {
            baked.set(id, {
              id,
              term: text,
              variants: {},
              body,
              retired: false,
              source: 'store',
            });
          }
        } else if (body.length > 0) {
          // An empty local definition is inert on screen (nothing to show),
          // exactly as the paper appendix treats it.
          const key = termKey(text);
          const id = localEntryId(text);
          note(id);
          if (!local.has(key)) {
            local.set(key, {
              id,
              term: text,
              variants: {},
              body,
              retired: false,
              source: 'local',
            });
          }
        }
      }
    }
    for (const child of Object.values(value as Record<string, unknown>)) visit(child);
  };

  const document = doc as { sections?: unknown; referencePanel?: { blocks?: unknown } };
  visit(document.sections);
  if (document.referencePanel) visit(document.referencePanel.blocks);

  return {
    local: [...local.values()],
    baked: [...baked.values()],
    referencedIds: referenced,
  };
}
