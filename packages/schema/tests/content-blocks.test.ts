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
  FadedWorkedExampleBlock,
  SelfExplanationBlock,
  ShortAnswerBlock,
  EssayBlock,
  createLearningObjectivesBlock,
  createWorkedExampleBlock,
  createFadedWorkedExampleBlock,
  createSelfExplanationBlock,
  createShortAnswerBlock,
  createEssayBlock,
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

describe('FadedWorkedExampleBlock', () => {
  it('factory produces a valid block with the default title', () => {
    const block = createFadedWorkedExampleBlock();
    expect(block.title).toBe('Guided practice');
    expect(FadedWorkedExampleBlock.safeParse(block).success).toBe(true);
  });

  it('accepts a fill_in_blank child (the faded step) and parses in the Block union', () => {
    const block = createFadedWorkedExampleBlock();
    block.content = [
      { id: uuid(), type: 'paragraph', content: text('Shown step: subtract 3.') },
      {
        id: uuid(),
        type: 'fill_in_blank',
        content: [
          { type: 'text', text: 'x = ', marks: [] },
          { type: 'blank', id: uuid(), answer: '4', acceptableAnswers: [] },
        ],
        skills: [],
      },
    ];
    expect(Block.safeParse(block).success).toBe(true);
  });

  it('rejects a non-fill_in_blank question child (e.g. multiple_choice)', () => {
    const block = createFadedWorkedExampleBlock();
    (block.content as unknown[]) = [
      { id: uuid(), type: 'multiple_choice', prompt: [], options: [], selectMode: 'single' },
    ];
    expect(FadedWorkedExampleBlock.safeParse(block).success).toBe(false);
  });

  it('is a legal column-cell block', () => {
    expect(ColumnCellBlock.safeParse(createFadedWorkedExampleBlock()).success).toBe(
      true,
    );
  });
});

describe('SelfExplanationBlock', () => {
  it('factory produces a valid block (empty prompt, no placeholder)', () => {
    const block = createSelfExplanationBlock();
    expect(SelfExplanationBlock.safeParse(block).success).toBe(true);
  });

  it('accepts a rich prompt + optional placeholder and parses in the Block union', () => {
    const block = createSelfExplanationBlock();
    block.prompt = text('Why did you subtract 3?');
    block.placeholder = 'I subtracted 3 because…';
    expect(Block.safeParse(block).success).toBe(true);
  });

  it('has no answer key (ungraded — the shape carries only prompt + placeholder)', () => {
    const block = createSelfExplanationBlock() as Record<string, unknown>;
    expect('answer' in block).toBe(false);
    expect('correct' in block).toBe(false);
  });

  it('is a legal column-cell block', () => {
    expect(ColumnCellBlock.safeParse(createSelfExplanationBlock()).success).toBe(
      true,
    );
  });
});

describe('ShortAnswerBlock + EssayBlock (manually-graded free text)', () => {
  it('short_answer factory + parse; accepts a prompt + optional placeholder', () => {
    const block = createShortAnswerBlock();
    expect(ShortAnswerBlock.safeParse(block).success).toBe(true);
    block.prompt = text('Summarize the passage.');
    block.placeholder = 'In your own words…';
    expect(Block.safeParse(block).success).toBe(true);
  });

  it('essay factory + parse; accepts an optional word-count hint', () => {
    const block = createEssayBlock();
    expect(EssayBlock.safeParse(block).success).toBe(true);
    block.prompt = text('Write a persuasive essay.');
    block.wordCountHint = { min: 200, max: 300 };
    expect(Block.safeParse(block).success).toBe(true);
  });

  it('essay rejects an inverted word-count range (min > max)', () => {
    const block = createEssayBlock();
    block.wordCountHint = { min: 300, max: 200 };
    expect(EssayBlock.safeParse(block).success).toBe(false);
  });

  it('neither carries an answer key (manually graded)', () => {
    for (const block of [
      createShortAnswerBlock() as Record<string, unknown>,
      createEssayBlock() as Record<string, unknown>,
    ]) {
      expect('answer' in block).toBe(false);
      expect('correct' in block).toBe(false);
    }
  });

  it('both are legal column-cell blocks', () => {
    expect(ColumnCellBlock.safeParse(createShortAnswerBlock()).success).toBe(true);
    expect(ColumnCellBlock.safeParse(createEssayBlock()).success).toBe(true);
  });
});
