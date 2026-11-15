// =============================================================================
// container/answered.ts — which questions have an answer yet (2026-11-15)
// -----------------------------------------------------------------------------
// One definition of "blank", read by the lock/DoL confirm (ViewerContainer's
// "N questions are still blank") and by the student top bar's "5 of 12
// answered" + Next (app StudentViewer). Moved here from ViewerContainer so
// the two can never disagree.
// =============================================================================

import { RESPONSE_CATEGORIES } from '../store/store.js';
import type { SectionIndex } from './blockIndex.js';

/** True when a stored response holds no answer at all. A cleared matching or
 * correspondence question is stored as `{}`, so emptiness is checked all the
 * way down, not only at the top. */
function isBlankResponse(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.every(isBlankResponse);
  if (typeof v === 'object') return Object.values(v as Record<string, unknown>).every(isBlankResponse);
  return false;
}

/** A graph's work always names its interaction, so it is blank when nothing
 * is placed and "cannot be graphed" isn't chosen. An ORDERING is never blank:
 * it is served in an order, and a student who agrees with that order has
 * answered it without moving anything (nothing is stored until they do). */
function isUnanswered(category: (typeof RESPONSE_CATEGORIES)[number], v: unknown): boolean {
  if (category === 'orderings') return false;
  if (category === 'graphs' && v !== undefined) {
    const g = v as { noSolution?: boolean; points?: unknown[] };
    return !g.noSolution && (g.points ?? []).length === 0;
  }
  return isBlankResponse(v);
}

/** An unanswered question: a blank's id, or (every other kind) its block id. */
export interface UnansweredItem {
  sectionId: string;
  category: (typeof RESPONSE_CATEGORIES)[number];
  id: string;
}

/** Every unanswered question in `sections`: section by section, and within
 * a section by kind (blanks, then choices …), NOT by position on the page —
 * a caller that needs page order sorts the elements (StudentViewer's Next). */
export function unansweredItems(responses: unknown, sections: readonly SectionIndex[]): UnansweredItem[] {
  const r = responses as Record<string, Record<string, unknown> | undefined>;
  const out: UnansweredItem[] = [];
  for (const s of sections) {
    for (const category of RESPONSE_CATEGORIES) {
      for (const id of s.items[category] ?? []) {
        if (isUnanswered(category, r[category]?.[id])) out.push({ sectionId: s.sectionId, category, id });
      }
    }
  }
  return out;
}

/** How many questions `sections` hold in all. */
export function questionCount(sections: readonly SectionIndex[]): number {
  let n = 0;
  for (const s of sections) for (const category of RESPONSE_CATEGORIES) n += (s.items[category] ?? []).length;
  return n;
}
