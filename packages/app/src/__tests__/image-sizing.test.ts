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
    snapWidthFraction,
    widthAttrLabel,
    widthFractionToAttr,
} from '../editor/imageSizing';

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

describe('widthFractionToAttr', () => {
    it('stores full width as null (the schema default spelling)', () => {
        expect(widthFractionToAttr(1)).toBeNull();
        expect(widthFractionToAttr(0.995)).toBeNull();
    });

    it('keeps partial widths as-is', () => {
        expect(widthFractionToAttr(0.5)).toBe(0.5);
        expect(widthFractionToAttr(0.33)).toBe(0.33);
    });
});

describe('widthAttrLabel', () => {
    it('formats fractions and the null default', () => {
        expect(widthAttrLabel(0.33)).toBe('33%');
        expect(widthAttrLabel(0.5)).toBe('50%');
        expect(widthAttrLabel(null)).toBe('100%');
    });
});
