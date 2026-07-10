// =============================================================================
// matching-ordering.test.ts — renderMatching / renderOrdering
// -----------------------------------------------------------------------------
// The runtime data-attribute contract (data-match-key / data-order-answer,
// item/target ids, dock + ghost slots), the deterministic publish-time
// shuffle (seeded by block id, never the identity arrangement), figure
// emission, and the print answer-key variant (write-the-letter lines /
// number boxes filled).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderMatching } from '../blocks/matching.js';
import { renderOrdering } from '../blocks/ordering.js';
import { seededShuffle } from '../blocks/shuffle.js';
import { isNumberedBlock } from '../blocks/index.js';
import { MatchingBlock, OrderingBlock } from '@activity/schema';

const BLOCK_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const I1 = 'cccccccc-cccc-4ccc-8ccc-000000000001';
const I2 = 'cccccccc-cccc-4ccc-8ccc-000000000002';
const I3 = 'cccccccc-cccc-4ccc-8ccc-000000000003';
const T1 = 'cccccccc-cccc-4ccc-8ccc-000000000011';
const T2 = 'cccccccc-cccc-4ccc-8ccc-000000000012';
const T3 = 'cccccccc-cccc-4ccc-8ccc-000000000013';
const T4 = 'cccccccc-cccc-4ccc-8ccc-000000000014';

const text = (t: string) => [{ type: 'text', text: t }];
const CTX = { problemNumber: 1 };

function matchingBlock(overrides: Record<string, unknown> = {}): MatchingBlock {
  return MatchingBlock.parse({
    id: BLOCK_ID,
    type: 'matching',
    prompt: text('Match each equation to its slope.'),
    items: [
      { id: I1, content: text('y = 2x') },
      { id: I2, content: text('y = -x') },
      { id: I3, content: text('y = 5') },
    ],
    targets: [
      { id: T1, content: text('2') },
      { id: T2, content: text('-1') },
      { id: T3, content: text('0') },
    ],
    key: { [I1]: T1, [I2]: T2, [I3]: T3 },
    ...overrides,
  });
}

function orderingBlock(overrides: Record<string, unknown> = {}): OrderingBlock {
  return OrderingBlock.parse({
    id: BLOCK_ID,
    type: 'ordering',
    prompt: text('Order the steps.'),
    items: [
      { id: I1, content: text('first') },
      { id: I2, content: text('second') },
      { id: I3, content: text('third') },
    ],
    ...overrides,
  });
}

// Rendered target order, recovered from the target-slot markup.
function renderedTargetIds(html: string): string[] {
  return [...html.matchAll(/class="match-target-slot"[^>]*data-target-id="([^"]+)"/g)].map(
    (m) => m[1]!,
  );
}

describe('seededShuffle', () => {
  it('is deterministic for the same seed', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    expect(seededShuffle(items, 'seed-1')).toEqual(seededShuffle(items, 'seed-1'));
  });

  it('varies across seeds (spot check)', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const deals = new Set(
      ['s1', 's2', 's3', 's4'].map((s) => seededShuffle(items, s).join('')),
    );
    expect(deals.size).toBeGreaterThan(1);
  });

  it('never deals the identity arrangement (answer-order giveaway)', () => {
    const items = ['a', 'b'];
    for (let i = 0; i < 50; i++) {
      const out = seededShuffle(items, 'seed-' + String(i));
      expect(out).not.toEqual(items);
    }
  });

  it('preserves the element set', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect([...seededShuffle(items, 'x')].sort()).toEqual(items);
  });
});

describe('renderMatching', () => {
  it('emits the question block contract attributes', () => {
    const html = renderMatching(matchingBlock(), CTX);
    expect(html).toContain('data-block-category="question"');
    expect(html).toContain('data-block-type="matching"');
    expect(html).toContain('data-block-id="' + BLOCK_ID + '"');
    expect(html).toContain('data-match-key=');
    expect(html).not.toContain('data-match-reuse');
    // The baked key round-trips through the attribute encoding.
    const keyAttr = html.match(/data-match-key="([^"]+)"/)?.[1] ?? '';
    const key = JSON.parse(keyAttr.replace(/&quot;/g, '"')) as Record<string, string>;
    expect(key[I1]).toBe(T1);
  });

  it('renders every item with an empty dock slot and a print letter line', () => {
    const html = renderMatching(matchingBlock(), CTX);
    for (const id of [I1, I2, I3]) {
      expect(html).toContain('data-item-id="' + id + '"');
    }
    expect(html.match(/class="match-slot"/g)).toHaveLength(3);
    expect(html.match(/class="match-letter-line"/g)).toHaveLength(3);
  });

  it('shuffles targets deterministically and never in authored order', () => {
    const first = renderMatching(matchingBlock(), CTX);
    const second = renderMatching(matchingBlock(), CTX);
    expect(renderedTargetIds(first)).toEqual(renderedTargetIds(second));
    expect(renderedTargetIds(first)).not.toEqual([T1, T2, T3]);
    expect([...renderedTargetIds(first)].sort()).toEqual([T1, T2, T3].sort());
  });

  it('letters follow the shuffled positions, with ghost letters in each slot', () => {
    const html = renderMatching(matchingBlock(), CTX);
    const ids = renderedTargetIds(html);
    // First rendered slot carries letter A both on the card and the ghost.
    const firstSlot = html.slice(html.indexOf(ids[0]!));
    expect(firstSlot).toContain('match-slot-ghost" aria-hidden="true">A.');
    expect(firstSlot).toContain('match-target-letter" aria-hidden="true">A.');
  });

  it('renders distractor targets (more targets than items)', () => {
    const html = renderMatching(
      matchingBlock({
        targets: [
          { id: T1, content: text('2') },
          { id: T2, content: text('-1') },
          { id: T3, content: text('0') },
          { id: T4, content: text('7') },
        ],
      }),
      CTX,
    );
    expect(renderedTargetIds(html)).toHaveLength(4);
  });

  it('emits the reuse attribute and hint when allowTargetReuse is on', () => {
    const html = renderMatching(matchingBlock({ allowTargetReuse: true }), CTX);
    expect(html).toContain('data-match-reuse="true"');
    expect(html).toContain('used more than once');
  });

  it('answer-key variant fills each letter line with the keyed target letter', () => {
    const html = renderMatching(matchingBlock(), { problemNumber: 1, showAnswers: true });
    const ids = renderedTargetIds(html);
    const letterOf = (targetId: string) =>
      String.fromCharCode(65 + ids.indexOf(targetId));
    expect(html).toContain(
      'match-letter-line match-key-correct" aria-hidden="true">' + letterOf(T1),
    );
    expect(html.match(/match-key-correct/g)).toHaveLength(3);
  });

  it('renders image and graph figures on items and targets', () => {
    const html = renderMatching(
      matchingBlock({
        items: [
          {
            id: I1,
            content: text('a'),
            image: { src: 'https://example.com/fig.png', alt: 'a line' },
          },
          { id: I2, content: text('b') },
        ],
        targets: [
          {
            id: T1,
            content: [],
            graph: {
              axis: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
              drawables: [{ kind: 'point', at: [1, 2] }],
            },
          },
          { id: T2, content: text('d') },
        ],
        key: { [I1]: T1, [I2]: T2 },
      }),
      CTX,
    );
    expect(html).toContain('match-figure');
    expect(html).toContain('src="https://example.com/fig.png"');
    expect(html).toContain('graph-paper');
  });

  it('emits confidence + solution chrome like other question blocks', () => {
    const html = renderMatching(
      matchingBlock({
        hasConfidenceRating: true,
        solution: text('Slopes read off the x coefficient.'),
      }),
      CTX,
    );
    expect(html).toContain('js-confidence-rating');
    expect(html).toContain('print-confidence');
    expect(html).toContain('js-solution');
    expect(html).toContain('hidden');
  });
});

describe('renderOrdering', () => {
  it('emits the question block contract attributes with the authored order as key', () => {
    const html = renderOrdering(orderingBlock(), CTX);
    expect(html).toContain('data-block-category="question"');
    expect(html).toContain('data-block-type="ordering"');
    const answerAttr = html.match(/data-order-answer="([^"]+)"/)?.[1] ?? '';
    const answer = JSON.parse(answerAttr.replace(/&quot;/g, '"')) as string[];
    expect(answer).toEqual([I1, I2, I3]);
  });

  it('renders items shuffled deterministically and never in authored order', () => {
    const ids = (html: string) =>
      [...html.matchAll(/class="order-item"[^>]*data-item-id="([^"]+)"/g)].map(
        (m) => m[1]!,
      );
    const first = renderOrdering(orderingBlock(), CTX);
    expect(ids(first)).toEqual(ids(renderOrdering(orderingBlock(), CTX)));
    expect(ids(first)).not.toEqual([I1, I2, I3]);
    expect([...ids(first)].sort()).toEqual([I1, I2, I3].sort());
  });

  it('renders a blank write-in number box per item (print convention)', () => {
    const html = renderOrdering(orderingBlock(), CTX);
    expect(html.match(/class="order-number-box"/g)).toHaveLength(3);
    expect(html).toContain('order-item-grip');
  });

  it('answer-key variant fills each number box with the correct position', () => {
    const html = renderOrdering(orderingBlock(), { problemNumber: 1, showAnswers: true });
    expect(html.match(/order-key-correct/g)).toHaveLength(3);
    // The item authored first shows position 1 regardless of render order.
    const i1Chunk = html.slice(html.indexOf('data-item-id="' + I1 + '"') - 200);
    expect(i1Chunk).toContain('order-key-correct" aria-hidden="true">1<');
  });
});

describe('numbering', () => {
  it('matching and ordering join the auto-numbered problem sequence', () => {
    expect(isNumberedBlock(matchingBlock())).toBe(true);
    expect(isNumberedBlock(orderingBlock())).toBe(true);
  });
});
