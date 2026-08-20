// =============================================================================
// workSpaceUnits.test.ts — "3 lines" / "1in" / "2.5cm" → rem
// -----------------------------------------------------------------------------
// The two physical conversions are DEFINITIONS (CSS fixes 1in at 96px and the
// root font-size at 16px), so they are asserted exactly. REM_PER_LINE is a
// judgement, so it is asserted THROUGH the constant rather than against a
// literal — a test that hardcoded 6 would fail the day someone deliberately
// re-tuned the line height, which is a change the module explicitly invites.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
    describeWorkSpace,
    parseWorkSpace,
    REM_PER_LINE,
} from '../lib/workSpaceUnits';

describe('parseWorkSpace', () => {
    it('reads lines, the unit the doc leads with', () => {
        expect(parseWorkSpace('3 lines')).toBe(3 * REM_PER_LINE);
        expect(parseWorkSpace('1 line')).toBe(REM_PER_LINE);
        expect(parseWorkSpace('3lines')).toBe(3 * REM_PER_LINE);
        expect(parseWorkSpace('  2 LINES  ')).toBe(2 * REM_PER_LINE);
    });

    it('reads inches exactly — 1in is 96px over a 16px root', () => {
        expect(parseWorkSpace('1in')).toBe(6);
        expect(parseWorkSpace('1 inch')).toBe(6);
        expect(parseWorkSpace('0.5 inches')).toBe(3);
    });

    it('reads centimetres and millimetres exactly', () => {
        // 96 / 2.54 / 16 = 2.3622047…, rounded to 3dp by the module.
        expect(parseWorkSpace('1cm')).toBe(2.362);
        expect(parseWorkSpace('2.5cm')).toBe(5.906);
        expect(parseWorkSpace('10mm')).toBe(parseWorkSpace('1cm'));
    });

    it('treats a bare number as rem, so older fences keep their meaning', () => {
        // The back-compat row. ⚙ still displays rem, and any fence written
        // before units existed must not silently change value.
        expect(parseWorkSpace('4')).toBe(4);
        expect(parseWorkSpace('3rem')).toBe(3);
        expect(parseWorkSpace('0.5')).toBe(0.5);
    });

    it('accepts zero — "no space" is a real thing to say', () => {
        expect(parseWorkSpace('0')).toBe(0);
        expect(parseWorkSpace('0 lines')).toBe(0);
    });

    it('rejects what is not a quantity, so the caller can warn', () => {
        // null rather than a fallback number: a silent 0 would look like the
        // author asked for no space, which is a different statement from a typo.
        expect(parseWorkSpace('')).toBeNull();
        expect(parseWorkSpace('lots')).toBeNull();
        expect(parseWorkSpace('3 furlongs')).toBeNull();
        expect(parseWorkSpace('-2')).toBeNull();
        expect(parseWorkSpace('3 lines please')).toBeNull();
    });
});

describe('describeWorkSpace', () => {
    it('describes rem back in lines for help text and warnings', () => {
        expect(describeWorkSpace(0)).toBe('no space');
        expect(describeWorkSpace(REM_PER_LINE)).toBe('about 1 line');
        expect(describeWorkSpace(REM_PER_LINE * 3)).toBe('about 3 lines');
    });

    it('rounds to the half line, the finest distinction worth naming', () => {
        expect(describeWorkSpace(REM_PER_LINE * 1.5)).toBe('about 1.5 lines');
        expect(describeWorkSpace(REM_PER_LINE * 1.1)).toBe('about 1 line');
    });

    it('round-trips a value the fence produced', () => {
        const rem = parseWorkSpace('3 lines');
        expect(rem).not.toBeNull();
        expect(describeWorkSpace(rem!)).toBe('about 3 lines');
    });
});
