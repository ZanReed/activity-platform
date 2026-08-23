// =============================================================================
// table-blank-ids.ts — the table's blank ORDER, extracted from its schema module
// -----------------------------------------------------------------------------
// WHY IT LIVES HERE AND NOT IN blocks/table.ts (shell-slim rung 1, 2026-08-23).
// This is a pure function over a structural shape. It lived beside the table's
// zod schema because that is where the table lives — but `block-predicates.ts`
// imports it as a VALUE, and that single edge dragged zod into the STUDENT
// SHELL: every `z.object({…})` in blocks/table.ts is constructed at module load,
// so importing one pure helper pulled the whole schema layer and zod with it.
//
// Measured, both conditions necessary and neither sufficient alone: this
// extraction ALONE left the entry chunk byte-identical, and `sideEffects: false`
// alone left zod present. Together they took the student's entry chunk from
// 160.5 to 143.2 KiB gz with zod absent. Design + measurements:
// docs/design/shell-slim-zod.md.
//
// Same move, same reason, as `step-letter.ts` under viewer-numbering ruling N9
// — read that file's header for the pattern.
//
// NOTHING ABOUT THE FUNCTION CHANGED, and it keeps its own type: TableBlankSource
// was always a hand-written STRUCTURAL interface (it asks for `type` and `id`
// and nothing else), never derived from the zod schema, so moving it costs no
// type checking. If it ever needs the real TableBlock type, import it
// `import type` — a value import here would re-create the edge this file exists
// to break.
// =============================================================================

/**
 * The structural shape `tableBlankIds` reads — deliberately NOT `TableBlock`.
 *
 * The viewer calls it with the SANITIZED projection of a table, whose blank
 * tokens have had `answer`/`acceptableAnswers`/`mistakeFeedback` stripped, so
 * they are not assignable to the authored type (that non-assignability is the
 * answer-key guarantee made structural, and it is working as intended). The
 * enumeration only ever reads `type` and `id`, so it asks for exactly that and
 * serves the authored document, the served one, and the teacher's key from one
 * implementation.
 */
export interface TableBlankSource {
  rows?: Array<{
    cells?: Array<{ content?: Array<{ type?: string; id?: string }> }>;
  }>;
}

/**
 * Every blank id in a table, in READING ORDER (row-major: left to right, then
 * down). The one enumeration, single-sourced (D7.5).
 *
 * WHY IT LIVES HERE. Three consumers need the same order and would each have
 * hand-rolled it: the viewer's cell markers and a11y names, and the teacher's
 * printed answer key. Three copies of an ordering rule is exactly the drift the
 * stepLetter consolidation (viewer-numbering N9) was written to end, and a
 * disagreement here is not cosmetic — it renames a student's "(b)" between the
 * screen and the key.
 *
 * The LETTER is `stepLetter(index)` of this array, derived from position at
 * render time and never stored — the rule fill_in_blank's sub-parts already
 * follow ("position is a property of what was served, not of the document").
 *
 * This order is also what `interchangeableWithPrevious` means inside a table:
 * "the previous blank" is the previous entry HERE, so two blanks side by side
 * in a row are adjacent and two stacked in a column are not.
 */
export function tableBlankIds(block: TableBlankSource): string[] {
  const ids: string[] = [];
  // DEFENSIVE ITERATION, deliberately. `isGradeable` calls this from render-path
  // helpers (familyOf / categoryOf / pageLabel) that also run against hollow or
  // partially-built blocks — a conformance fixture, a block mid-construction in
  // the editor, a served projection. A predicate that THROWS there takes the
  // whole page down to answer "is this gradable?", so an absent array reads as
  // "no blanks yet", which is the authored-empty posture the grading walk takes
  // too. Zod still rejects a malformed shape at the storage boundary; this is
  // about not being the thing that crashes before it gets there.
  const rows = Array.isArray(block.rows) ? block.rows : [];
  for (const row of rows) {
    const cells = Array.isArray(row?.cells) ? row.cells : [];
    for (const cell of cells) {
      const content = Array.isArray(cell?.content) ? cell.content : [];
      for (const node of content) {
        if (node?.type === 'blank' && typeof node.id === 'string') {
          ids.push(node.id);
        }
      }
    }
  }
  return ids;
}
