import { z } from 'zod';
import { InlineNode } from '../inline.js';
import { AxisConfig, Drawable } from './interactive-graph.js';

// Multiple-choice question block. One prompt, 2+ choices, radio (single) or
// checkbox ("select all that apply") via multiSelect. Scored all-or-nothing:
// the selected set must equal the correct set (per-choice partial credit is a
// future additive flag, mirroring the graph block's partialCredit precedent).
//
// Choice content is rich inline (formatted text + inline math) — the same
// alphabet as problem prose, so math answer choices render properly. Richer
// choices are ADDITIVE FIELDS on MultipleChoiceOption, not a union rework —
// decided at design time, exercised 2026-07-10 when the optional `image` and
// `graph` figures landed without a schemaVersion bump.
//
// Per-choice `feedback` is the MC analogue of a blank's mistakeFeedback:
// distractors are usually authored BECAUSE they're anticipated mistakes, so
// each choice can carry an explanation shown post-check when it was selected.
//
// Block-level fields mirror FillInBlankBlock for parity (solution,
// hasConfidenceRating, skills, workSpace) — one problem chrome, one runtime
// treatment, one dashboard row shape.
//
// Deliberately NOT schema-enforced: "at least one choice is marked correct."
// A mid-edit draft (teacher hasn't picked the right answer yet) must still
// autosave; the editor surfaces the warning instead. A zero-correct block is
// well-defined at runtime (multi-select: selecting nothing is... still an
// omission; nothing scores correct) — wrong authoring, not a crash.

// Optional illustrative image on a choice ("which diagram shows…"). Mirrors
// DefinitionImage / Phase-1 ImageBlock: URL-only, no upload pipeline; alt
// required but defaulting to '' for decorative figures (editor warns).
export const ChoiceImage = z.object({
  src: z.string().url(),
  alt: z.string().default(''),
});
export type ChoiceImage = z.infer<typeof ChoiceImage>;

// Optional static graph on a choice ("which graph shows…"). Reuses the
// interactive-graph vocabulary (AxisConfig + display Drawables) but is
// rendered server-side as inline SVG by the renderer's graph-svg engine —
// never the interactive kit. Consequence: `expression` drawables need the
// kit's parser and are NOT drawn; the editor doesn't offer them here.
export const ChoiceGraph = z.object({
  axis: AxisConfig,
  drawables: z.array(Drawable).default([]),
});
export type ChoiceGraph = z.infer<typeof ChoiceGraph>;

export const MultipleChoiceOption = z.object({
  id: z.string().uuid(),
  // Rich inline content (formatted text + inline math). Non-empty is an
  // editor concern, not a schema one (mid-edit drafts must save).
  content: z.array(InlineNode),
  correct: z.boolean().default(false),
  // Optional per-choice explanation, revealed post-check when this choice was
  // selected. Rich inline content, like blank mistakeFeedback entries.
  feedback: z.array(InlineNode).optional(),
  // Optional figure below the choice text — the additive widening the header
  // comment reserved. Both may technically coexist (image renders first);
  // the editor UI treats them as a single figure slot.
  image: ChoiceImage.optional(),
  graph: ChoiceGraph.optional(),
});
export type MultipleChoiceOption = z.infer<typeof MultipleChoiceOption>;

export const MultipleChoiceBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('multiple_choice'),
  number: z.number().int().positive().optional(),
  // The question prose (rich inline content, like a problem statement).
  prompt: z.array(InlineNode),
  choices: z.array(MultipleChoiceOption).min(2),
  // false = single answer (radios, exactly one selectable); true = "select
  // all that apply" (checkboxes). Scoring is set equality either way.
  multiSelect: z.boolean().default(false),
  // Worked explanation for the whole problem, revealed post-check regardless
  // of correctness (same contract as FillInBlankBlock.solution).
  solution: z.array(InlineNode).optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  // Per-problem print work-space override (rem); absent = inherit the
  // activity-level default (see FillInBlankBlock.workSpace for the CSS
  // custom-property reasoning).
  workSpace: z.number().min(0).optional(),
});
export type MultipleChoiceBlock = z.infer<typeof MultipleChoiceBlock>;
