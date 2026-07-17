import { describe, it, expect } from 'vitest';
import {
    FULL_CROP,
    MIN_CROP,
    canEnterCrop,
    clampRect,
    isFullCrop,
    panRect,
    resizeRect,
    roundRect,
    type CropHandle,
    type Rect,
} from '../editor/cropGeometry';

// ============================================================================
// cropGeometry — the pure crop-frame math (image-crop.md).
// ----------------------------------------------------------------------------
// The load-bearing INPUT side of the feature (the render OUTPUT is pinned in the
// renderer's image-crop.test.ts). Covers CR-M6 (min-size clamp → never 0),
// CR-M7 (coordinate mapping: a known drag → the expected normalized rect),
// CR-INV3 (every result stays in-bounds), CR-INV1/CR-M8 (canEnterCrop gates on
// a real intrinsic size), and the round/full helpers that keep stored crops
// schema-valid.
// ============================================================================

const inBounds = (r: Rect) => {
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.w).toBeGreaterThanOrEqual(MIN_CROP - 1e-9);
    expect(r.h).toBeGreaterThanOrEqual(MIN_CROP - 1e-9);
    expect(r.x + r.w).toBeLessThanOrEqual(1 + 1e-9);
    expect(r.y + r.h).toBeLessThanOrEqual(1 + 1e-9);
};

describe('canEnterCrop (CR-INV1 / CR-M8)', () => {
    it('is false until the source has loaded (null natural size)', () => {
        expect(canEnterCrop(null)).toBe(false);
    });
    it('is false for a 0×0 source (viewBox-less SVG / sizeless data-URI) — CR-M8', () => {
        expect(canEnterCrop({ w: 0, h: 0 })).toBe(false);
        expect(canEnterCrop({ w: 100, h: 0 })).toBe(false);
        expect(canEnterCrop({ w: 0, h: 100 })).toBe(false);
    });
    it('is false for a non-finite size', () => {
        expect(canEnterCrop({ w: Number.NaN, h: 10 })).toBe(false);
        expect(canEnterCrop({ w: Number.POSITIVE_INFINITY, h: 10 })).toBe(false);
    });
    it('is true once a real intrinsic size is known', () => {
        expect(canEnterCrop({ w: 800, h: 400 })).toBe(true);
    });
});

describe('panRect — CR-M7 mapping + CR-INV3 bounds', () => {
    it('translates by the given normalized delta, preserving size', () => {
        // A quarter window at the origin dragged right+down by 0.25/0.10.
        const r = panRect({ x: 0, y: 0, w: 0.5, h: 0.5 }, 0.25, 0.1);
        expect(r).toEqual({ x: 0.25, y: 0.1, w: 0.5, h: 0.5 });
    });
    it('clamps the origin so the window never leaves the source', () => {
        const r = panRect({ x: 0.4, y: 0.4, w: 0.5, h: 0.5 }, 0.5, 0.5);
        // x can move to at most 1 - w = 0.5; same for y.
        expect(r).toEqual({ x: 0.5, y: 0.5, w: 0.5, h: 0.5 });
        inBounds(r);
    });
    it('clamps against the top-left edge too', () => {
        const r = panRect({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 }, -0.5, -0.5);
        expect(r).toEqual({ x: 0, y: 0, w: 0.5, h: 0.5 });
        inBounds(r);
    });
});

describe('resizeRect — CR-M7 mapping, CR-M6 min-size, CR-INV3 bounds', () => {
    it('a corner grip moves the two touching edges (SE grows w & h)', () => {
        const r = resizeRect({ x: 0.2, y: 0.2, w: 0.3, h: 0.3 }, 'se', 0.1, 0.2);
        // left/top pinned; right 0.5→0.6, bottom 0.5→0.7.
        expect(r.x).toBeCloseTo(0.2);
        expect(r.y).toBeCloseTo(0.2);
        expect(r.w).toBeCloseTo(0.4);
        expect(r.h).toBeCloseTo(0.5);
        inBounds(r);
    });
    it('a NW grip moves the origin and shrinks toward SE', () => {
        const r = resizeRect({ x: 0.2, y: 0.2, w: 0.4, h: 0.4 }, 'nw', 0.1, 0.1);
        // right/bottom pinned at 0.6; left/top move to 0.3.
        expect(r.x).toBeCloseTo(0.3);
        expect(r.y).toBeCloseTo(0.3);
        expect(r.w).toBeCloseTo(0.3);
        expect(r.h).toBeCloseTo(0.3);
        inBounds(r);
    });
    it('an edge grip moves only its own axis (E grows w, h untouched)', () => {
        const r = resizeRect({ x: 0.1, y: 0.1, w: 0.3, h: 0.6 }, 'e', 0.2, 0.9);
        expect(r.x).toBeCloseTo(0.1);
        expect(r.y).toBeCloseTo(0.1);
        expect(r.w).toBeCloseTo(0.5);
        expect(r.h).toBeCloseTo(0.6); // dy ignored for an east grip
        inBounds(r);
    });
    it('CR-M6 — shrinking past the minimum clamps w,h to MIN_CROP, never 0', () => {
        // Drag the east edge far left, past the left edge.
        const r = resizeRect({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 }, 'e', -1, 0);
        expect(r.w).toBeCloseTo(MIN_CROP);
        expect(r.w).toBeGreaterThan(0);
        inBounds(r);
    });
    it('CR-INV3 — an outward drag past the edge clamps in-bounds, not out', () => {
        const r = resizeRect({ x: 0.6, y: 0.6, w: 0.3, h: 0.3 }, 'se', 1, 1);
        expect(r.x + r.w).toBeLessThanOrEqual(1 + 1e-9);
        expect(r.y + r.h).toBeLessThanOrEqual(1 + 1e-9);
        inBounds(r);
    });
    it('every handle keeps the rect in-bounds for a large random-ish drag', () => {
        const handles: CropHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        const start: Rect = { x: 0.3, y: 0.3, w: 0.4, h: 0.4 };
        for (const h of handles) {
            for (const [dx, dy] of [
                [2, 2],
                [-2, -2],
                [2, -2],
                [-2, 2],
            ] as const) {
                inBounds(resizeRect(start, h, dx, dy));
            }
        }
    });
});

describe('isFullCrop', () => {
    it('recognizes the full-source window (→ store no crop)', () => {
        expect(isFullCrop(FULL_CROP)).toBe(true);
        expect(isFullCrop({ x: 0.0005, y: 0, w: 0.9995, h: 1 })).toBe(true);
    });
    it('is false for a real sub-rectangle', () => {
        expect(isFullCrop({ x: 0.1, y: 0, w: 0.8, h: 1 })).toBe(false);
        expect(isFullCrop({ x: 0, y: 0, w: 0.5, h: 0.5 })).toBe(false);
    });
});

describe('roundRect keeps a stored crop schema-valid (x+w ≤ 1)', () => {
    it('rounds to 4dp and never pushes the sum past 1', () => {
        // A rect whose independent rounding could nudge x+w over 1.
        const r = roundRect({ x: 0.33338, y: 0.5, w: 0.66665, h: 0.5 });
        expect(r.x + r.w).toBeLessThanOrEqual(1);
        expect(r.y + r.h).toBeLessThanOrEqual(1);
        // Values are 4dp.
        for (const v of Object.values(r)) {
            expect(Number.isFinite(v)).toBe(true);
            expect(v).toBeCloseTo(Math.round(v * 1e4) / 1e4, 10);
        }
    });
});

describe('clampRect backstop', () => {
    it('forces a stray stored rect fully in-bounds with a min size', () => {
        inBounds(clampRect({ x: -0.5, y: 2, w: 5, h: 0 }));
        inBounds(clampRect({ x: 0.9, y: 0.9, w: 0.5, h: 0.5 }));
    });
});
