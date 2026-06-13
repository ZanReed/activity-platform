import { describe, it, expect } from 'vitest';
import {
    CELL_MIN_HEIGHT_MAX_REM,
    CELL_MIN_HEIGHT_MIN_REM,
    clampCellMinHeight,
    widthPresetOrder,
    presetToWidths,
    detectWidthPreset,
} from '../editor/extensions/Columns';

describe('clampCellMinHeight (Drop 4 — reserved work space)', () => {
    it('passes through in-bounds values, stripping float artifacts', () => {
        expect(clampCellMinHeight(8)).toBe(8);
        expect(clampCellMinHeight(7.3000000001)).toBe(7.3);
    });

    it('clamps into the [min, max] rem bounds', () => {
        expect(clampCellMinHeight(0.2)).toBe(CELL_MIN_HEIGHT_MIN_REM);
        expect(clampCellMinHeight(500)).toBe(CELL_MIN_HEIGHT_MAX_REM);
    });
});

describe('widthPresetOrder', () => {
    it('offers even / wide-left / wide-right for 2 columns', () => {
        expect(widthPresetOrder(2)).toEqual(['even', 'wide-left', 'wide-right']);
    });

    it('adds wide-center and the narrow-* options for 3 columns', () => {
        expect(widthPresetOrder(3)).toEqual([
            'even',
            'wide-left',
            'wide-center',
            'wide-right',
            'narrow-left',
            'narrow-center',
            'narrow-right',
        ]);
    });

    it('is even-only for 4–6 columns (nothing to cycle)', () => {
        expect(widthPresetOrder(4)).toEqual(['even']);
        expect(widthPresetOrder(5)).toEqual(['even']);
        expect(widthPresetOrder(6)).toEqual(['even']);
    });
});

describe('presetToWidths', () => {
    it('even stores no explicit weights (all null = equal split)', () => {
        expect(presetToWidths(2, 'even')).toEqual([null, null]);
        expect(presetToWidths(3, 'even')).toEqual([null, null, null]);
    });

    it('emphasises the correct column with a single weight of 2', () => {
        expect(presetToWidths(2, 'wide-left')).toEqual([2, null]);
        expect(presetToWidths(2, 'wide-right')).toEqual([null, 2]);
        expect(presetToWidths(3, 'wide-left')).toEqual([2, null, null]);
        expect(presetToWidths(3, 'wide-center')).toEqual([null, 2, null]);
        expect(presetToWidths(3, 'wide-right')).toEqual([null, null, 2]);
    });

    it('narrows the correct column with a single weight of 0.5', () => {
        expect(presetToWidths(3, 'narrow-left')).toEqual([0.5, null, null]);
        expect(presetToWidths(3, 'narrow-center')).toEqual([null, 0.5, null]);
        expect(presetToWidths(3, 'narrow-right')).toEqual([null, null, 0.5]);
    });
});

describe('detectWidthPreset', () => {
    it('reads back the preset that presetToWidths wrote (round-trip)', () => {
        for (const count of [2, 3]) {
            for (const preset of widthPresetOrder(count)) {
                expect(detectWidthPreset(presetToWidths(count, preset))).toBe(
                    preset,
                );
            }
        }
    });

    it('treats all-null / all-equal weights as even', () => {
        expect(detectWidthPreset([null, null])).toBe('even');
        expect(detectWidthPreset([1, 1, 1])).toBe('even');
    });

    it('picks the largest weight as the emphasised (wide) column', () => {
        expect(detectWidthPreset([3, 1])).toBe('wide-left');
        expect(detectWidthPreset([1, 5, 2])).toBe('wide-center');
    });

    it('detects a below-baseline column as narrow when none is wide', () => {
        expect(detectWidthPreset([0.5, null, null])).toBe('narrow-left');
        expect(detectWidthPreset([null, 0.5, null])).toBe('narrow-center');
        expect(detectWidthPreset([null, null, 0.5])).toBe('narrow-right');
    });

    it('prefers a wide column over a narrow one when both appear', () => {
        // Arbitrary imported weights; wide wins so the next pick normalises it.
        expect(detectWidthPreset([0.5, 3, 1])).toBe('wide-center');
    });
});
