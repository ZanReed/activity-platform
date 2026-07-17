import { describe, expect, it } from 'vitest';
import {
    DRAWABLE_PALETTE,
    DRAWABLE_PALETTE_KEYS,
    DRAWABLE_DEFAULT_COLOR,
    resolveDrawableColor,
} from '../src/drawable-palette.js';

// ============================================================================
// drawable-palette — the single source of truth for authored drawable colors.
// Guards: every key maps to a hex, the default is a member, and resolution is
// defensive (unknown/absent key -> shared default, never draws nothing).
// ============================================================================

describe('DRAWABLE_PALETTE', () => {
    it('every key maps to a 6-digit hex', () => {
        for (const key of DRAWABLE_PALETTE_KEYS) {
            expect(DRAWABLE_PALETTE[key]).toMatch(/^#[0-9a-f]{6}$/i);
        }
    });

    it('keys array matches the palette object', () => {
        expect(DRAWABLE_PALETTE_KEYS.sort()).toEqual(
            Object.keys(DRAWABLE_PALETTE).sort(),
        );
    });

    it('the default color is one of the palette hexes', () => {
        expect(Object.values(DRAWABLE_PALETTE)).toContain(DRAWABLE_DEFAULT_COLOR);
    });
});

describe('resolveDrawableColor', () => {
    it('resolves a known key to its hex', () => {
        expect(resolveDrawableColor('red')).toBe(DRAWABLE_PALETTE.red);
        expect(resolveDrawableColor('teal')).toBe(DRAWABLE_PALETTE.teal);
    });

    it('falls back to the default for an absent key', () => {
        expect(resolveDrawableColor(undefined)).toBe(DRAWABLE_DEFAULT_COLOR);
        expect(resolveDrawableColor(null)).toBe(DRAWABLE_DEFAULT_COLOR);
    });

    it('falls back to the default for an unknown/stale key (never draws nothing)', () => {
        expect(resolveDrawableColor('chartreuse')).toBe(DRAWABLE_DEFAULT_COLOR);
        expect(resolveDrawableColor('')).toBe(DRAWABLE_DEFAULT_COLOR);
    });
});
