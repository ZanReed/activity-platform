import { z } from 'zod';
import { FillInBlankInline } from '../inline.js';
import { labelFields } from '../label.js';

// =============================================================================
// TableBlock — a real table, whose cells can hold blanks.
// -----------------------------------------------------------------------------
// Plan + rulings: docs/design/table-block.md (eng review 2026-08-21).
//
// WHY THIS EXISTS AT ALL. The ```columns workaround PRINTS something that looks
// like a table and is not one: the divider rule is drawn per COLUMN,
// independently, so rows line up only while every cell happens to be one line
// tall. Give one cell a label that wraps and the two columns' dividers desync,
// because there is no row concept in the DOM holding a row together.
//
// ⚠⚠ THE ONE RULE THAT MAKES THE WHOLE DESIGN WORK: `TableRow` and `TableCell`
// CARRY NO `type` FIELD, AND MUST NEVER GAIN ONE.
//
// Four separate walks find blanks and math gaps structurally, at any depth —
// the sanitizer's in-band strip, the client's check-payload index
// (container/blockIndex.ts), the server's grading keys
// (server/grading/walk.ts), and the teacher's answer key (answer-key/extract).
// Three of them stop descending at `looksLikeBlockArray`, which fires on any
// array whose elements ALL carry both a string `id` and a string `type`. Rows
// and cells have an `id` and no `type`, so those walks descend into them and a
// blank in a cell is graded, checked and keyed with ZERO new code.
//
// Add `type: 'table_row'` — the shape a schema author reaches for by reflex —
// and three of the four walks skip the entire table. The sanitizer does NOT
// stop at block arrays, so nothing leaks; the answer is simply never GRADED.
// walk.ts calls that "the worst kind" of failure: submitted, stored, never
// scored. The guard against it is bound to walk OUTPUT (see the quartet in
// viewer/tests and schema/tests/table.test.ts), never to this declaration.
//
// GRADABILITY IS DERIVED, NOT DECLARED. There is no `interactive` flag: a table
// is a question exactly when some cell holds a blank (`isGradeable`, the
// math_block precedent). A flag can drift from content — delete the last blank
// and a stale flag leaves a phantom numbered question in the check payload.
//
// NUMBERING follows faded_worked_example: the whole table is ONE numbered
// problem, and its blanks are lettered (a), (b) … in READING ORDER. The letters
// are derived from position at render time and never stored (`tableBlankIds` +
// `stepLetter`), the same rule fill_in_blank's sub-parts already follow.
// =============================================================================

/** Per-column print/screen alignment, straight from a markdown delimiter row's
 * colons (`|---:|` → right). Right-aligned number columns are what makes a
 * table of figures readable on paper, which is why this is authored data and
 * not a stylesheet decision. */
export const TableColumnAlign = z.enum(['left', 'center', 'right']);
export type TableColumnAlign = z.infer<typeof TableColumnAlign>;

// NO `type` FIELD — see the header. `id` is for stable addressing (React keys,
// editor identity); it is NOT a response key. The response keys are the blank
// ids INSIDE `content`, which is what lets cell blanks ride the existing
// SubmissionResponses.blanks map with no wire-version bump.
export const TableCell = z.object({
  id: z.string().uuid(),
  // The same inline alphabet fill_in_blank's body uses: text with marks,
  // inline math, hard breaks, and blank tokens. Deliberately NOT a block array:
  // it keeps every cell walkable, keeps the schema non-recursive (see the
  // TS7056 note in inline.ts), and keeps a cell a cell rather than a page.
  content: z.array(FillInBlankInline).default([]),
});
export type TableCell = z.infer<typeof TableCell>;

// NO `type` FIELD — see the header.
export const TableRow = z.object({
  id: z.string().uuid(),
  cells: z.array(TableCell).default([]),
});
export type TableRow = z.infer<typeof TableRow>;

export const TableBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('table'),
  // Auto-assigned worksheet number, as on every numbered block. Present only
  // when the table is gradable (a blankless table is a stimulus, not a
  // question) — resolved by numbering, not stored authority.
  number: z.number().int().positive().optional(),
  // Which axis carries the headers. Two booleans rather than a per-cell flag:
  // a header cell in the MIDDLE of a table is not a thing this vocabulary
  // should be able to express, and the a11y story needs to know which axis
  // names a cell ("Kilograms 2, Cost" reads correctly only if we know where the
  // labels live). `headerColumn` is not decoration — algebra tables are as
  // often transposed (x down the left) as not.
  headerRow: z.boolean().default(true),
  headerColumn: z.boolean().default(false),
  // Per-column alignment, index-aligned with each row's cells. Optional with NO
  // default so a table authored without alignment re-serializes byte-identically
  // (the same optional-no-default discipline as BlankToken.answerType). A short
  // array is fine: columns past its end fall back to left.
  columnAligns: z.array(TableColumnAlign).optional(),
  // The (a)/(b) markers on blank cells. Mirrors faded_worked_example's
  // showStepLabels — off gives a teacher maximum writing room on paper.
  // Defaulted so a document authored before this field renders labelled.
  showCellLabels: z.boolean().default(true),
  rows: z.array(TableRow).default([]),
  // The table's own page label (auto/custom/none), like every numbered type.
  ...labelFields,
});
export type TableBlock = z.infer<typeof TableBlock>;

