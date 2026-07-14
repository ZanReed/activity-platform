// =============================================================================
// rows.test.ts — Validates the structural Row / Column layout layer
// -----------------------------------------------------------------------------
// Layout replaced the old `columns` block type: the document body is a stack of
// rows, each row 1..6 columns, each column a non-empty stack of blocks. Row and
// Column are NOT members of the Block union, so nesting is a structural fact.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  Block,
  Row,
  Column,
  createRow,
  createColumn,
  createParagraphBlock,
  createProblemBlock,
} from '../src/index.js';

const uuid = () => crypto.randomUUID();

describe('Row', () => {
  it('factory produces a valid 1-column (full-width) row by default', () => {
    const row = createRow();
    expect(row.columns).toHaveLength(1);
    expect(Row.safeParse(row).success).toBe(true);
  });

  it('factory clamps count into the 1..6 range', () => {
    expect(createRow(0).columns).toHaveLength(1);
    expect(createRow(1).columns).toHaveLength(1);
    expect(createRow(9).columns).toHaveLength(6);
    expect(createRow(3).columns).toHaveLength(3);
  });

  it('rejects zero columns', () => {
    const bad = { id: uuid(), columns: [] as unknown[] };
    expect(Row.safeParse(bad).success).toBe(false);
  });

  it('rejects more than 6 columns', () => {
    const bad = { id: uuid(), columns: Array.from({ length: 7 }, createColumn) };
    expect(Row.safeParse(bad).success).toBe(false);
  });

  it('accepts an optional positive width weight per column', () => {
    const row = createRow(2);
    row.columns[0]!.width = 2;
    row.columns[1]!.width = 1;
    expect(Row.safeParse(row).success).toBe(true);
  });

  it('rejects a non-positive width', () => {
    const row = createRow(2);
    (row.columns[0] as { width: number }).width = 0;
    expect(Row.safeParse(row).success).toBe(false);
  });

  it('defaults gridLines to inherit and fills it when omitted', () => {
    expect(createRow().gridLines).toBe('inherit');
    const parsed = Row.parse({ id: uuid(), columns: [createColumn()] });
    expect(parsed.gridLines).toBe('inherit');
  });

  it('accepts the explicit gridLines overrides on/off', () => {
    const on = createRow();
    on.gridLines = 'on';
    expect(Row.safeParse(on).success).toBe(true);
    const off = createRow();
    off.gridLines = 'off';
    expect(Row.safeParse(off).success).toBe(true);
  });

  it('rejects an unknown gridLines value', () => {
    const row = createRow() as { gridLines: string };
    row.gridLines = 'maybe';
    expect(Row.safeParse(row).success).toBe(false);
  });
});

describe('Column', () => {
  it('factory seeds a non-empty block stack', () => {
    const col = createColumn();
    expect(col.blocks.length).toBeGreaterThan(0);
    expect(Column.safeParse(col).success).toBe(true);
  });

  it('holds a STACK of blocks (block+), not a single block', () => {
    const col = createColumn();
    col.blocks = [createProblemBlock(), createParagraphBlock(), createProblemBlock()];
    expect(Column.safeParse(col).success).toBe(true);
  });

  it('rejects an empty column (block+ requires at least one)', () => {
    const bad = { id: uuid(), blocks: [] as unknown[] };
    expect(Column.safeParse(bad).success).toBe(false);
  });
});

// ---- Structural no-nesting guard --------------------------------------------
// Row/Column live ABOVE the Block union — a Column holds Block[], never the
// reverse — so nesting a row inside a column is structurally impossible: a Row
// has no `type` discriminator and can't parse as a Block. Adding a new leaf
// block type to blocks/index.ts must NOT reintroduce a layout member there.
describe('layout is not a block (no nesting)', () => {
  const literals = (union: { options: readonly unknown[] }): string[] =>
    union.options.map(
      (opt) => (opt as { shape: { type: { value: string } } }).shape.type.value,
    );

  it('the Block union contains no layout members', () => {
    const types = new Set(literals(Block));
    expect(types.has('columns')).toBe(false);
    expect(types.has('row')).toBe(false);
    expect(types.has('column')).toBe(false);
  });

  it('a Row is not a valid Block', () => {
    expect(Block.safeParse(createRow()).success).toBe(false);
  });

  it("a column's blocks reject a nested row", () => {
    const col = createColumn();
    (col.blocks as unknown[]).push(createRow());
    expect(Column.safeParse(col).success).toBe(false);
  });

  it('a column accepts leaf block types with no exclusions', () => {
    // The old ColumnCellBlock "full union minus columns" carve-out is gone — a
    // column holds any leaf Block.
    const col = createColumn();
    col.blocks = [createParagraphBlock(), createProblemBlock()];
    expect(Column.safeParse(col).success).toBe(true);
  });
});
