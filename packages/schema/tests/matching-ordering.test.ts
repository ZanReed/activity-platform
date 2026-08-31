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

  it('accepts a shared target, and strips the deleted allowTargetReuse key (orphan ruling 2026-08-24)', () => {
    const block = { ...validMatching(), allowTargetReuse: true };
    block.key = { [ITEM_A]: TARGET_A, [ITEM_B]: TARGET_A };
    const parsed = MatchingBlock.parse(block);
    expect(Object.values(parsed.key)).toEqual([TARGET_A, TARGET_A]);
    expect('allowTargetReuse' in parsed).toBe(false);
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

// CorrespondenceBlock — the N-way sibling (wishlist #4). Reuses matching's
// item/target shapes; adds the column axis + the nested key.
import { CorrespondenceBlock, createCorrespondenceBlock } from '../src/index.js';

const COL_A = '550e8400-e29b-41d4-a716-446655440011';
const COL_B = '550e8400-e29b-41d4-a716-446655440012';
const CARD_A1 = '550e8400-e29b-41d4-a716-446655440013';
const CARD_A2 = '550e8400-e29b-41d4-a716-446655440014';
const CARD_B1 = '550e8400-e29b-41d4-a716-446655440015';
const CARD_B2 = '550e8400-e29b-41d4-a716-446655440016';

function validCorrespondence() {
  return {
    id: BLOCK_ID,
    type: 'correspondence' as const,
    prompt: text('Match each function to its representations.'),
    items: [
      { id: ITEM_A, content: text('y = 2x') },
      { id: ITEM_B, content: text('y = -x') },
    ],
    targetColumns: [
      {
        id: COL_A,
        header: text('Graph'),
        targets: [
          { id: CARD_A1, content: text('rises') },
          { id: CARD_A2, content: text('falls') },
        ],
      },
      {
        id: COL_B,
        header: text('Description'),
        targets: [
          { id: CARD_B1, content: text('doubles') },
          { id: CARD_B2, content: text('drops') },
        ],
      },
    ],
    key: {
      [ITEM_A]: { [COL_A]: CARD_A1, [COL_B]: CARD_B1 },
      [ITEM_B]: { [COL_A]: CARD_A2, [COL_B]: CARD_B2 },
    },
  };
}

describe('CorrespondenceBlock', () => {
  it('parses a valid block, applies defaults, and joins the Block union', () => {
    const parsed = CorrespondenceBlock.parse(validCorrespondence());
    expect(parsed.skills).toEqual([]);
    expect(Block.safeParse(validCorrespondence()).success).toBe(true);
  });

  it('requires 2-3 target columns and 2+ cards per column', () => {
    const one = { ...validCorrespondence(), targetColumns: [validCorrespondence().targetColumns[0]!] };
    expect(CorrespondenceBlock.safeParse(one).success).toBe(false);
    const four = {
      ...validCorrespondence(),
      targetColumns: [0, 1, 2, 3].map((i) => ({
        id: `550e8400-e29b-41d4-a716-44665544002${i}`,
        header: [],
        targets: validCorrespondence().targetColumns[0]!.targets,
      })),
    };
    expect(CorrespondenceBlock.safeParse(four).success).toBe(false);
    const thin = { ...validCorrespondence() };
    thin.targetColumns = [
      thin.targetColumns[0]!,
      { ...thin.targetColumns[1]!, targets: [thin.targetColumns[1]!.targets[0]!] },
    ];
    expect(CorrespondenceBlock.safeParse(thin).success).toBe(false);
  });

  it('a PARTIAL key parses — mid-edit drafts must save', () => {
    const partial = { ...validCorrespondence(), key: { [ITEM_A]: { [COL_A]: CARD_A1 } } };
    expect(CorrespondenceBlock.safeParse(partial).success).toBe(true);
  });

  it('the factory produces a valid, fully keyed starting shape', () => {
    const block = createCorrespondenceBlock();
    const parsed = CorrespondenceBlock.parse(block);
    expect(parsed.targetColumns).toHaveLength(2);
    for (const item of parsed.items) {
      expect(Object.keys(parsed.key[item.id] ?? {})).toHaveLength(2);
    }
  });
});
