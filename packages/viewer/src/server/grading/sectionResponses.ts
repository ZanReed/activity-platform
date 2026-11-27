// =============================================================================
// server/grading/sectionResponses.ts — keep only the answers this section asks
// -----------------------------------------------------------------------------
// Review B4 (2026-11-26): a check's response maps are keyed by part id, and a
// key the section does not have was stored verbatim in the ~400-day row. The
// grader ignored it, so nothing marked it wrong; it simply sat there, as large
// as the body cap allowed. This drops every key the section's inventory does
// not name, per family, BEFORE grading and recording — so the stored row holds
// exactly the parts a teacher can see.
//
// THE INVENTORY IS THE LIST. Every blank token (keyed or not), every choice /
// matching / correspondence / ordering block, every graph (a display graph
// too — the grader returns no verdict for it, and dropping it is not this
// file's call), every free-text block. Photos are NOT filtered here: a photo
// ref for a block that is not a photo question is a 400 (PhotosMismatchError),
// never a silent drop, because the student's uploaded bytes would otherwise
// vanish without a word.
// =============================================================================

import type { SectionResponses } from '../../check/wire.js';
import { findSection, inventorySection, type RawSection } from './walk.js';

function pick<T>(map: Record<string, T>, keep: ReadonlySet<string>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [id, value] of Object.entries(map)) {
    if (keep.has(id)) out[id] = value;
  }
  return out;
}

/**
 * `responses` with every part id the section does not have removed. Returns
 * null when the section is not in the document (the caller's grader throws
 * SectionNotFoundError for that, which is the 400 the student should get).
 */
export function responsesInSection(
  document: { sections?: RawSection[] },
  sectionId: string,
  responses: SectionResponses,
): SectionResponses | null {
  const section = findSection(document, sectionId);
  if (!section) return null;
  const inv = inventorySection(section);
  const blanks = new Set(inv.blankGroupsByBlock.flatMap((g) => g.keys.map((k) => k.id)));
  return {
    blanks: pick(responses.blanks, blanks),
    choices: pick(responses.choices, new Set(inv.multipleChoice.map((m) => m.blockId))),
    matches: pick(responses.matches, new Set(inv.matching.map((m) => m.blockId))),
    correspondences: pick(
      responses.correspondences,
      new Set(inv.correspondence.map((c) => c.blockId)),
    ),
    orderings: pick(responses.orderings, new Set(inv.ordering.map((o) => o.blockId))),
    freeText: pick(responses.freeText, new Set(inv.freeText)),
    graphs: pick(responses.graphs, new Set(inv.graphs.map((g) => g.blockId))),
    photos: responses.photos,
  };
}
