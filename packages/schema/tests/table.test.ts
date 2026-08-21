import { describe, it, expect } from 'vitest';
import {
  Block,
  TableBlock,
  createTableBlock,
  isGradeable,
  isPageNumbered,
  pageLabel,
  stepLetter,
  tableBlankIds,
} from '../src/index.js';
import type { BlankToken, FillInBlankInline } from '../src/inline.js';

// =============================================================================
// table.test.ts — the schema half of the table block
// -----------------------------------------------------------------------------
// The load-bearing test here is §A, and it is not about zod.
//
// A blank inside a table cell is graded, checked, sanitized and answer-keyed by
// four separate DEEP WALKS that descend structurally rather than by consulting
// a per-type field list. Three of them stop at `looksLikeBlockArray`, which
// fires on any array whose elements ALL carry both a string `id` and a string
// `type`. Rows and cells carry an `id` and no `type`, which is the entire
// reason this design needs no new grading code.
//
// Give a row a `type` and three of those four walks skip the table. Nothing
// LEAKS (the sanitizer never stops descending), so no leak suite goes red — the
// student's answer is simply never scored. §A is the schema-side half of the
// guard; the other half asserts the walks' actual OUTPUT (viewer/tests).
// =============================================================================

const uuid = () => crypto.randomUUID();
const text = (t: string): FillInBlankInline => ({ type: 'text', text: t, marks: [] });
const blank = (answer: string, extra: Partial<BlankToken> = {}): FillInBlankInline =>
  ({
    type: 'blank',
    id: uuid(),
    answer,
    acceptableAnswers: [],
    interchangeableWithPrevious: false,
    ...extra,
  }) as FillInBlankInline;

/** A 2-column table: header row, then `bodyRows` rows of the given cells. */
function tableOf(rows: FillInBlankInline[][][]): TableBlock {
  return TableBlock.parse({
    id: uuid(),
    type: 'table',
    headerRow: true,
    headerColumn: false,
    showCellLabels: true,
    rows: rows.map((cells) => ({
      id: uuid(),
      cells: cells.map((content) => ({ id: uuid(), content })),
    })),
  });
}

// =============================================================================
// §A — the typeless-record invariant
// =============================================================================

describe('§A rows and cells are structurally walkable', () => {
  // The heuristic, restated here EXACTLY as blockIndex.ts implements it. This
  // is a deliberate second copy: importing it would mean schema depending on
  // viewer (forbidden — schema imports zod and nothing else), and the point of
  // the copy is that if the heuristic ever changes, THIS test still describes
  // the property the schema shape must satisfy, and the viewer-side quartet
  // catches the disagreement.
  const looksLikeBlockArray = (value: unknown): boolean =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { type?: unknown }).type === 'string',
    ) &&
    value.every((item) => {
      const t = (item as { type: string }).type;
      return t !== 'text' && t !== 'blank' && t !== 'math_inline' && t !== 'hard_break';
    });

  it('a table’s rows are NOT mistaken for a nested block array', () => {
    const table = tableOf([[[text('x')], [text('y')]]]);
    expect(looksLikeBlockArray(table.rows)).toBe(false);
  });

  it('a row’s cells are NOT mistaken for a nested block array', () => {
    const table = tableOf([[[text('x')], [blank('7')]]]);
    expect(looksLikeBlockArray(table.rows[0]!.cells)).toBe(false);
  });

  it('no row or cell carries a `type` field at all', () => {
    // The direct statement of the rule, so a future edit that adds one fails
    // here with the reason attached rather than only failing three walks away.
    const table = tableOf([[[text('x')], [blank('7')]]]);
    for (const row of table.rows) {
      expect(row).not.toHaveProperty('type');
      for (const cell of row.cells) expect(cell).not.toHaveProperty('type');
    }
  });
});

// =============================================================================
// §B — Q4: gradability is derived from content, at both poles
// =============================================================================

describe('§B gradability and numbering derive from content', () => {
  it('a table with a blank in a cell is gradable and numbered', () => {
    const table = tableOf([
      [[text('Kilograms')], [text('Cost')]],
      [[text('2')], [blank('9.00')]],
    ]);
    expect(isGradeable(table)).toBe(true);
    expect(isPageNumbered(table)).toBe(true);
    expect(pageLabel(table)).toEqual({ kind: 'number' });
  });

  it('a blankless table is a STIMULUS: not gradable, not numbered', () => {
    const table = tableOf([
      [[text('Kilograms')], [text('Cost')]],
      [[text('2')], [text('9.00')]],
    ]);
    expect(isGradeable(table)).toBe(false);
    expect(isPageNumbered(table)).toBe(false);
  });

  it('deleting the last blank flips it back — no flag can drift', () => {
    const table = tableOf([[[text('a')], [blank('1')]]]);
    expect(isGradeable(table)).toBe(true);
    const emptied: TableBlock = {
      ...table,
      rows: table.rows.map((r) => ({
        ...r,
        cells: r.cells.map((c) => ({ ...c, content: [text('1')] })),
      })),
    };
    expect(isGradeable(emptied)).toBe(false);
    expect(isPageNumbered(emptied)).toBe(false);
  });

  it('a freshly created table is blankless, so it pulls no problem number', () => {
    const fresh = createTableBlock();
    expect(isGradeable(fresh)).toBe(false);
    expect(Block.parse(fresh)).toBeTruthy();
  });
});

// =============================================================================
// §C — Q5: reading order is row-major, and it is what `~` means in a table
// =============================================================================

describe('§C tableBlankIds is row-major reading order', () => {
  it('reads left to right, then down — never column-major', () => {
    const a = blank('a');
    const b = blank('b');
    const c = blank('c');
    const d = blank('d');
    // | a | b |
    // | c | d |
    const table = tableOf([
      [[a], [b]],
      [[c], [d]],
    ]);
    const ids = tableBlankIds(table);
    expect(ids).toEqual([
      (a as BlankToken).id,
      (b as BlankToken).id,
      (c as BlankToken).id,
      (d as BlankToken).id,
    ]);
  });

  it('two blanks stacked in a COLUMN are not adjacent (the ~ trap)', () => {
    const top = blank('top');
    const bottom = blank('bottom');
    // | top | x |
    // | bot | y |   → reading order is [top, bottom] only if width is 1.
    const table = tableOf([
      [[top], [text('x')]],
      [[bottom], [text('y')]],
    ]);
    const ids = tableBlankIds(table);
    // They ARE adjacent in this shape only because the other cells hold no
    // blanks. Add a blank between them and the stacking is broken:
    const middle = blank('middle');
    const wider = tableOf([
      [[top], [middle]],
      [[bottom], [text('y')]],
    ]);
    expect(ids.length).toBe(2);
    expect(tableBlankIds(wider)).toEqual([
      (top as BlankToken).id,
      (middle as BlankToken).id,
      (bottom as BlankToken).id,
    ]);
  });

  it('several blanks in ONE cell keep their in-cell order', () => {
    const first = blank('1');
    const second = blank('2');
    const table = tableOf([[[first, text(' and '), second]]]);
    expect(tableBlankIds(table)).toEqual([
      (first as BlankToken).id,
      (second as BlankToken).id,
    ]);
  });

  it('the letter a cell blank wears is stepLetter of its reading position', () => {
    const a = blank('a');
    const b = blank('b');
    const table = tableOf([[[a], [b]]]);
    const ids = tableBlankIds(table);
    expect(stepLetter(ids.indexOf((b as BlankToken).id))).toBe('b');
  });

  it('an empty table has no blanks and does not throw', () => {
    expect(tableBlankIds(tableOf([]))).toEqual([]);
  });
});

// =============================================================================
// §D — shape
// =============================================================================

describe('§D schema shape', () => {
  it('column alignment round-trips and tolerates a short array', () => {
    const parsed = TableBlock.parse({
      id: uuid(),
      type: 'table',
      columnAligns: ['left', 'right'],
      rows: [{ id: uuid(), cells: [{ id: uuid(), content: [] }, { id: uuid(), content: [] }, { id: uuid(), content: [] }] }],
    });
    expect(parsed.columnAligns).toEqual(['left', 'right']);
  });

  it('columnAligns stays ABSENT when unauthored (byte-identical re-serialize)', () => {
    const parsed = TableBlock.parse({ id: uuid(), type: 'table', rows: [] });
    expect('columnAligns' in parsed).toBe(false);
  });

  it('header flags default to a plain top-header table', () => {
    const parsed = TableBlock.parse({ id: uuid(), type: 'table', rows: [] });
    expect(parsed.headerRow).toBe(true);
    expect(parsed.headerColumn).toBe(false);
    expect(parsed.showCellLabels).toBe(true);
  });

  it('a table is a member of the Block union', () => {
    const parsed = Block.parse(createTableBlock());
    expect(parsed.type).toBe('table');
  });
});
