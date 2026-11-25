// =============================================================================
// server/grading/gradedIds.ts — which parts the grader can call right or wrong
// -----------------------------------------------------------------------------
// Its own file, not part of walk.ts, on purpose: walk.ts is shared with the
// READ bundle (the census) and may import its siblings as TYPES only
// (tests/census.test.ts pins that), while this needs `graphTakesInput` as a
// value. It is grading-only, so it lives with the grader.
// =============================================================================

import { graphTakesInput } from './graphs.js';
import type { GradableInventory } from './walk.js';

/** How each inventory family is judged. A `Record` over the inventory's keys
 * ON PURPOSE: a new family does not compile until someone says here whether a
 * student must get it right for "every auto-graded part correct". */
const FAMILY_JUDGED: Record<keyof GradableInventory, 'auto' | 'hand' | 'none'> = {
  blankGroupsByBlock: 'auto',
  multipleChoice: 'auto',
  matching: 'auto',
  correspondence: 'auto',
  ordering: 'auto',
  graphs: 'auto',
  freeText: 'hand',
  photos: 'hand',
  solutions: 'none',
};

/**
 * The id of every part the grader can call right or wrong: the keys a verdict
 * can carry. THE ONE LIST (2026-11-26). It was written out twice, in dol.ts
 * and in practice-handler.ts, and the two had already drifted: only one left
 * out a display-only graph, which is a stimulus and never gets a verdict.
 * "Every auto-graded part correct" (a DoL pass, a video pause's "right", a
 * mixed-practice item) reads this, so a family missing here is a part a
 * student is silently not required to get right.
 */
export function autoGradedIdsOf(inv: GradableInventory): string[] {
  const ids: Record<keyof GradableInventory, () => string[]> = {
    blankGroupsByBlock: () => inv.blankGroupsByBlock.flatMap((g) => g.keys.map((k) => k.id)),
    multipleChoice: () => inv.multipleChoice.map((m) => m.blockId),
    matching: () => inv.matching.map((m) => m.blockId),
    correspondence: () => inv.correspondence.map((c) => c.blockId),
    ordering: () => inv.ordering.map((o) => o.blockId),
    // A display-only graph is a stimulus with no verdict: not a part to get right.
    graphs: () => inv.graphs.filter((g) => graphTakesInput(g.block)).map((g) => g.blockId),
    freeText: () => inv.freeText,
    photos: () => inv.photos.map((p) => p.blockId),
    solutions: () => inv.solutions.map((x) => x.blockId),
  };
  return (Object.keys(FAMILY_JUDGED) as Array<keyof GradableInventory>)
    .filter((family) => FAMILY_JUDGED[family] === 'auto')
    .flatMap((family) => ids[family]());
}
