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

    it('a numeric unit: clause peels canonical unit + comma alternates', () => {
        expect(parseBlankSpec('=1.5 unit: km/h', '')).toMatchObject({
            canonical: '1.5',
            answerType: 'numeric',
            unit: 'km/h',
        });
        expect(parseBlankSpec('=1.5 unit: km/h, kph', '')).toMatchObject({
            canonical: '1.5',
            unit: 'km/h',
            acceptableUnits: ['kph'],
        });
    });

    it('the unit clause is peeled BEFORE the end-anchored tolerance', () => {
        expect(parseBlankSpec('=1.5 +- 0.1 unit: km/h', '')).toMatchObject({
            canonical: '1.5',
            tolerance: 0.1,
            unit: 'km/h',
        });
    });

    it('unit: stays literal text on text and math blanks', () => {
        expect(parseBlankSpec('per unit: cost', '')).toMatchObject({
            canonical: 'per unit: cost',
            answerType: 'text',
        });
        const math = parseBlankSpec('==2a unit: m', '');
        expect(math).toMatchObject({ answerType: 'math' });
        expect(math?.unit).toBeUndefined();
    });

    it('an empty unit clause warns and is dropped', () => {
        const spec = parseBlankSpec('=1.5 unit:  ', '');
        expect(spec).toMatchObject({ canonical: '1.5' });
        expect(spec?.unit).toBeUndefined();
        expect(
            spec?.warnings.some((w) => w.includes('unit')),
        ).toBe(true);
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

    it('carries the unit + alternates', () => {
        expect(
            blankAttrsFromSpec(parseBlankSpec('=1.5 unit: km/h, kph', '')!),
        ).toMatchObject({
            answer: '1.5',
            answerType: 'numeric',
            unit: 'km/h',
            acceptableUnits: ['kph'],
        });
        // Absent, never present-and-empty — round-trip parity for plain blanks.
        const plain = blankAttrsFromSpec(parseBlankSpec('=12', '')!);
        expect('unit' in plain).toBe(false);
        expect('acceptableUnits' in plain).toBe(false);
    });
});

describe('misconception bindings (the sensor grammar)', () => {
    // The binding is PATTERN-decided, not positional (DX review X1): the last
    // `::`-segment is the id when it looks like one, wherever it sits. The
    // first design made it "the third segment", which left an id-without-
    // feedback unspellable — authors wrote the natural two-segment form and
    // silently shipped a raw taxonomy string for students to read.
    const spec = (alts: string) => parseBlankSpec('12', alts);

    it('binds an id after feedback text', () => {
        const s = spec('|!21 :: digits reversed :: mis.place-value.digit-reversal');
        expect(s?.mistakes).toEqual([
            {
                match: '21',
                feedbackText: 'digits reversed',
                misconceptionId: 'mis.place-value.digit-reversal',
            },
        ]);
        expect(s?.warnings).toEqual([]);
    });

    it('binds an id with NO feedback text (the elision the old grammar could not spell)', () => {
        const s = spec('|!21 :: mis.place-value.digit-reversal');
        expect(s?.mistakes).toEqual([
            {
                match: '21',
                feedbackText: '',
                misconceptionId: 'mis.place-value.digit-reversal',
            },
        ]);
        expect(s?.warnings).toEqual([]);
    });

    it('leaves feedback alone when no segment looks like an id', () => {
        const s = spec('|!21 :: you reversed the digits');
        expect(s?.mistakes[0]).toEqual({
            match: '21',
            feedbackText: 'you reversed the digits',
        });
    });

    it('WARNS on an id-shaped token that is not a valid id, and keeps it visible', () => {
        // The likeliest AI failure: a prefix typo. Under the ratified rule this
        // was silent (it does not start with `mis.`), so a student would read
        // "Check your work. msi.roc.uses-endpoint-value" after checking.
        const s = spec('|!21 :: Check your work. :: msi.roc.uses-endpoint-value');
        expect(s?.mistakes[0]?.misconceptionId).toBeUndefined();
        expect(s?.mistakes[0]?.feedbackText).toContain('msi.roc.uses-endpoint-value');
        expect(s?.warnings.join(' ')).toContain('msi.roc.uses-endpoint-value');
        expect(s?.warnings.join(' ')).toContain('looks like a misconception id');
    });

    it('does NOT warn on ordinary prose that happens to contain dots', () => {
        for (const prose of [
            '!21 :: Check the ratio, e.g. 3:1 vs 1:3',
            '!21 :: The answer is 3.14, not 3.41',
            '!21 :: Try again.',
        ]) {
            const s = spec(`|${prose}`);
            expect(s?.warnings, prose).toEqual([]);
            expect(s?.mistakes[0]?.misconceptionId, prose).toBeUndefined();
        }
    });

    it('still rejects a mistake segment with neither feedback nor a binding', () => {
        const s = spec('|!21 :: ');
        expect(s?.mistakes).toEqual([]);
        expect(s?.warnings.join(' ')).toContain('needs feedback');
    });
});
