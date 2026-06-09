// =============================================================================
// columns.test.ts — Validates the structural columns container block
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  Block,
  ColumnsBlock,
  createColumnsBlock,
  createColumn,
  createParagraphBlock,
  createProblemBlock,
} from '../src/index.js';

const uuid = () => crypto.randomUUID();

describe('ColumnsBlock', () => {
  it('factory produces a valid 2-column block', () => {
    const block = createColumnsBlock();
    const result = ColumnsBlock.safeParse(block);
    expect(result.success).toBe(true);
    expect(block.columns).toHaveLength(2);
  });

  it('factory clamps count into the 2..6 range', () => {
    expect(createColumnsBlock(1).columns).toHaveLength(2);
    expect(createColumnsBlock(9).columns).toHaveLength(6);
    expect(createColumnsBlock(3).columns).toHaveLength(3);
  });

  it('parses as a member of the Block union', () => {
    const block = createColumnsBlock(2);
    block.columns[0]!.blocks.push(createProblemBlock());
    block.columns[1]!.blocks.push(createParagraphBlock());
    const result = Block.safeParse(block);
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 2 columns', () => {
    const bad = { id: uuid(), type: 'columns', columns: [createColumn()] };
    expect(ColumnsBlock.safeParse(bad).success).toBe(false);
  });

  it('rejects more than 6 columns', () => {
    const bad = {
      id: uuid(),
      type: 'columns',
      columns: Array.from({ length: 7 }, createColumn),
    };
    expect(ColumnsBlock.safeParse(bad).success).toBe(false);
  });

  it('accepts an optional positive width weight per column', () => {
    const block = createColumnsBlock(2);
    block.columns[0]!.width = 2;
    block.columns[1]!.width = 1;
    expect(ColumnsBlock.safeParse(block).success).toBe(true);
  });

  it('rejects a non-positive width', () => {
    const block = createColumnsBlock(2);
    (block.columns[0] as { width: number }).width = 0;
    expect(ColumnsBlock.safeParse(block).success).toBe(false);
  });

  it('FORBIDS columns nested inside a column (one level deep)', () => {
    const outer = createColumnsBlock(2);
    const inner = createColumnsBlock(2);
    // A nested columns block is not a valid cell block.
    (outer.columns[0]!.blocks as unknown[]).push(inner);
    expect(ColumnsBlock.safeParse(outer).success).toBe(false);
  });
});
