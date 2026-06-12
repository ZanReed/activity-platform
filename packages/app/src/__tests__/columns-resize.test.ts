// =============================================================================
// columns-resize.test.ts — pure math behind the column drag-resize divider
// -----------------------------------------------------------------------------
// The gesture itself (pointer capture, live preview, single-transaction
// commit) needs a real browser and is on the human GUI pass list; these tests
// pin down the weight arithmetic it commits.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
    PAIR_MIN_FRACTION,
    normalizeWeight,
    resizePairWeights,
    snapPairFraction,
} from '../editor/extensions/columnResize';

describe('snapPairFraction', () => {
    it('snaps to a clean stop within tolerance', () => {
        expect(snapPairFraction(0.51, true)).toBe(0.5);
        expect(snapPairFraction(0.345, true)).toBe(1 / 3);
        expect(snapPairFraction(0.73, true)).toBe(0.75);
    });

    it('passes through between stops', () => {
        expect(snapPairFraction(0.42, true)).toBe(0.42);
        expect(snapPairFraction(0.58, true)).toBe(0.58);
    });

    it('does not snap when snapping is off (Alt held)', () => {
        expect(snapPairFraction(0.51, false)).toBe(0.51);
    });

    it('clamps to the minimum-fraction floor on both sides', () => {
        expect(snapPairFraction(0.01, true)).toBe(PAIR_MIN_FRACTION);
        expect(snapPairFraction(0.99, true)).toBe(1 - PAIR_MIN_FRACTION);
        expect(snapPairFraction(-2, false)).toBe(PAIR_MIN_FRACTION);
    });
});

describe('normalizeWeight', () => {
    it('stores ~1 as null (the schema default spelling)', () => {
        expect(normalizeWeight(1)).toBeNull();
        expect(normalizeWeight(0.999)).toBeNull();
        expect(normalizeWeight(1.004)).toBeNull();
    });

    it('rounds everything else to 2 decimals', () => {
        expect(normalizeWeight(4 / 3)).toBe(1.33);
        expect(normalizeWeight(2 / 3)).toBe(0.67);
        expect(normalizeWeight(2)).toBe(2);
    });
});

describe('resizePairWeights', () => {
    // Even 2-col block, each cell 300px: dragging the boundary right by 100px
    // lands at 400/600 = 2/3 — the 2:1 snap stop.
    it('drags an even pair to a clean 2:1 split', () => {
        const [left, right] = resizePairWeights({
            leftWeight: 1,
            rightWeight: 1,
            leftPx: 300,
            pairPx: 600,
            deltaPx: 100,
            snap: true,
        });
        expect(left).toBe(1.33);
        expect(right).toBe(0.67);
        // The pair total survives (1.33 + 0.67 = 2 = the original 1 + 1).
        expect((left ?? 1) + (right ?? 1)).toBeCloseTo(2);
    });

    it('returns to null/null when dragged back to even', () => {
        const [left, right] = resizePairWeights({
            leftWeight: 1.33,
            rightWeight: 0.67,
            leftPx: 400,
            pairPx: 600,
            deltaPx: -95, // lands near 305/600 ≈ 0.508 → snaps to 1/2
            snap: true,
        });
        expect(left).toBeNull();
        expect(right).toBeNull();
    });

    it('preserves the pair total so other columns keep their share', () => {
        // A wide-left 3-col block (2, 1, 1): resizing the RIGHT pair must not
        // change what the left column gets. Pair total stays 1 + 1 = 2.
        const [mid, right] = resizePairWeights({
            leftWeight: 1,
            rightWeight: 1,
            leftPx: 200,
            pairPx: 400,
            deltaPx: 60, // 260/400 = 0.65 → snaps to 2/3
            snap: true,
        });
        expect((mid ?? 1) + (right ?? 1)).toBeCloseTo(2);
    });

    it('Alt (snap off) keeps fine-grained fractions', () => {
        const [left, right] = resizePairWeights({
            leftWeight: 1,
            rightWeight: 1,
            leftPx: 300,
            pairPx: 600,
            deltaPx: 12, // 312/600 = 0.52 — inside snap tolerance of 1/2
            snap: false,
        });
        expect(left).toBe(1.04);
        expect(right).toBe(0.96);
    });

    it('never collapses a cell below the minimum fraction', () => {
        const [left, right] = resizePairWeights({
            leftWeight: 1,
            rightWeight: 1,
            leftPx: 300,
            pairPx: 600,
            deltaPx: -1000,
            snap: true,
        });
        expect(left).toBe(0.3); // 0.15 * pair total 2
        expect(right).toBe(1.7);
    });

    it('is a no-op on a zero-width pair (degenerate layout)', () => {
        const [left, right] = resizePairWeights({
            leftWeight: 2,
            rightWeight: 1,
            leftPx: 0,
            pairPx: 0,
            deltaPx: 50,
            snap: true,
        });
        expect(left).toBe(2);
        // Weight 1 normalizes to null — the schema's default-weight spelling.
        expect(right).toBeNull();
    });
});
