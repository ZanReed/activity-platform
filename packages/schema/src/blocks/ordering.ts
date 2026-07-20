import { z } from 'zod';
import { InlineNode } from '../inline.js';
import { labelFields } from '../label.js';

// Ordering / sequencing question block. The AUTHORED order of `items` IS the
// correct order; students see the list shuffled at publish time and drag it
// back into sequence. Design: docs/design/matching-ordering-questions.md
// (decided 2026-07-10).
//
// Scored ALL-OR-NOTHING on exact sequence equality (author call: partial-
// credit metrics for orderings are either misleading — position matches
// punish an off-by-one shift absurdly — or opaque to teachers; revisit only
// on observed demand). Interchangeable adjacent items: YAGNI, additive later.
//
// An untouched list is an OMISSION, not an answer: a shuffled list is always
// *some* sequence, so the runtime only records a response once the student
// has moved something.
//
// No figure slot on items in v1 (no clear use case yet; additive later —
// the MC/matching ChoiceImage/ChoiceGraph pattern is sitting there).

export const OrderingItem = z.object({
  id: z.string().uuid(),
  // Rich inline content (formatted text + inline math). Non-empty is an
  // editor concern, not a schema one (mid-edit drafts must save).
  content: z.array(InlineNode),
});
export type OrderingItem = z.infer<typeof OrderingItem>;

export const OrderingBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('ordering'),
  number: z.number().int().positive().optional(),
  ...labelFields,
  // The question prose (rich inline content, like a problem statement).
  prompt: z.array(InlineNode),
  // Authored order = correct order. The renderer shuffles deterministically
  // (seeded by block id) for the student-facing arrangement.
  items: z.array(OrderingItem).min(2),
  // MC-parity problem chrome (one problem shape, one dashboard row shape).
  solution: z.array(InlineNode).optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  workSpace: z.number().min(0).optional(),
});
export type OrderingBlock = z.infer<typeof OrderingBlock>;
