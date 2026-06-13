// =============================================================================
// image-sizing.test.ts — pure math behind the image width controls (Drop 3)
// -----------------------------------------------------------------------------
// Shared by the popover chips and the preview drag-handles; the drag gesture
// itself needs a real browser (human GUI pass), these pin the values it
// commits.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
    MAX_HEIGHT_REM,
    MIN_HEIGHT_REM,
    MIN_WIDTH_FRACTION,
    pxToRem,
    snapHeightRem,
    snapWidthFraction,
    widthAttrLabel,
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

describe('snapHeightRem', () => {
    it('snaps to half-rem steps', () => {
        expect(snapHeightRem(7.3, true)).toBe(7.5);
        expect(snapHeightRem(12.1, true)).toBe(12);
    });

    it('rounds finely when snapping is off (Alt held)', () => {
        expect(snapHeightRem(7.34, false)).toBe(7.3);
    });

    it('clamps into [min, max]', () => {
        expect(snapHeightRem(0.2, true)).toBe(MIN_HEIGHT_REM);
        expect(snapHeightRem(500, true)).toBe(MAX_HEIGHT_REM);
    });
});

describe('pxToRem', () => {
    it('divides by the root font size, defaulting 16 on degenerate input', () => {
        expect(pxToRem(160, 16)).toBe(10);
        expect(pxToRem(160, 0)).toBe(10);
    });
});
