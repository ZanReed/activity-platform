// =============================================================================
// blankSyntax.test.ts — the shared {{…}} grammar (importer + editor input rule)
// -----------------------------------------------------------------------------
// parseBlankSpec is the single source both the markdown importer and the editor's
// live input rule parse blanks with, so the sigils behave identically whether you
// paste or type. Its behaviour through the importer is also covered end to end in
// markdownToTiptap.test.ts; these are the direct unit tests, plus blankAttrsFromSpec
// (the editor's spec → node-attrs mapping with plain-text hint/feedback).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { parseBlankSpec, blankAttrsFromSpec } from '../lib/blankSyntax';

describe('parseBlankSpec', () => {
    it('a plain text answer', () => {
        expect(parseBlankSpec('Paris', '')).toMatchObject({
            canonical: 'Paris',
            answerType: 'text',
            interchangeableWithPrevious: false,
            acceptableAnswers: [],
            hint: null,
            mistakes: [],
        });
    });

    it('pipe alternates', () => {
        expect(
            parseBlankSpec('color', '|colour|colours')?.acceptableAnswers,
        ).toEqual(['colour', 'colours']);
    });

    it('~ marks interchangeable and strips the sigil', () => {
        expect(parseBlankSpec('~3', '')).toMatchObject({
            canonical: '3',
            interchangeableWithPrevious: true,
        });
    });

    it('= is numeric, with an optional +- tolerance', () => {
        expect(parseBlankSpec('=12', '')).toMatchObject({
            canonical: '12',
            answerType: 'numeric',
        });
        expect(parseBlankSpec('=3.14 +- 0.01', '')).toMatchObject({
            canonical: '3.14',
            answerType: 'numeric',
            tolerance: 0.01,
        });
    });

    it('== is math and is checked BEFORE = (not mis-read as numeric)', () => {
        expect(parseBlankSpec('==2a', '')).toMatchObject({
            canonical: '2a',
            answerType: 'math',
        });
    });

    it('~ combines with == (tilde first)', () => {
        expect(parseBlankSpec('~==2a', '')).toMatchObject({
            canonical: '2a',
            answerType: 'math',
            interchangeableWithPrevious: true,
        });
    });

    it('? is a hint', () => {
        expect(parseBlankSpec('Paris', '| ?starts with P')?.hint).toBe(
            'starts with P',
        );
    });

    it('!wrong :: feedback is a mistake pair (split on ::, match may contain =)', () => {
        expect(parseBlankSpec('x', '| !y = 2x :: that graphs a line')?.mistakes).toEqual(
            [{ match: 'y = 2x', feedbackText: 'that graphs a line' }],
        );
    });

    it('?? / !! escape a literal alternate beginning with ? or !', () => {
        expect(parseBlankSpec('a', '| ??x | !!y')?.acceptableAnswers).toEqual([
            '?x',
            '!y',
        ]);
    });

    it('a !wrong with no :: is dropped (never an accepted answer) and warns', () => {
        const s = parseBlankSpec('Paris', '| !Lyon');
        expect(s?.acceptableAnswers).toEqual([]);
        expect(s?.mistakes).toEqual([]);
        expect(s?.warnings.some((w) => w.includes('::'))).toBe(true);
    });

    it('a second hint warns and the last wins', () => {
        const s = parseBlankSpec('a', '| ?first | ?second');
        expect(s?.hint).toBe('second');
        expect(s?.warnings.some((w) => w.includes('one hint'))).toBe(true);
    });

    it('an empty answer is null (kept as literal text by callers)', () => {
        expect(parseBlankSpec('', '')).toBeNull();
        expect(parseBlankSpec('==', '')).toBeNull();
        expect(parseBlankSpec('~', '')).toBeNull();
    });
});

describe('blankAttrsFromSpec (editor node attrs, plain-text feedback)', () => {
    it('maps the scalar attrs and omits absent hint/feedback', () => {
        const attrs = blankAttrsFromSpec(parseBlankSpec('~==2a', '')!);
        expect(attrs).toMatchObject({
            answer: '2a',
            answerType: 'math',
            interchangeableWithPrevious: true,
            acceptableAnswers: [],
        });
        expect(attrs).not.toHaveProperty('hint');
        expect(attrs).not.toHaveProperty('mistakeFeedback');
    });

    it('stores a hint as a plain-text InlineNode[]', () => {
        expect(
            blankAttrsFromSpec(parseBlankSpec('Paris', '| ?starts with P')!).hint,
        ).toEqual([{ type: 'text', text: 'starts with P', marks: [] }]);
    });

    it('stores mistake feedback as plain-text InlineNode[]', () => {
        expect(
            blankAttrsFromSpec(parseBlankSpec('4', '| !3 :: too low')!)
                .mistakeFeedback,
        ).toEqual([
            { match: '3', feedback: [{ type: 'text', text: 'too low', marks: [] }] },
        ]);
    });

    it('carries the numeric tolerance', () => {
        expect(
            blankAttrsFromSpec(parseBlankSpec('=3.14 +- 0.01', '')!),
        ).toMatchObject({ answer: '3.14', answerType: 'numeric', tolerance: 0.01 });
    });
});
