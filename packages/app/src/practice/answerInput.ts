// =============================================================================
// answerInput.ts — what a key does to the answer being typed (CR-16, CR-17)
// -----------------------------------------------------------------------------
// The runner has NO editable input element (ER-12, DR-2): the answer is a
// string this module edits, one key at a time, whichever source the key came
// from (a physical key or the in-app keypad). Pure, so the rules are tested
// without a DOM.
//
//   - an answer is digits, an optional leading minus and at most one decimal
//     point (their item 19), at most ANSWER_MAX characters;
//   - "−" (keypad) or "-" (keyboard) TOGGLES the leading minus wherever the
//     student is in the answer;
//   - a second decimal point is ignored;
//   - Enter needs at least one digit (canSubmit).
//
// The stored answer uses ASCII "-"; the answer box shows a true minus (U+2212)
// via displayAnswer.
// =============================================================================

export const ANSWER_MAX = 8;
const TRUE_MINUS = '−';

export type AnswerKey =
    | { kind: 'digit'; digit: string }
    | { kind: 'minus' }
    | { kind: 'point' }
    | { kind: 'back' };

export function applyKey(answer: string, key: AnswerKey): string {
    switch (key.kind) {
        case 'digit':
            return answer.length >= ANSWER_MAX ? answer : answer + key.digit;
        case 'minus':
            if (answer.startsWith('-')) return answer.slice(1);
            return answer.length >= ANSWER_MAX ? answer : `-${answer}`;
        case 'point':
            if (answer.includes('.') || answer.length >= ANSWER_MAX) return answer;
            return answer + '.';
        case 'back':
            return answer.slice(0, -1);
    }
}

/** At least one digit (DR-11: Enter on an empty answer does nothing). */
export function canSubmit(answer: string): boolean {
    return /\d/.test(answer);
}

export function displayAnswer(answer: string): string {
    return answer.replace('-', TRUE_MINUS);
}

/** Keystrokes in a submitted answer (CR-19): every character typed, plus one
 *  for the Enter that submitted it. */
export function keystrokesFor(answer: string): number {
    return answer.length + 1;
}

/**
 * Numeric equality (CR-18): ".5", "0.5" and "0.50" all match an answer of
 * "0.5". Both sides are short decimal strings within ANSWER_MAX, so plain
 * number parsing is exact enough to compare them; a string that is not a
 * number never matches. The SERVER derives the stored `correct` (ER-6); this
 * comparison feeds only the done screen.
 */
export function answersMatch(typed: string, answer: string): boolean {
    if (!canSubmit(typed)) return false;
    const a = Number(typed);
    const b = Number(answer);
    return Number.isFinite(a) && Number.isFinite(b) && a === b;
}

/** Map a physical key to an answer key, or null when the key is not one. */
export function answerKeyFromKeyboard(key: string): AnswerKey | null {
    if (/^[0-9]$/.test(key)) return { kind: 'digit', digit: key };
    if (key === '-' || key === TRUE_MINUS || key === 'Subtract') return { kind: 'minus' };
    if (key === '.' || key === 'Decimal') return { kind: 'point' };
    if (key === 'Backspace') return { kind: 'back' };
    return null;
}
