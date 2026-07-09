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
// Marks are formatting applied to a run of text — not nested elements (no
// <em><strong>...</strong></em> structure); a single TextNode can carry
// several. Order doesn't matter — render output is canonicalized.
//
// Each mark is an OBJECT with a `type` discriminant. Simple marks (bold, etc.)
// carry only `type`; attribute-carrying marks (e.g. `definition`) hang their
// data off the same object. Legacy documents stored marks as bare strings
// ('bold'); the preprocess below upgrades those to the object form on read, so
// old activities keep parsing without a schemaVersion bump. New code always
// writes the object form.
export const SIMPLE_MARK_TYPES = [
  'bold',
  'italic',
  'underline',
  'code',
  'subscript',
  'superscript',
] as const;
export type SimpleMarkType = (typeof SIMPLE_MARK_TYPES)[number];

const BoldMark = z.object({ type: z.literal('bold') });
const ItalicMark = z.object({ type: z.literal('italic') });
const UnderlineMark = z.object({ type: z.literal('underline') });
const CodeMark = z.object({ type: z.literal('code') });
const SubscriptMark = z.object({ type: z.literal('subscript') });
const SuperscriptMark = z.object({ type: z.literal('superscript') });

// The attribute-free marks as a union. Definition content (below) allows only
// these — a definition can be formatted but cannot itself contain a nested
// definition, which also keeps the schema non-recursive.
const SimpleMark = z.discriminatedUnion('type', [
  BoldMark,
  ItalicMark,
  UnderlineMark,
  CodeMark,
  SubscriptMark,
  SuperscriptMark,
]);

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

// ---- Definition content -----------------------------------------------------
// The rich content shown in a definition's popover: formatted text + inline
// math (the same alphabet the blank hint uses), authored via the shared
// InlineRichTextEditor. A definition's text run carries SimpleMark only — no
// nested definitions — which also breaks the recursion that reusing InlineNode
// here would create (DefinitionMark → content → text → marks → DefinitionMark).
const DefinitionContentText = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: z.array(SimpleMark).default([]),
});
export const DefinitionContentInline = z.discriminatedUnion('type', [
  DefinitionContentText,
  InlineMathNode,
  HardBreakNode,
]);
export type DefinitionContentInline = z.infer<typeof DefinitionContentInline>;

// Optional illustrative image for a definition ("a picture worth a thousand
// words"). src is a URL (R2 upload or pasted); alt defaults to empty.
export const DefinitionImage = z.object({
  src: z.string(),
  alt: z.string().default(''),
});
export type DefinitionImage = z.infer<typeof DefinitionImage>;

// DefinitionMark — inline vocabulary definition (Phase 2). `content` is the
// rich definition shown in the published-page popover (formatted text + math);
// `image` is an optional illustrative picture. `glossaryKey` is reserved for
// the Phase 4 tenant glossary store (resolved at publish) and is unused in
// Phase 2. The renderer emits `<span class="definition" …>` plus a hidden
// <template> carrying the rendered content; see RUNTIME.md and
// docs/design/vocabulary-definitions.md.
export const DefinitionMark = z.object({
  type: z.literal('definition'),
  content: z.array(DefinitionContentInline).default([]),
  image: DefinitionImage.optional(),
  glossaryKey: z.string().optional(),
});
export type DefinitionMark = z.infer<typeof DefinitionMark>;

export const Mark = z.preprocess(
  (m) => {
    // Legacy: marks were bare strings ('bold').
    if (typeof m === 'string') return { type: m };
    // Legacy: a definition mark stored a plain `definition` string before rich
    // content landed — upgrade it to a single-text-run `content`.
    if (
      m !== null &&
      typeof m === 'object' &&
      (m as { type?: unknown }).type === 'definition' &&
      typeof (m as { definition?: unknown }).definition === 'string' &&
      (m as { content?: unknown }).content === undefined
    ) {
      const { definition, ...rest } = m as {
        definition: string;
      } & Record<string, unknown>;
      return {
        ...rest,
        content: definition ? [{ type: 'text', text: definition }] : [],
      };
    }
    return m;
  },
  z.discriminatedUnion('type', [
    BoldMark,
    ItalicMark,
    UnderlineMark,
    CodeMark,
    SubscriptMark,
    SuperscriptMark,
    DefinitionMark,
  ]),
);
export type Mark = z.infer<typeof Mark>;
// The set of mark `type` discriminants, for callers that allow-list by name.
export type MarkType = Mark['type'];

// ---- Text node --------------------------------------------------------------
export const TextNode = z.object({
  type: z.literal('text'),
  text: z.string(),
  // Default to empty marks array so callers don't need to specify when none.
  marks: z.array(Mark).default([]),
});
export type TextNode = z.infer<typeof TextNode>;

// ---- InlineNode union -------------------------------------------------------
// InlineNode is the standard inline alphabet. Used by all blocks except
// fill_in_blank. Defined before BlankToken because the blank's rich feedback
// fields (hint, mistakeFeedback) reuse this union.
export const InlineNode = z.discriminatedUnion('type', [
  TextNode,
  InlineMathNode,
  HardBreakNode,
]);
export type InlineNode = z.infer<typeof InlineNode>;

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
// Both carry rich inline content (InlineNode[]: formatted text + inline math)
// so feedback can include the same formatting and math as problem prose.
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
  // mistakeFeedback entry matches. Rich inline content (formatted text + math).
  hint: z.array(InlineNode).optional(),
  // Optional list of anticipated wrong answers paired with specific feedback.
  // If the student's wrong answer matches a `match` string (Phase 1: exact
  // match; the strategy-dispatch hook in the runtime supports smarter
  // matching later), the corresponding feedback is shown instead of the
  // generic hint. First match wins. `feedback` is rich inline content.
  mistakeFeedback: z.array(z.object({
    match: z.string(),
    feedback: z.array(InlineNode),
  })).optional(),
  // Order-independent answer grouping. When true, this blank's answer is
  // interchangeable with the blank immediately before it (in document order,
  // within the same block) — e.g. factoring `(x + ☐)(x + ☐)` where (2,3) and
  // (3,2) are both correct but (2,2) is not. A "group" is a maximal run of
  // adjacent blanks each flagged here; the renderer compiles runs into a
  // shared `data-blank-group` id, and the runtime scores the group with
  // consume-once matching (each correct answer can satisfy only one blank).
  //
  // This boolean is authoring *sugar*: the general model lives in the runtime
  // data-attribute contract (group ids), so richer grouping (non-adjacent,
  // cross-block) can be added later as an additive `group` field without a
  // breaking change. The first blank in a block ignores this flag (no
  // previous blank to group with).
  interchangeableWithPrevious: z.boolean().default(false),
  // Answer interpretation mode. Absent (= 'text') keeps the Phase 1 behavior:
  // exact string match against answer + acceptableAnswers. 'numeric' tells the
  // runtime to parse BOTH the typed value and each key entry numerically
  // (decimals, fractions like 3/2, mixed numbers like "1 1/2", comma
  // separators, a leading $) and compare within `tolerance` — so 0.5, 1/2,
  // and .50 all satisfy an answer of "1/2". Optional rather than defaulted so
  // documents stored before this field existed re-serialize byte-identically.
  answerType: z.enum(['text', 'numeric']).optional(),
  // Absolute comparison tolerance for numeric blanks (|typed - key| <= tolerance).
  // Only meaningful when answerType is 'numeric'; absent = exact equality.
  tolerance: z.number().min(0).optional(),
});
export type BlankToken = z.infer<typeof BlankToken>;

// ---- FillInBlankInline union ------------------------------------------------
// FillInBlankInline is the extended alphabet for fill_in_blank blocks only.
// Includes BlankToken in addition to the standard inline nodes.
export const FillInBlankInline = z.discriminatedUnion('type', [
  TextNode,
  InlineMathNode,
  HardBreakNode,
  BlankToken,
]);
export type FillInBlankInline = z.infer<typeof FillInBlankInline>;
