// =============================================================================
// foldable-paginate.test.ts — the journal foldable pagination engine
// -----------------------------------------------------------------------------
// Pure packing logic: measured item heights + a panel budget → index groups.
// No DOM; these are the load-bearing geometry guarantees (never split a problem,
// greedy fill, oversized-item isolation).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { paginate, type FlowItem } from '../lib/foldable/paginate';

const item = (height: number): FlowItem => ({ html: `<p>${height}</p>`, height });

describe('paginate', () => {
  it('returns no panels for no items', () => {
    expect(paginate([], { panelHeightPx: 100, spacingPx: 0 })).toEqual([]);
  });

  it('packs items greedily until the next would overflow', () => {
    // budget 100, no spacing: 40+40 fits (80), +40 would be 120 → new panel.
    const items = [item(40), item(40), item(40), item(40)];
    const panels = paginate(items, { panelHeightPx: 100, spacingPx: 0 });
    expect(panels).toEqual([[0, 1], [2, 3]]);
  });

  it('accounts for inter-item spacing (n items → n-1 gaps)', () => {
    // budget 100, spacing 30: item0 (40), gap+item1 = 40+30+40 = 110 > 100 →
    // item1 starts a new panel.
    const items = [item(40), item(40)];
    const panels = paginate(items, { panelHeightPx: 100, spacingPx: 30 });
    expect(panels).toEqual([[0], [1]]);
  });

  it('keeps an oversized item whole in its own panel rather than splitting', () => {
    const items = [item(50), item(250), item(50)];
    const panels = paginate(items, { panelHeightPx: 100, spacingPx: 0 });
    // 50 fills panel 0; the 250 item can't fit anywhere so it gets a panel to
    // itself (over-full but intact); the trailing 50 starts another.
    expect(panels).toEqual([[0], [1], [2]]);
  });

  it('keeps a tall columns container whole rather than splitting it across a fold', () => {
    // A columns container measures as one FlowItem (extractFlowBlocks keeps it
    // intact — see foldable-measure.test.ts). Even when it is taller than a
    // whole panel, it stays a single unit: its own over-full panel, never split
    // mid-container. This is the foldable-with-columns guarantee.
    const tallColumns = item(260); // > panel budget of 100
    const items = [item(40), tallColumns, item(40)];
    const panels = paginate(items, { panelHeightPx: 100, spacingPx: 10 });
    expect(panels).toEqual([[0], [1], [2]]);
    // The container's index appears in exactly one panel, alone.
    const panelsWithColumns = panels.filter((p) => p.includes(1));
    expect(panelsWithColumns).toHaveLength(1);
    expect(panelsWithColumns[0]).toEqual([1]);
  });

  it('puts everything in one panel when it all fits', () => {
    const items = [item(10), item(10), item(10)];
    const panels = paginate(items, { panelHeightPx: 100, spacingPx: 5 });
    expect(panels).toEqual([[0, 1, 2]]);
  });
});
