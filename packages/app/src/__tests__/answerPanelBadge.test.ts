// The answer panel's badge words (progress/AnswerPanel.tsx). Playtest sweep
// 2026-11-12: a D77 optional DoL explanation was badged "To grade" while the
// panel's own count skipped it.
import { describe, expect, it } from 'vitest';
import { verdictWords } from '../progress/AnswerPanel';

describe('answer panel badge', () => {
    it('an ungraded optional explanation is "Optional", never "To grade"', () => {
        expect(verdictWords({ verdict: 'recorded' }, true, false, true).word).toBe('Optional');
        expect(verdictWords({ verdict: 'recorded' }, true, false, false).word).toBe('To grade');
    });
    it('a graded one still says "Graded", optional or not', () => {
        expect(verdictWords({ verdict: 'recorded' }, true, true, true).word).toBe('Graded');
    });
    it('an empty photo answer while photos are off is "Photos off", and a grade still wins (0097)', () => {
        expect(verdictWords({ verdict: 'recorded' }, true, false, false, true).word).toBe('Photos off');
        expect(verdictWords({ verdict: 'recorded' }, true, true, false, true).word).toBe('Graded');
    });
    it('the not-owed rule matches 0097: empty + off + outside a DoL only', async () => {
        const { photoAnswerNotOwed } = await import('../lib/classProgress');
        const empty = { photos: { b: [] } };
        expect(photoAnswerNotOwed('photo_response', 'b', empty, false)).toBe(true);
        expect(photoAnswerNotOwed('photo_response', 'b', {}, false)).toBe(true); // absent = empty
        expect(photoAnswerNotOwed('photo_response', 'b', empty, false, true)).toBe(false); // DoL: retake waits on it
        expect(photoAnswerNotOwed('photo_response', 'b', empty, true)).toBe(false);
        expect(photoAnswerNotOwed('photo_response', 'b', empty, undefined)).toBe(false);
        expect(photoAnswerNotOwed('photo_response', 'b', { photos: { b: [{ id: 'p' }] } }, false)).toBe(false);
        expect(photoAnswerNotOwed('essay', 'b', {}, false)).toBe(false);
    });
    it('machine verdicts win', () => {
        expect(verdictWords({ verdict: 'correct' }, true, false, true).word).toBe('Right');
    });
});
