// =============================================================================
// image-sizing.test.ts — pure math behind the image width controls (Drop 3)
// -----------------------------------------------------------------------------
// Shared by the popover chips and the preview drag-handles; the drag gesture
// itself needs a real browser (human GUI pass), these pin the values it
// commits.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
    MIN_WIDTH_FRACTION,
    dragWidthFraction,
    snapWidthFraction,
    widthAttrLabel,
} from '../editor/imageSizing';

// SZ-J2a — the growth-factor branch is the ImageView-refactor regression risk
// (centered images grow on both sides = 2x). Now a pure fn in the shared hook's
// math, so the branch is unit-testable without a live pointer.
describe('dragWidthFraction (growth-factor branch)', () => {
    const CONTAINER = 400; // px
    const START = 200; // px (block currently 50% of container)

    it('a left/right-aligned block grows one-for-one with pointer travel', () => {
        // growthFactor 1: +100px travel → 300/400 = 0.75.
        expect(dragWidthFraction(START, 100, 1, CONTAINER)).toBeCloseTo(0.75);
    });

    it('a centered block grows at DOUBLE the pointer travel', () => {
        // growthFactor 2: +100px travel → (200 + 200)/400 = 1.0. THE regression
        // guard — a refactor that drops growthFactor:2 makes this 0.75.
        expect(dragWidthFraction(START, 100, 2, CONTAINER)).toBeCloseTo(1.0);
    });

    it('shrinking (negative travel) also honors the growth factor', () => {
        expect(dragWidthFraction(START, -50, 1, CONTAINER)).toBeCloseTo(0.375);
        expect(dragWidthFraction(START, -50, 2, CONTAINER)).toBeCloseTo(0.25);
    });

    it('a non-positive container width falls back to full (1)', () => {
        expect(dragWidthFraction(START, 100, 2, 0)).toBe(1);
        expect(dragWidthFraction(START, 100, 2, -10)).toBe(1);
    });
});

describe('snapWidthFraction', () => {
    it('snaps to the chip stops within tolerance', () => {
        expect(snapWidthFraction(0.48, true)).toBe(0.5);
        expect(snapWidthFraction(0.34, true)).toBe(0.33);
        expect(snapWidthFraction(0.64, true)).toBe(0.66);
        expect(snapWidthFraction(0.98, true)).toBe(1);
    });

    it('passes through (rounded) between stops', () => {
        expect(snapWidthFraction(0.4231, true)).toBe(0.42);
        expect(snapWidthFraction(0.58, true)).toBe(0.58);
    });

    it('does not snap when snapping is off (Alt held)', () => {
        expect(snapWidthFraction(0.48, false)).toBe(0.48);
    });

    it('clamps into [min, 1]', () => {
        expect(snapWidthFraction(0.01, true)).toBe(MIN_WIDTH_FRACTION);
        expect(snapWidthFraction(1.7, true)).toBe(1);
        expect(snapWidthFraction(-3, false)).toBe(MIN_WIDTH_FRACTION);
    });
});

describe('width 1 is a real value (fill the container)', () => {
    // Auto (null = natural size, never upscaled) and 100% (explicit fill)
    // are distinct: a drag near the right edge snaps to a stored width of 1,
    // and only the popover's Auto chip returns to natural sizing.
    it('a drag near full width snaps to exactly 1, not null', () => {
        expect(snapWidthFraction(0.98, true)).toBe(1);
    });
});

describe('widthAttrLabel', () => {
    it('formats fractions and the null default', () => {
        expect(widthAttrLabel(0.33)).toBe('33%');
        expect(widthAttrLabel(0.5)).toBe('50%');
        expect(widthAttrLabel(null)).toBe('100%');
    });
});

// The height (rem) math was removed with the fixed-height feature (crop
// replaces it — docs/design/image-crop.md).
