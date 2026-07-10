// MatchingBlock + OrderingBlock schema coverage — column/list rules, defaults,
// figure slots, and the factories' valid starting shapes. Public-API imports
// (barrel export). Design: docs/design/matching-ordering-questions.md.
import { describe, it, expect } from 'vitest';
import {
  Block,
  MatchingBlock,
  OrderingBlock,
  createMatchingBlock,
  createOrderingBlock,
} from '../src/index.js';

const BLOCK_ID = '550e8400-e29b-41d4-a716-446655440000';
const ITEM_A = '550e8400-e29b-41d4-a716-446655440001';
const ITEM_B = '550e8400-e29b-41d4-a716-446655440002';
const TARGET_A = '550e8400-e29b-41d4-a716-446655440003';
const TARGET_B = '550e8400-e29b-41d4-a716-446655440004';
const TARGET_C = '550e8400-e29b-41d4-a716-446655440005';

const text = (t: string) => [{ type: 'text' as const, text: t, marks: [] }];

function validMatching() {
  return {
    id: BLOCK_ID,
    type: 'matching' as const,
    prompt: text('Match each equation to its slope.'),
    items: [
      { id: ITEM_A, content: text('y = 2x + 1') },
      { id: ITEM_B, content: text('y = -x') },
    ],
    targets: [
      { id: TARGET_A, content: text('2') },
      { id: TARGET_B, content: text('-1') },
    ],
    key: { [ITEM_A]: TARGET_A, [ITEM_B]: TARGET_B },
  };
}

describe('MatchingBlock', () => {
  it('parses a minimal valid block and applies defaults', () => {
    const parsed = MatchingBlock.parse(validMatching());
    expect(parsed.allowTargetReuse).toBe(false);
    expect(parsed.hasConfidenceRating).toBe(false);
    expect(parsed.skills).toEqual([]);
    expect(parsed.solution).toBeUndefined();
    expect(parsed.workSpace).toBeUndefined();
  });

  it('is a member of the Block union', () => {
    expect(Block.safeParse(validMatching()).success).toBe(true);
  });

  it('rejects fewer than two items or targets', () => {
    const oneItem = validMatching();
    oneItem.items = [oneItem.items[0]!];
    expect(MatchingBlock.safeParse(oneItem).success).toBe(false);

    const oneTarget = validMatching();
    oneTarget.targets = [oneTarget.targets[0]!];
    expect(MatchingBlock.safeParse(oneTarget).success).toBe(false);
  });

  it('accepts more targets than items (distractors)', () => {
    const block = validMatching();
    block.targets = [...block.targets, { id: TARGET_C, content: text('0') }];
    expect(MatchingBlock.safeParse(block).success).toBe(true);
  });

  it('accepts an incomplete key (mid-edit drafts must save)', () => {
    const block = validMatching();
    block.key = { [ITEM_A]: TARGET_A };
    expect(MatchingBlock.safeParse(block).success).toBe(true);
  });

  it('accepts a shared target under the same schema (reuse is a runtime/editor concern)', () => {
    const block = { ...validMatching(), allowTargetReuse: true };
    block.key = { [ITEM_A]: TARGET_A, [ITEM_B]: TARGET_A };
    const parsed = MatchingBlock.parse(block);
    expect(parsed.allowTargetReuse).toBe(true);
  });

  it('accepts image and graph figures on items and targets', () => {
    const block = validMatching();
    block.items[0]!.image = { src: 'https://example.com/fig.png', alt: 'a line' };
    block.targets[1]!.graph = {
      axis: {
        xMin: -10, xMax: 10, yMin: -10, yMax: 10,
        xGrid: 1, yGrid: 1, showAxisNumbers: true, snapToGrid: true,
      },
      drawables: [
        { kind: 'point', at: [1, 2], style: 'closed' },
      ],
    };
    expect(MatchingBlock.safeParse(block).success).toBe(true);
  });

  it('factory produces a schema-valid block with an identity key', () => {
    const block = createMatchingBlock();
    expect(() => MatchingBlock.parse(block)).not.toThrow();
    expect(block.items).toHaveLength(2);
    expect(block.targets).toHaveLength(2);
    expect(block.key[block.items[0]!.id]).toBe(block.targets[0]!.id);
    expect(block.key[block.items[1]!.id]).toBe(block.targets[1]!.id);
  });
});

function validOrdering() {
  return {
    id: BLOCK_ID,
    type: 'ordering' as const,
    prompt: text('Order the steps.'),
    items: [
      { id: ITEM_A, content: text('Subtract 3 from both sides') },
      { id: ITEM_B, content: text('Divide both sides by 2') },
    ],
  };
}

describe('OrderingBlock', () => {
  it('parses a minimal valid block and applies defaults', () => {
    const parsed = OrderingBlock.parse(validOrdering());
    expect(parsed.hasConfidenceRating).toBe(false);
    expect(parsed.skills).toEqual([]);
    expect(parsed.solution).toBeUndefined();
  });

  it('is a member of the Block union', () => {
    expect(Block.safeParse(validOrdering()).success).toBe(true);
  });

  it('rejects fewer than two items', () => {
    const block = validOrdering();
    block.items = [block.items[0]!];
    expect(OrderingBlock.safeParse(block).success).toBe(false);
  });

  it('accepts inline math in item content', () => {
    const block = validOrdering();
    block.items[0]!.content = [{ type: 'math_inline' as const, latex: '2x = 8' }] as never;
    expect(OrderingBlock.safeParse(block).success).toBe(true);
  });

  it('factory produces a schema-valid block (3 items, authored order = correct)', () => {
    const block = createOrderingBlock();
    expect(() => OrderingBlock.parse(block)).not.toThrow();
    expect(block.items).toHaveLength(3);
  });
});
