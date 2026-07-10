import { z } from 'zod';
import { InlineNode } from '../inline.js';
import { ChoiceImage, ChoiceGraph } from './multiple-choice.js';

// Matching question block. Two columns: left "items" (stems, document order)
// and right "targets" (lettered A, B, C…, shuffled at publish time). The
// student drags a target card onto an item; the card docks next to the stem.
// Design: docs/design/matching-ordering-questions.md (decided 2026-07-10).
//
// Distractors: targets may exceed items — an unmatched target is simply
// referenced by no key entry. allowTargetReuse (off by default) lets several
// items share one target ("categorization-lite": classify each expression as
// linear/quadratic/exponential); the UI then COPIES the card on dock instead
// of moving it.
//
// Scored PER PAIR (earned/total — the fractional CheckpointResult precedent
// from wire v4): each item is one point, correct when the student's target
// for it equals key[itemId]. Block `correct` = every pair right. No bipartite
// machinery — the student's pairing IS the assignment (contrast blank groups,
// where typed values must be matched to slots).
//
// Figures: items and targets both take the optional image/graph figure slot
// shipped for MC choices (ChoiceImage/ChoiceGraph — URL-only image; static
// graph via the renderer's kit-free SVG engine, so `expression` drawables are
// excluded there and the editor doesn't offer them). "Match the graph to its
// equation" is the marquee case.
//
// Deliberately NOT schema-enforced: "key covers every item" / "key references
// real targets." A mid-edit draft (teacher still assigning answers) must
// autosave; the editor surfaces the warning instead (the MC zero-correct
// precedent). The runtime treats an item missing from the key as never
// correct — wrong authoring, not a crash.

export const MatchingItem = z.object({
  id: z.string().uuid(),
  // Rich inline content (formatted text + inline math). Non-empty is an
  // editor concern, not a schema one (mid-edit drafts must save).
  content: z.array(InlineNode),
  // Optional figure below the item text (same single-figure-slot treatment
  // as MC choices; image renders first if both are somehow set).
  image: ChoiceImage.optional(),
  graph: ChoiceGraph.optional(),
});
export type MatchingItem = z.infer<typeof MatchingItem>;

export const MatchingTarget = z.object({
  id: z.string().uuid(),
  content: z.array(InlineNode),
  image: ChoiceImage.optional(),
  graph: ChoiceGraph.optional(),
});
export type MatchingTarget = z.infer<typeof MatchingTarget>;

export const MatchingBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('matching'),
  number: z.number().int().positive().optional(),
  // The question prose (rich inline content, like a problem statement).
  prompt: z.array(InlineNode),
  // Left column, document order.
  items: z.array(MatchingItem).min(2),
  // Right column; may exceed items (extra targets are distractors). Letters
  // are assigned by position AFTER the publish-time shuffle, never authored.
  targets: z.array(MatchingTarget).min(2),
  // The correct pairing: item id → target id. Partial during authoring (see
  // header); multiple items may share a target only under allowTargetReuse.
  key: z.record(z.string().uuid(), z.string().uuid()),
  // false = one-to-one (docking moves the card; a used target can't be used
  // again). true = many-to-one allowed (docking copies the card).
  allowTargetReuse: z.boolean().default(false),
  // MC-parity problem chrome (one problem shape, one dashboard row shape).
  solution: z.array(InlineNode).optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  workSpace: z.number().min(0).optional(),
});
export type MatchingBlock = z.infer<typeof MatchingBlock>;
