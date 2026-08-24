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
// Both imports are LEAF-SAFE — neither module imports inline.ts, so neither
// creates a cycle. sizing.js and blocks/image.js's CropRect are zod-only;
// blocks/graph-figure.js reaches its axis/drawable primitives via the leaf
// graph-primitives.ts precisely so that this import is possible. Do not swap
// either for a blocks/ module that carries InlineNode.
import { sizingFields, type BlockAlign } from './sizing.js';
import { CropRect } from './blocks/image.js';
import { GraphFigureBlock } from './blocks/graph-figure.js';

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

// ---- Math prompt (Model A: in-equation blank) -------------------------------
// A gradeable gap INSIDE a rendered equation — the MathLive `\placeholder[id]{}`
// feature. `id` matches the placeholder marker in the owning node's `latex`; the
// student's typed math expression is graded exactly like a 'math' fill-in-blank
// (numeric-sampling equivalence, 2a ≡ a+a ≡ a*2). Model A reuses the existing
// `submissions.responses.blanks` map keyed by this id, so prompts need NO new
// wire shape. A gap is inherently a math answer, so there is no `answerType`
// here — `equivalence` + `tolerance` are the same grading knobs a 'math'
// BlankToken carries, reused verbatim. See docs/design/math-blanks.md (Model A).
export const MathPrompt = z.object({
  // Matches the `\placeholder[id]{}` marker in the owning node's latex. NOT a
  // uuid: MathLive placeholder ids may not contain spaces/special characters
  // (uuid hyphens are unsafe), so the editor mints a MathLive-safe token.
  // Document-wide uniqueness (it keys into the blanks map) is an authoring-time
  // invariant, not a schema constraint.
  id: z.string().min(1),
  answer: z.string().min(1),
  // Alternative acceptable forms ("also accept"). Empty array is the common case.
  acceptableAnswers: z.array(z.string()).default([]),
  // Equivalence mode: 'value' (default, any expression that evaluates equal) or
  // 'exact-form' (normalized-string match). Absent = 'value'. Mirrors BlankToken.
  equivalence: z.enum(['value', 'exact-form']).optional(),
  // Absolute sampling tolerance. Absent = no extra slack. Mirrors BlankToken.
  tolerance: z.number().min(0).optional(),
});
export type MathPrompt = z.infer<typeof MathPrompt>;

// ---- Inline math ------------------------------------------------------------
// LaTeX source for KaTeX. Stored verbatim; rendered at render time. The
// renderer is tolerant of invalid LaTeX (renders an error indicator rather
// than crashing) so saving a doc with broken math doesn't lock the editor.
export const InlineMathNode = z.object({
  type: z.literal('math_inline'),
  latex: z.string(),
  // Model A: optional in-equation gradeable gaps (§MathPrompt). Optional with
  // NO default so a math node authored before Model A — or one with no gaps —
  // re-serializes BYTE-IDENTICALLY (a `.default([])` would materialize `prompts:
  // []` on every legacy node). Same optional-no-default discipline as
  // BlankToken.answerType/tolerance. See docs/design/math-blanks.md (Model A).
  prompts: z.array(MathPrompt).optional(),
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

// ---- Definition blocks ------------------------------------------------------
// A definition's content is a BLOCK sequence, so a vocabulary popover can hold
// what a reference sheet holds: a display equation, a short property list, a
// figure. See docs/design/definition-rich-content.md.
//
// The union is a curated subset of the reference panel's content blocks, and
// every text-bearing member is defined LOCALLY over DefinitionContentInline
// rather than reusing its blocks/ sibling. That is what keeps the schema
// NON-RECURSIVE: blocks/paragraph.ts and friends carry InlineNode, whose
// TextNode carries Mark, which includes DefinitionMark — so reusing them would
// close the cycle DefinitionMark -> block -> text -> mark -> DefinitionMark and
// admit definitions nested inside definitions at arbitrary depth. It would also
// land on the same tsc declaration-serialization limit (TS7056) that already
// forced the hand-written `interface ActivityDocument` in document.ts.
//
// Excluded on purpose (author rulings, design doc D2/D3): columns (unreadable
// in a ~28rem popover — a definition that needs two-column layout IS the
// reference panel), callout (a note box inside a note box), and every
// question/interactive block (a definition is never gradeable).
//
// `id` is OPTIONAL on the locally-defined members, unlike every blocks/ sibling
// where it is a required uuid. Two reasons: nothing addresses a definition block
// (it is never scored, never a submission key, never a runtime ref — only the
// editor wants it, and the editor always mints one), and the legacy upgrades in
// the Mark preprocess below must be DETERMINISTIC. A required uuid would force
// crypto.randomUUID() at parse time, so parsing one stored document twice would
// yield different ids and break re-serialization byte-identity.

// Every schema below carries an EXPLICIT interface + `z.ZodType<…>` annotation
// rather than relying on z.infer. This is not style: without it, adding a
// 7-member block union inside a mark that every block's inline content can
// reach overflows tsc's declaration-serialization limit and fails the build with
// TS7056 in five downstream files (blocks/index.ts's Block, document.ts,
// layout.ts). Naming the types stops the structural expansion at this boundary —
// the same remedy `interface ActivityDocument` already applies in document.ts.
// The annotations are checked against the object schemas, so nothing here loses
// type safety, and the runtime objects are untouched (a discriminatedUnion still
// parses as a discriminatedUnion).

const DefinitionBlockId = z.string().uuid().optional();

// Shared sizing fragment, spelled out for the interfaces above.
interface DefinitionSizing {
  width?: number;
  align?: BlockAlign;
}

export interface DefinitionParagraphBlock {
  id?: string;
  type: 'paragraph';
  content: DefinitionContentInline[];
}
export interface DefinitionHeadingBlock {
  id?: string;
  type: 'heading';
  level: 1 | 2 | 3;
  content: DefinitionContentInline[];
}
export interface DefinitionMathBlock extends DefinitionSizing {
  id?: string;
  type: 'math_block';
  latex: string;
}
export interface DefinitionImageBlock extends DefinitionSizing {
  id?: string;
  type: 'image';
  src: string;
  alt: string;
  crop?: CropRect;
  srcAspect?: number;
}

const DefinitionParagraphBlock = z.object({
  id: DefinitionBlockId,
  type: z.literal('paragraph'),
  content: z.array(DefinitionContentInline).default([]),
});

// Same three-level cap as HeadingBlock. The popover stylesheet scopes these
// down so a panel-scale h1 reads correctly at popover scale.
const DefinitionHeadingBlock = z.object({
  id: DefinitionBlockId,
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  content: z.array(DefinitionContentInline).default([]),
});

// Display math. A definition-local shape rather than blocks/math-block.ts's
// MathBlock, which carries `prompts` (in-equation gradeable gaps) and
// `solution: InlineNode[]` — the first is meaningless here (a definition is
// never gradeable, the same posture the reference panel already takes) and the
// second is exactly the recursive edge described above. Sizing rides along;
// labelFields do not (a definition block is never numbered).
const DefinitionMathBlock = z.object({
  id: DefinitionBlockId,
  type: z.literal('math_block'),
  latex: z.string(),
  ...sizingFields,
});

// Illustrative image. Definition-local for the optional-id reason above, but it
// reuses the shared sizing + crop vocabulary verbatim, so reframing a textbook
// figure down to the relevant corner works exactly as it does in the body.
// `caption` is deliberately absent (YAGNI — alt covers accessibility, and a
// captioned figure in a popover is the reference panel's job); additive later.
const DefinitionImageBlock = z.object({
  id: DefinitionBlockId,
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().default(''),
  ...sizingFields,
  crop: CropRect.optional(),
  srcAspect: z.number().positive().optional(),
});

// Nested lists, mirroring blocks/list.ts's shape so Tab-to-indent in the
// definition dialog round-trips. Same recursion mechanic: only the cyclic edge
// (item -> list -> item) is z.lazy(), leaving the list blocks as plain
// z.objects so they stay usable as discriminatedUnion members below.
export interface DefinitionListItem {
  id?: string;
  content: DefinitionContentInline[];
  children?: Array<DefinitionBulletListBlock | DefinitionOrderedListBlock>;
}
export interface DefinitionBulletListBlock {
  id?: string;
  type: 'bullet_list';
  items: DefinitionListItem[];
}
export interface DefinitionOrderedListBlock {
  id?: string;
  type: 'ordered_list';
  items: DefinitionListItem[];
}

export const DefinitionListItem: z.ZodType<
  DefinitionListItem,
  z.ZodTypeDef,
  unknown
> = z.lazy(() =>
  z.object({
    id: DefinitionBlockId,
    content: z.array(DefinitionContentInline).default([]),
    children: z
      .array(z.union([DefinitionBulletListBlock, DefinitionOrderedListBlock]))
      .optional(),
  }),
);

export const DefinitionBulletListBlock = z.object({
  id: DefinitionBlockId,
  type: z.literal('bullet_list'),
  items: z.array(DefinitionListItem).default([]),
});

export const DefinitionOrderedListBlock = z.object({
  id: DefinitionBlockId,
  type: z.literal('ordered_list'),
  items: z.array(DefinitionListItem).default([]),
});

// GraphFigureBlock is the ONE member reused verbatim: it is already inline-free
// (axis + drawables only), so it introduces no cycle, and it has no legacy
// upgrade path that would need to mint its required uuid. Importing it is safe
// only because its own graph primitives now come from the leaf
// graph-primitives.ts rather than through blocks/interactive-graph.ts — see the
// header comment there.
export type DefinitionBlock =
  | DefinitionParagraphBlock
  | DefinitionHeadingBlock
  | DefinitionMathBlock
  | DefinitionImageBlock
  | DefinitionBulletListBlock
  | DefinitionOrderedListBlock
  | GraphFigureBlock;

export const DefinitionBlock: z.ZodType<
  DefinitionBlock,
  z.ZodTypeDef,
  unknown
> = z.discriminatedUnion('type', [
  DefinitionParagraphBlock,
  DefinitionHeadingBlock,
  DefinitionMathBlock,
  DefinitionImageBlock,
  DefinitionBulletListBlock,
  DefinitionOrderedListBlock,
  GraphFigureBlock,
]);

// DefinitionMark — inline vocabulary definition (Phase 2). `content` is the
// rich definition shown in the published-page popover, now a block sequence
// (see DefinitionBlock above). `glossaryKey` is reserved for the Phase 4 tenant
// glossary store (resolved at publish) and is unused in Phase 2. The renderer
// emits `<span class="definition" …>` plus a hidden <template> carrying the
// rendered content; see RUNTIME.md, docs/design/vocabulary-definitions.md, and
// docs/design/definition-rich-content.md.
// NOT annotated as z.ZodType, unlike DefinitionBlock above: this schema is a
// member of the `Mark` discriminatedUnion below, and z.discriminatedUnion needs
// real ZodObjects to introspect the `type` discriminator. The named
// DefinitionBlock alias is what keeps the inferred type here small enough — the
// same reason list.ts keeps its list blocks as plain z.objects and puts the
// z.lazy() only on the cyclic edge.
export const DefinitionMark = z.object({
  type: z.literal('definition'),
  content: z.array(DefinitionBlock).default([]),
  glossaryKey: z.string().optional(),
});
export type DefinitionMark = z.infer<typeof DefinitionMark>;

// A definition's content is a block array today, but two older shapes are still
// out there in stored documents. Both upgrades below are pure, deterministic
// read-time rewrites — they mint no ids and no randomness, so parsing the same
// stored document twice yields identical output.
//
// They COMPOSE, oldest first, because a document can carry the oldest shape:
//   v1  { definition: 'a string' }                    (pre-rich-content)
//   v2  { content: [inline…], image?: {src, alt} }    (Phase 2 rich inline)
//   v3  { content: [block…] }                         (current)
// so v1 → v2 → v3 must run in sequence on a single mark.
// Exported because the app's serializer needs the IDENTICAL normalization when
// it reads a definition mark's Tiptap attrs — an editor session opened before
// the block migration still carries the v2 attr shape. One implementation, so
// the schema and the serializer cannot drift apart on what an old mark means.
export function upgradeDefinitionMark(m: Record<string, unknown>): unknown {
  let content = m.content;
  const rest = { ...m };

  // v1 → v2: a plain `definition` string becomes a single inline text run.
  if (typeof rest.definition === 'string' && content === undefined) {
    const text = rest.definition;
    content = text ? [{ type: 'text', text }] : [];
  }
  delete rest.definition;

  // v2 → v3: an INLINE content array becomes one paragraph block. Detected by
  // shape, not by a version field — an inline node is a text / math_inline /
  // hard_break, none of which is a block `type`, so the first element
  // discriminates unambiguously. An empty array is already valid at both
  // versions and is left alone.
  const INLINE_TYPES = ['text', 'math_inline', 'hard_break'];
  if (Array.isArray(content) && content.length > 0) {
    const first = content[0] as { type?: unknown } | undefined;
    if (typeof first?.type === 'string' && INLINE_TYPES.includes(first.type)) {
      content = [{ type: 'paragraph', content }];
    }
  }

  // v2 → v3 (D7): the separate `image` attr becomes a trailing image block, so
  // there is exactly one way to express an image in a definition. Appended
  // AFTER the text, matching where the old popover rendered it.
  const image = rest.image;
  delete rest.image;
  if (image !== null && typeof image === 'object') {
    const { src, alt } = image as { src?: unknown; alt?: unknown };
    if (typeof src === 'string' && src) {
      const blocks = Array.isArray(content) ? [...content] : [];
      blocks.push({
        type: 'image',
        src,
        alt: typeof alt === 'string' ? alt : '',
      });
      content = blocks;
    }
  }

  return { ...rest, content: content ?? [] };
}

export const Mark = z.preprocess(
  (m) => {
    // Legacy: marks were bare strings ('bold').
    if (typeof m === 'string') return { type: m };
    if (
      m !== null &&
      typeof m === 'object' &&
      (m as { type?: unknown }).type === 'definition'
    ) {
      return upgradeDefinitionMark(m as Record<string, unknown>);
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
// fields — solution, skills — live on FillInBlankBlock).
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
  // 'math' (Model B math blanks) grades the typed value as a math EXPRESSION:
  // the runtime lazy-loads the graph-kit and compares by numeric-sampling
  // equivalence (2a ≡ a+a ≡ a*2), NOT string match. See docs/design/math-blanks.md.
  answerType: z.enum(['text', 'numeric', 'math']).optional(),
  // Absolute comparison tolerance. For 'numeric': |typed - key| <= tolerance.
  // For 'math': the absolute tolerance passed to the sampling comparison.
  // Absent = exact equality (numeric) / no extra slack (math).
  tolerance: z.number().min(0).optional(),
  // Equivalence mode for 'math' blanks: 'value' (default, any expression that
  // evaluates equal) or 'exact-form' (normalized-string match — "write it in
  // this form"). Only meaningful when answerType is 'math'; absent = 'value'.
  equivalence: z.enum(['value', 'exact-form']).optional(),
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
