// =============================================================================
// inline.ts — Inline content nodes
// -----------------------------------------------------------------------------
// Inline nodes are the atoms inside a block's `content` array. Most blocks
// accept the InlineNode union (text + inline math). The fill_in_blank block
// is special: it accepts an extended union that also includes BlankToken.
//
// Discrimination: every inline node has a `type` literal. Zod's
// discriminatedUnion keys on it, which gives us narrow types after parsing
// and clear error messages on malformed data.
// =============================================================================

import { z } from 'zod';

// ---- Marks ------------------------------------------------------------------
// Marks are formatting flags on text. They're not nested elements (no
// <em><strong>...</strong></em> structure); a single TextNode can have
// multiple marks applied. Order doesn't matter — render output is
// canonicalized.
export const Mark = z.enum(['bold', 'italic', 'underline', 'code', 'subscript', 'superscript']);
export type Mark = z.infer<typeof Mark>;

// ---- Text node --------------------------------------------------------------
export const TextNode = z.object({
  type: z.literal('text'),
  text: z.string(),
  // Default to empty marks array so callers don't need to specify when none.
  marks: z.array(Mark).default([]),
});
export type TextNode = z.infer<typeof TextNode>;

// ---- Inline math ------------------------------------------------------------
// LaTeX source for KaTeX. Stored verbatim; rendered at render time. The
// renderer is tolerant of invalid LaTeX (renders an error indicator rather
// than crashing) so saving a doc with broken math doesn't lock the editor.
export const InlineMathNode = z.object({
  type: z.literal('math_inline'),
  latex: z.string(),
});
export type InlineMathNode = z.infer<typeof InlineMathNode>;

// ---- Hard break -------------------------------------------------------------
// A soft line break inside a block (Tiptap's hardBreak / Shift+Enter), as
// opposed to a new block. Carries no data — it renders as <br>. Without this
// node the break is dropped on serialize and adjacent text runs concatenate.
export const HardBreakNode = z.object({
  type: z.literal('hard_break'),
});
export type HardBreakNode = z.infer<typeof HardBreakNode>;

// ---- Blank token (fill-in-the-blank only) -----------------------------------
// Blanks live INSIDE the inline content stream of a fill_in_blank block —
// students see a prompt with one or more inline blanks. Each blank has a
// stable id (referenced in submissions.responses.blanks[<id>]) and an answer
// key.
//
// width is in CSS chars (`ch` units) — used to size the input. Optional
// because the renderer has a sensible default (~6 chars).
//
// hint and mistakeFeedback are the per-blank feedback layers (block-level
// fields — solution, hasConfidenceRating, skills — live on FillInBlankBlock).
// The runtime reads both at init but does NOT inject anything into the DOM
// until the student clicks "Check this section." On a wrong answer, the
// runtime first looks for a matching mistakeFeedback entry (exact string
// match for Phase 1); if none matches, it falls back to hint; if hint is
// also absent, it shows the generic ✗.
export const BlankToken = z.object({
  type: z.literal('blank'),
                                   id: z.string().uuid(),
                                   answer: z.string().min(1),
                                   // Alternative correct answers. Empty array is the common case.
                                   acceptableAnswers: z.array(z.string()).default([]),
                                   width: z.number().int().positive().optional(),
                                   // Optional teacher-authored nudge shown when this blank is wrong and no
                                   // mistakeFeedback entry matches. Single string for Phase 1; tiered hints
                                   // could come in Phase 2 if teachers ask for them.
                                   hint: z.string().optional(),
                                   // Optional list of anticipated wrong answers paired with specific feedback.
                                   // If the student's wrong answer matches a `match` string (Phase 1: exact
                                   // match; the strategy-dispatch hook in the runtime supports smarter
                                   // matching later), the corresponding feedback is shown instead of the
                                   // generic hint. First match wins.
                                   mistakeFeedback: z.array(z.object({
                                     match: z.string(),
                                                                     feedback: z.string(),
                                   })).optional(),
});
export type BlankToken = z.infer<typeof BlankToken>;

// ---- Unions -----------------------------------------------------------------
// InlineNode is the standard inline alphabet. Used by all blocks except
// fill_in_blank.
export const InlineNode = z.discriminatedUnion('type', [
  TextNode,
  InlineMathNode,
  HardBreakNode,
]);
export type InlineNode = z.infer<typeof InlineNode>;

// FillInBlankInline is the extended alphabet for fill_in_blank blocks only.
// Includes BlankToken in addition to the standard inline nodes.
export const FillInBlankInline = z.discriminatedUnion('type', [
  TextNode,
  InlineMathNode,
  HardBreakNode,
  BlankToken,
]);
export type FillInBlankInline = z.infer<typeof FillInBlankInline>;
