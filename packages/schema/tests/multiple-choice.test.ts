// MultipleChoiceBlock schema coverage — the choice list rules, defaults, and
// the factory's valid starting shape. Public-API imports (barrel export).
import { describe, it, expect } from 'vitest';
import {
  Block,
  MultipleChoiceBlock,
  createMultipleChoiceBlock,
  createMultipleChoiceOption,
} from '../src/index.js';

const BLOCK_ID = '550e8400-e29b-41d4-a716-446655440000';
const CHOICE_A = '550e8400-e29b-41d4-a716-446655440001';
const CHOICE_B = '550e8400-e29b-41d4-a716-446655440002';

function validBlock() {
  return {
    id: BLOCK_ID,
    type: 'multiple_choice' as const,
    prompt: [{ type: 'text' as const, text: 'Pick one.', marks: [] }],
    choices: [
      {
        id: CHOICE_A,
        content: [{ type: 'text' as const, text: '4', marks: [] }],
        correct: true,
      },
      {
        id: CHOICE_B,
        content: [{ type: 'text' as const, text: '5', marks: [] }],
        correct: false,
      },
    ],
  };
}

describe('MultipleChoiceBlock', () => {
  it('parses a minimal valid block and applies defaults', () => {
    const parsed = MultipleChoiceBlock.parse(validBlock());
    expect(parsed.multiSelect).toBe(false);
    expect(parsed.hasConfidenceRating).toBe(false);
    expect(parsed.skills).toEqual([]);
    expect(parsed.solution).toBeUndefined();
    expect(parsed.workSpace).toBeUndefined();
  });

  it('is a member of the Block union', () => {
    expect(Block.safeParse(validBlock()).success).toBe(true);
  });

  it('rejects fewer than two choices', () => {
    const block = validBlock();
    block.choices = [block.choices[0]!];
    expect(MultipleChoiceBlock.safeParse(block).success).toBe(false);
  });

  it('accepts zero correct choices (mid-edit drafts must save)', () => {
    const block = validBlock();
    block.choices = block.choices.map((c) => ({ ...c, correct: false }));
    expect(MultipleChoiceBlock.safeParse(block).success).toBe(true);
  });

  it('accepts multiSelect with several correct choices and per-choice feedback', () => {
    const block = {
      ...validBlock(),
      multiSelect: true,
      choices: [
        {
          id: CHOICE_A,
          content: [{ type: 'text' as const, text: '2', marks: [] }],
          correct: true,
          feedback: [
            { type: 'text' as const, text: 'Yes — 2 is prime.', marks: [] },
          ],
        },
        {
          id: CHOICE_B,
          content: [
            { type: 'math_inline' as const, latex: '\\sqrt{9}' },
          ],
          correct: true,
        },
      ],
    };
    const parsed = MultipleChoiceBlock.parse(block);
    expect(parsed.multiSelect).toBe(true);
    expect(parsed.choices[0]!.feedback).toHaveLength(1);
  });

  it('factory produces a schema-valid block (3 choices, first correct)', () => {
    const block = createMultipleChoiceBlock();
    expect(() => MultipleChoiceBlock.parse(block)).not.toThrow();
    expect(block.choices).toHaveLength(3);
    expect(block.choices[0]!.correct).toBe(true);
    expect(block.choices.map((c) => c.correct)).toEqual([true, false, false]);
  });

  it('option factory defaults to incorrect', () => {
    expect(createMultipleChoiceOption().correct).toBe(false);
    expect(createMultipleChoiceOption(true).correct).toBe(true);
  });
});
