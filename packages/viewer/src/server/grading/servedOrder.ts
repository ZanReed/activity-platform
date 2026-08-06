// =============================================================================
// grading/servedOrder.ts — recovering the permutation this student was served
// -----------------------------------------------------------------------------
// `ordering` blocks are served permuted per student (the authored order IS the
// answer key, so serving it unshuffled would give the answer away). The check
// wire carries no `moved` flag, so the grader cannot tell "the student arranged
// the items into this order" from "the student never touched the list" —
// and the runtime scores an untouched list as an omission, not an answer.
//
// It doesn't need a flag. The serve shuffle is DETERMINISTIC, seeded on
// `${versionId}:${studentId}:${blockId}:${field}`, so the server can simply
// recompute what it handed this student and compare.
//
// This REUSES `applyServeShuffles` rather than reimplementing the permutation.
// That matters more than it looks: a second implementation that drifted by one
// index would not throw or fail a type check — it would silently mark correct
// arrangements as omissions for a subset of students, which is close to
// undiagnosable from a bug report. Running the real function over the raw
// document and reading the result back means there is only ever one shuffle.
// =============================================================================

import { applyServeShuffles } from '../../sanitize/shuffle.js';
import { serveSeed } from '../../sanitize/serveSeed.js';
import type { SanitizedActivityDocument } from '../../sanitize/sanitized-types.js';
import type { RawSection } from './walk.js';

// serveSeed is imported from sanitize/serveSeed.ts (G1) — the one spelling
// the read path serves with and this walk recomputes from.

/**
 * blockId → the item id order this student was served, for every `ordering`
 * block in the given section.
 *
 * Takes the RAW (upgraded) document: `applyServeShuffles` is structural — it
 * walks sections/rows/columns/blocks and shuffles the fields the registry
 * declares — so it produces the same permutation on the raw document as on the
 * sanitized one it normally runs against. The ids are what matter here, and
 * sanitizing does not touch them.
 */
export function computeServedOrderings(
  document: { sections?: RawSection[] },
  sectionId: string,
  versionId: string,
  studentId: string,
): Record<string, string[]> {
  const shuffled = applyServeShuffles(
    document as unknown as SanitizedActivityDocument,
    serveSeed(versionId, studentId),
  ) as unknown as { sections?: RawSection[] };

  const out: Record<string, string[]> = {};
  const section = (shuffled.sections ?? []).find((s) => s.id === sectionId);
  if (!section) return out;

  const visit = (block: Record<string, unknown>): void => {
    if (block.type === 'ordering' && Array.isArray(block.items)) {
      out[String(block.id)] = (block.items as Array<{ id?: unknown }>).map((i) =>
        String(i.id),
      );
    }
    // Containers can hold an ordering block; mirror the grader's own walk.
    for (const value of Object.values(block)) {
      if (!Array.isArray(value)) continue;
      for (const child of value) {
        if (
          child !== null &&
          typeof child === 'object' &&
          typeof (child as { type?: unknown }).type === 'string' &&
          typeof (child as { id?: unknown }).id === 'string'
        ) {
          visit(child as Record<string, unknown>);
        }
      }
    }
  };

  for (const row of section.rows ?? []) {
    for (const column of row.columns ?? []) {
      for (const block of column.blocks ?? []) {
        visit(block as Record<string, unknown>);
      }
    }
  }
  return out;
}
