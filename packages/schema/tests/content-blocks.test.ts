// =============================================================================
// content-blocks.test.ts — learning_objectives + worked_example schema
// -----------------------------------------------------------------------------
// Pure content blocks added in Phase 2. Validates the factories, Block-union
// membership, ColumnCellBlock membership (they're leaf blocks), the nested
// worked-example child union (content-only; questions/columns rejected), and
// that both tolerate an empty items/content list (a legitimate round-trip).
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  Block,
  ColumnCellBlock,
  LearningObjectivesBlock,
  WorkedExampleBlock,
  createLearningObjectivesBlock,
  createWorkedExampleBlock,
} from '../src/index.js';

const uuid = () => crypto.randomUUID();
const text = (t: string) => [{ type: 'text' as const, text: t }];

describe('LearningObjectivesBlock', () => {
  it('factory produces a valid block with the default title', () => {
    const block = createLearningObjectivesBlock();
    expect(block.title).toBe('Learning objectives');
    expect(LearningObjectivesBlock.safeParse(block).success).toBe(true);
  });

  it('accepts rich inline items and parses in the Block union', () => {
    const block = createLearningObjectivesBlock();
    block.items = [text('Solve linear equations'), text('Graph a line')];
    expect(Block.safeParse(block).success).toBe(true);
  });

  it('tolerates an empty items list', () => {
    const block = createLearningObjectivesBlock();
    block.items = [];
    expect(LearningObjectivesBlock.safeParse(block).success).toBe(true);
  });

  it('is a legal column-cell block', () => {
    expect(ColumnCellBlock.safeParse(createLearningObjectivesBlock()).success).toBe(
      true,
    );
  });
});

describe('WorkedExampleBlock', () => {
  it('factory produces a valid block with the default title', () => {
    const block = createWorkedExampleBlock();
    expect(block.title).toBe('Worked example');
    expect(WorkedExampleBlock.safeParse(block).success).toBe(true);
  });

  it('accepts nested content children and parses in the Block union', () => {
    const block = createWorkedExampleBlock();
    block.content = [
      { id: uuid(), type: 'paragraph', content: text('Step 1: isolate x') },
      { id: uuid(), type: 'math_block', latex: 'x = 4' },
    ];
    expect(Block.safeParse(block).success).toBe(true);
  });

  it('rejects a question block as a child (content-only union)', () => {
    const block = createWorkedExampleBlock();
    // A fill_in_blank is not in the WorkedExampleChild union.
    (block.content as unknown[]) = [
      { id: uuid(), type: 'fill_in_blank', content: [], skills: [] },
    ];
    expect(WorkedExampleBlock.safeParse(block).success).toBe(false);
  });

  it('tolerates an empty content list', () => {
    const block = createWorkedExampleBlock();
    block.content = [];
    expect(WorkedExampleBlock.safeParse(block).success).toBe(true);
  });

  it('is a legal column-cell block', () => {
    expect(ColumnCellBlock.safeParse(createWorkedExampleBlock()).success).toBe(true);
  });
});
