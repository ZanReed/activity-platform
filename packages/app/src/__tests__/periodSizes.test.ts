import { describe, expect, it } from 'vitest';
import type { PeriodShapes } from '../lib/mixedTeacher';
import { periodSizesLine } from '../practice/periodSizes';

const f = { kind: 'fluency', minutes: [5, 5] as [number, number] };
const h = { kind: 'hook', minutes: [2, 3] as [number, number] };
const a = { kind: 'activity', minutes: 'duration_min' };
const m = (lo: number, hi: number) => ({ kind: 'mixed', minutes: [lo, hi] as [number, number] });
// Their PR #90, at 71c74e3.
const SHAPES: PeriodShapes = {
    lengths: {
        '100': [f, h, a, m(12, 12), a, m(12, 12)],
        '50': [f, h, a, m(8, 10)],
        '55': [f, h, a, m(13, 15)],
        '60': [f, h, a, m(18, 20)],
    },
};

describe('periodSizesLine (PA-10)', () => {
    it('matches the sizes the curriculum side gave in C-180, at 90 seconds', () => {
        expect(periodSizesLine(SHAPES, [60, 90], true)).toBe(
            'Suggested: 6 for 50 minutes, 9–10 for 55 minutes, 12–13 for 60 minutes, 8 a block for 100 minutes.',
        );
    });
    it('adds the number facts minutes when number facts are off', () => {
        expect(periodSizesLine(SHAPES, [60, 90], false)).toMatch(/About 3 more with number facts off\.$/);
    });
    it('uses the slower end of the seconds', () => {
        expect(periodSizesLine({ lengths: { '50': [m(10, 10)] } }, [60, 120], true)).toBe(
            'Suggested: 5 for 50 minutes.',
        );
    });
    it('shows nothing until the keys are mirrored', () => {
        expect(periodSizesLine(null, null, true)).toBeNull();
        expect(periodSizesLine(undefined, undefined, true)).toBeNull();
        expect(periodSizesLine(SHAPES, null, true)).toBeNull();
    });
});
