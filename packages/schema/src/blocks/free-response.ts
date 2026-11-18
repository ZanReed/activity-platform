import { z } from 'zod';
import { InlineNode } from '../inline.js';
import { labelFields } from '../label.js';

// =============================================================================
// free-response.ts — short_answer + essay (manually-graded free text)
// -----------------------------------------------------------------------------
// The Phase 2.6 graded free-text siblings of self_explanation. All three write
// their student text into the SAME `freeResponses` map (wire v9) — the response
// shape is identical (a string); what differs is intent + grading:
//   - self_explanation — ungraded reflection (already shipped).
//   - short_answer     — a brief graded response (manual rubric grading, 2.6).
//   - essay            — a long graded response; adds optional word-count
//                        guidance (a target range shown as a live counter).
// Grading itself lives in a separate `grades` table (Phase 2.6 later slices),
// never in the submission jsonb — grades are mutable, submissions are not. These
// blocks are never AUTO-scored by the runtime.
//
// ⚠ AMENDED 2026-08-20 (answer-key slice, ruling E2 — this comment is amended
// in the commit that changes what it describes, P5). The line above used to
// read "carry NO answer key". They now MAY carry one, and the distinction that
// replaced it is the load-bearing one:
//
//   answer   — the canonical answer / marking guide. Teacher-only material, on
//              EVERY channel: the registry strips it from the served document
//              and nothing ever returns it to a student. It exists so the
//              printed answer key has something to print (and so the future
//              scan-grading arc has a key to grade a photo against). A block
//              that is manually graded still HAS a right answer; what it lacks
//              is a machine that can recognise one.
//   solution — the post-check explanation, identical in kind and in release
//              rule to every other block's `solution`: stripped from the read
//              path, returned by the check response after the section is
//              checked (walk.ts collects it GENERICALLY, so no grading-engine
//              code was added for this), and revealed by the component.
//
// Both are InlineNode[] — a worked answer wants formatting and inline math, and
// a multi-line one arrives from the importer as hard breaks. Both are OPTIONAL:
// an unanswered free-response block is still a valid block, and the answer key
// prints "manually graded — see rubric" for it (the extractor's fallback chain
// is answer → solution → that phrase; see viewer/src/answer-key/extract.ts).
//
// E8's convention, recorded because it is NOT schema: `answer` carries WHAT is
// correct; a `rubric` carries HOW MANY points (per-criterion maxPoints) when a
// question is worth more than one; no rubric = a 1-point question. There is
// deliberately no points field here — the full marking contract belongs to
// docs/design/photo-grading.md's own design pass.
//
// wordCountHint (essay only): an optional {min?, max?} target. The renderer
// shows a live word counter; the count itself is computed-on-read (never stored
// in the wire — it's derivable from the text), so this is display guidance only.
// =============================================================================

// One rubric criterion: a label ("Thesis clarity"), the points it's worth, and
// an optional description of what full credit looks like. Leveled descriptor
// grids (4/3/2/1 columns) are a future ADDITIVE extension of this shape.
export const RubricCriterion = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  maxPoints: z.number().positive().finite(),
  description: z.string().optional(),
  // The level this line evidences, from a DoL's `dol_rubric_levels:` (e.g.
  // A/M/E for nz-ncea; curriculum §8, D65 DL-11). Read by the grading view to
  // prefill "DoL passed" when every BASE-level line is at full marks.
  level: z.string().min(1).max(8).optional(),
});
export type RubricCriterion = z.infer<typeof RubricCriterion>;

// A block's grading rubric. Lives IN the document (author decision 2026-07-13,
// docs/design/manual-grading.md): submissions pin to activity_versions, so the
// grading UI reads the exact rubric the student was assessed against — version
// pinning IS the "rubric edits apply prospectively" mechanism. The renderer
// never emits it (teacher-side data; stays out of student HTML). Grades
// themselves are mutable and live in the `grades` TABLE, keyed by
// (submission_id, block_id) + criterion id.
export const Rubric = z.object({
  criteria: z.array(RubricCriterion).min(1),
});
export type Rubric = z.infer<typeof Rubric>;

// The two teacher-only answer fields both blocks carry (ruling E2 + E4's
// parity: one schema round for the pair, never two). Declared once here so the
// two block shapes cannot drift apart field-by-field.
//
// ⚠ BOTH BLOCKS ALSO CARRY `labelFields` since the viewer-numbering slice
// (ruling N6). Ruling E7 made them page-numbered, and until N6 they were the
// only numbered types with no way to opt out — a teacher could not mark a
// reflection-style short answer as unnumbered even though the schema has had
// that vocabulary (auto / custom / none) since the numbering-label decouple.
// The field is NOT enough on its own: `label` only survives a save if the type
// is also in serialize.ts's LABELED_BLOCK_TYPES, and only reaches an author if
// blockControls.ts attaches `numberingGroup`. See the plan's four-link chain
// (docs/design/viewer-numbering.md, D8) — link 1 is here.
const answerFields = {
  /** The canonical answer / marking guide. Teacher-only on every channel. */
  answer: z.array(InlineNode).optional(),
  /** The post-check explanation — same release rule as every other `solution`. */
  solution: z.array(InlineNode).optional(),
};

// The printed writing box's height, in rem (schema-shortlist.md S2,
// 2026-11-15). The same field and unit every other question's `workSpace`
// uses, but on these two blocks it sizes the BOX the student writes in rather
// than adding space below the question (the box is the work space). Absent =
// the default box: 6em for a short answer, 12em for an essay. Print only.
const answerSpace = { workSpace: z.number().min(0).optional() };

export const ShortAnswerBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('short_answer'),
  prompt: z.array(InlineNode),
  placeholder: z.string().optional(),
  ...answerSpace,
  rubric: Rubric.optional(),
  ...answerFields,
  ...labelFields,
});
export type ShortAnswerBlock = z.infer<typeof ShortAnswerBlock>;

export const WordCountHint = z
  .object({
    min: z.number().int().positive().optional(),
    max: z.number().int().positive().optional(),
  })
  // Guard against an inverted range (min > max) — a nonsense hint the editor
  // shouldn't be able to produce, but validation is the schema's job.
  .refine(
    (h) => h.min === undefined || h.max === undefined || h.min <= h.max,
    { message: 'wordCountHint.min must be ≤ max' },
  );
export type WordCountHint = z.infer<typeof WordCountHint>;

export const EssayBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('essay'),
  prompt: z.array(InlineNode),
  placeholder: z.string().optional(),
  wordCountHint: WordCountHint.optional(),
  ...answerSpace,
  rubric: Rubric.optional(),
  ...answerFields,
  ...labelFields,
});
export type EssayBlock = z.infer<typeof EssayBlock>;

// =============================================================================
// photo_response — a photo of the student's handwritten working (Phase 2.8,
// docs/design/media-submissions.md §3). The third manually graded sibling: it
// carries the same teacher-only fields (rubric, answer, solution, labelFields)
// through the same spreads, so the three cannot drift apart field by field.
//
// The response is NOT text: it travels in its own wire map (`photos`, check
// wire v4) as photo ids, never bytes or paths (CLAUDE.md: a new response
// category gets its own map). A student adds up to `maxPhotos` photos.
//
// maxPhotos (MS-4): 1, 2 or 3; absent = 1. The server's reserve_work_photo
// (0093) reads it from the stored version with the same default, and the check
// handler refuses more refs than it allows.
// workSpace: the printed work box's height in rem, like the other two (on
// paper the paper IS the work, §8). Absent = 12em, essay-sized.
// =============================================================================

export const PhotoResponseBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('photo_response'),
  prompt: z.array(InlineNode),
  maxPhotos: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  ...answerSpace,
  rubric: Rubric.optional(),
  ...answerFields,
  ...labelFields,
});
export type PhotoResponseBlock = z.infer<typeof PhotoResponseBlock>;
