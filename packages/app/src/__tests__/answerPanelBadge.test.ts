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
    it('machine verdicts win', () => {
        expect(verdictWords({ verdict: 'correct' }, true, false, true).word).toBe('Right');
    });
});
