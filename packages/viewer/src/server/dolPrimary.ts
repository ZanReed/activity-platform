// =============================================================================
// server/dolPrimary.ts — the DoL's primary item (curriculum D65, DL-2)
// -----------------------------------------------------------------------------
// The first gradable block of the DoL section, in document order — the
// importer's own rule (lib/dolImport.ts), so the item the pass reads is the
// item the author put first. Its own module, with no grading import, because
// the READ path needs it too (is the primary a rubric? DE-9) and the read
// bundle must not carry the grader.
// =============================================================================

import { isGradeable, type Block } from '@activity/schema';

export interface DolPrimary {
  readonly block: Record<string, unknown>;
  /** A teacher-marked primary (short answer / essay): never auto-passed. */
  readonly rubric: boolean;
}

interface SectionLike {
  id?: string;
  rows?: Array<{ columns?: Array<{ blocks?: unknown[] }> }>;
}

function sectionOf(doc: unknown, sectionId: string): SectionLike | null {
  const sections = (doc as { sections?: SectionLike[] }).sections ?? [];
  return sections.find((s) => s.id === sectionId) ?? null;
}

/** The DoL's primary block (DL-2: the first gradable block, in document
 *  order), or null when the section has none. */
export function dolPrimary(doc: unknown, sectionId: string): DolPrimary | null {
  const section = sectionOf(doc, sectionId);
  for (const row of section?.rows ?? []) {
    for (const column of row.columns ?? []) {
      for (const block of column.blocks ?? []) {
        if (block && typeof block === 'object' && isGradeable(block as Block)) {
          const b = block as Record<string, unknown>;
          return { block: b, rubric: b.type === 'short_answer' || b.type === 'essay' };
        }
      }
    }
  }
  return null;
}

